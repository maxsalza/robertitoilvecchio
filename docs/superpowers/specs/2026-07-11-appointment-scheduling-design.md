# Robertito Il Vecchio - Sistema de Agendamiento de Turnos

**Fecha:** 2026-07-11
**Estado:** Aprobado

## Resumen

Aplicación web para el taller mecánico "Clínica del Automotor - Robertito Il Vecchio" que permite a clientes agendar turnos sin necesidad de registrarse, y a Roberto (dueño) gestionar turnos, servicios y horarios desde un panel de administración.

## Arquitectura

**Enfoque:** Next.js 15 fullstack con App Router. Un solo proyecto que sirve la parte pública (agendamiento) y el panel admin, separados por route groups.

### Stack Técnico

| Pieza | Tecnología |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Auth | NextAuth.js v5 (Credentials provider) |
| Emails | Resend |
| UI | Tailwind CSS v4 + shadcn/ui |
| Validación | Zod |
| Calendario | react-day-picker (incluido en shadcn) |

## Estructura del Proyecto

```
robertitoilvecchio/
├── src/
│   ├── app/
│   │   ├── (public)/              # Layout público (cliente)
│   │   │   ├── page.tsx           # Landing + CTA agendar
│   │   │   ├── agendar/
│   │   │   │   └── page.tsx       # Flujo de agendamiento paso a paso
│   │   │   └── turno/[id]/
│   │   │       └── page.tsx       # Confirmación/detalle del turno
│   │   ├── (admin)/               # Layout admin (Roberto)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx       # Dashboard
│   │   │   │   ├── turnos/
│   │   │   │   │   └── page.tsx   # Lista y gestión de turnos
│   │   │   │   ├── calendario/
│   │   │   │   │   └── page.tsx   # Vista calendario
│   │   │   │   ├── servicios/
│   │   │   │   │   └── page.tsx   # ABM de servicios
│   │   │   │   ├── horarios/
│   │   │   │   │   └── page.tsx   # Config horarios y excepciones
│   │   │   │   └── configuracion/
│   │   │   │       └── page.tsx   # Config general
│   │   │   └── login/
│   │   │       └── page.tsx       # Login admin
│   │   ├── api/                   # API routes (auth, emails)
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── public/                # Componentes sitio público
│   │   └── admin/                 # Componentes panel admin
│   ├── lib/
│   │   ├── db.ts                  # Prisma client
│   │   ├── auth.ts                # NextAuth config
│   │   └── email.ts               # Resend config
│   ├── actions/                   # Server Actions
│   │   ├── appointments.ts
│   │   ├── services.ts
│   │   └── schedule.ts
│   └── types/
├── prisma/
│   └── schema.prisma
├── public/
│   └── logo.png
└── package.json
```

## Modelo de Datos

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String
  role          Role      @default(ADMIN)
  createdAt     DateTime  @default(now())
}

model Service {
  id            String        @id @default(cuid())
  name          String
  description   String?
  durationMin   Int           @default(60)
  active        Boolean       @default(true)
  appointments  Appointment[]
  createdAt     DateTime      @default(now())
}

model Schedule {
  id            String    @id @default(cuid())
  dayOfWeek     Int       // 0=Domingo ... 6=Sábado
  startTime     String    // "08:00"
  endTime       String    // "18:00"
  maxSlots      Int       @default(4)
  active        Boolean   @default(true)
}

model ScheduleException {
  id            String    @id @default(cuid())
  date          DateTime
  available     Boolean   @default(false)
  reason        String?
}

model Appointment {
  id            String            @id @default(cuid())
  date          DateTime
  timeSlot      String            // "09:00"
  status        AppointmentStatus @default(PENDING)
  clientName    String
  clientPhone   String
  clientEmail   String
  vehicleBrand  String
  vehicleModel  String
  description   String?
  serviceId     String
  service       Service           @relation(fields: [serviceId], references: [id])
  createdBy     CreatedBy         @default(CLIENT)
  notes         String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

enum Role {
  ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum CreatedBy {
  CLIENT
  ADMIN
}
```

## Flujos de Usuario

### Cliente (público, sin login)

1. **Landing** (`/`) — Presentación del taller con logo, servicios, y botón "Agendar turno"
2. **Agendamiento** (`/agendar`) — Flujo en 4 pasos:
   - Paso 1: Seleccionar tipo de servicio
   - Paso 2: Elegir fecha y horario disponible
   - Paso 3: Datos personales (nombre, teléfono, email, marca/modelo, descripción del problema)
   - Paso 4: Resumen y confirmación
3. **Detalle del turno** (`/turno/[id]`) — El cliente puede ver el estado de su turno volviendo a esta URL

### Admin (Roberto, con login)

1. **Login** (`/login`) — Email + contraseña
2. **Dashboard** (`/admin`) — Turnos de hoy, pendientes de confirmar, próximos turnos
3. **Turnos** (`/admin/turnos`) — Lista con filtros (fecha, estado, servicio). Acciones: confirmar, cancelar, completar, marcar no-show. Crear turnos manualmente.
4. **Calendario** (`/admin/calendario`) — Vista semanal/mensual
5. **Servicios** (`/admin/servicios`) — ABM de tipos de servicio
6. **Horarios** (`/admin/horarios`) — Horarios por día, cantidad de slots, excepciones (feriados, vacaciones)
7. **Configuración** (`/admin/configuracion`) — Modo de confirmación (automático vs manual)

## Disponibilidad de Turnos

- `Schedule` define horarios por día de la semana (ej: Lun-Vie 8-18, Sáb 8-13)
- `maxSlots` controla cuántos turnos se aceptan por franja horaria
- `ScheduleException` permite bloquear fechas específicas (feriados, vacaciones)
- El sistema calcula slots disponibles en base a: horario del día, turnos ya agendados, excepciones

## Confirmación de Turnos

Roberto puede elegir entre dos modos desde configuración:
- **Automático:** El turno queda confirmado al instante
- **Manual:** El turno queda como PENDING y Roberto lo confirma/rechaza desde el panel

## Emails (Resend)

- **Nuevo turno (al cliente):** Confirmación con detalles del turno y link a `/turno/[id]`
- **Nuevo turno (al taller):** Notificación con datos del cliente y servicio
- **Cambio de estado:** Si Roberto confirma/cancela, el cliente recibe email

## Paleta de Colores

Basada en el logo del taller:

| Uso | Color | Hex |
|-----|-------|-----|
| Primario (azul navy) | Fondos, headers | `#1a2b5e` |
| Acento (rojo) | CTAs, highlights | `#c41e2a` |
| Blanco | Fondos, texto sobre oscuro | `#ffffff` |
| Grises | Bordes, backgrounds | Tailwind neutral scale |

## Identidad Visual

- Mobile-first: los clientes probablemente agendan desde el celular
- Sitio público: logo prominente, estética de taller mecánico clásico, azul y rojo
- Panel admin: funcional y limpio, basado en shadcn/ui con la paleta del taller

## Decisiones Técnicas

- **Sin login de cliente:** Los datos del cliente se guardan inline en el appointment. El cliente accede a su turno por URL con ID único.
- **Server Actions:** Para todas las mutaciones (crear turno, confirmar, etc.) en lugar de API routes.
- **Route groups:** `(public)` y `(admin)` para layouts distintos sin afectar URLs.
- **Seed de servicios:** Los servicios iniciales (service general, embrague, suspensión, diagnóstico, cambio de aceite y filtro) se cargan via seed de Prisma.
