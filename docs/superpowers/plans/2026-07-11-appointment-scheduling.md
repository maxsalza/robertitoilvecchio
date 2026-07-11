# Robertito Il Vecchio - Appointment Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fullstack appointment scheduling app for the "Robertito Il Vecchio" mechanic shop, with public booking (no login) and admin panel.

**Architecture:** Single Next.js 15 App Router project. Route groups `(public)` and `(admin)` separate client-facing pages from the admin panel. Server Actions handle all mutations. Prisma ORM with PostgreSQL (Supabase).

**Tech Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL, NextAuth.js v5, Resend, Tailwind CSS v4, shadcn/ui, Zod

## Global Constraints

- Node.js >= 20
- Next.js 15 with App Router (no Pages Router)
- TypeScript strict mode
- All colors use the custom palette: navy `#1a2b5e`, red `#c41e2a`, white `#ffffff`
- Mobile-first responsive design
- All form validation with Zod
- Server Actions for mutations (no custom API routes except auth)
- Spanish language for all user-facing text

---

### Task 1: Project Scaffolding, Database Schema & Seed

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Modify: `tailwind.config.ts` (custom colors)
- Modify: `tsconfig.json` (prisma seed config)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: Prisma client via `db` export from `src/lib/db.ts`; all DB models (User, Service, Schedule, ScheduleException, Appointment); seeded services and default schedule

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/maximilianosalza/Documents/Developments/robertitoilvecchio
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

Expected: Project scaffolded with `src/` directory structure.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client bcryptjs zod date-fns
npm install -D @types/bcryptjs tsx
```

- [ ] **Step 3: Configure Tailwind custom colors**

Edit `src/app/globals.css` to define the custom theme colors:

```css
@import "tailwindcss";

@theme {
  --color-navy-50: #e8ebf2;
  --color-navy-100: #c5cce0;
  --color-navy-200: #9faaca;
  --color-navy-300: #7888b4;
  --color-navy-400: #5a6fa3;
  --color-navy-500: #3d5692;
  --color-navy-600: #344b83;
  --color-navy-700: #293d6f;
  --color-navy-800: #1f305c;
  --color-navy-900: #1a2b5e;
  --color-navy-950: #0e1a3d;

  --color-accent-50: #fce8ea;
  --color-accent-100: #f8c5ca;
  --color-accent-200: #e88d96;
  --color-accent-300: #dc5f6b;
  --color-accent-400: #d43848;
  --color-accent-500: #c41e2a;
  --color-accent-600: #b71926;
  --color-accent-700: #a51220;
  --color-accent-800: #930c1a;
  --color-accent-900: #7a0410;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 4: Initialize Prisma**

```bash
npx prisma init
```

- [ ] **Step 5: Write Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now())
}

model Service {
  id           String        @id @default(cuid())
  name         String
  description  String?
  durationMin  Int           @default(60)
  active       Boolean       @default(true)
  appointments Appointment[]
  createdAt    DateTime      @default(now())
}

model Schedule {
  id        String  @id @default(cuid())
  dayOfWeek Int
  startTime String
  endTime   String
  maxSlots  Int     @default(4)
  active    Boolean @default(true)
}

model ScheduleException {
  id        String   @id @default(cuid())
  date      DateTime
  available Boolean  @default(false)
  reason    String?
}

model Settings {
  id              String  @id @default("default")
  autoConfirm     Boolean @default(false)
  shopName        String  @default("Robertito Il Vecchio")
  shopEmail       String  @default("")
  shopPhone       String  @default("")
}

model Appointment {
  id           String            @id @default(cuid())
  date         DateTime
  timeSlot     String
  status       AppointmentStatus @default(PENDING)
  clientName   String
  clientPhone  String
  clientEmail  String
  vehicleBrand String
  vehicleModel String
  description  String?
  serviceId    String
  service      Service           @relation(fields: [serviceId], references: [id])
  createdBy    CreatedBy         @default(CLIENT)
  notes        String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
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

Note: Added `Settings` model (not in original spec) to persist the auto-confirm toggle and shop contact info.

- [ ] **Step 6: Write Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 7: Write seed file**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const passwordHash = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@robertito.com" },
    update: {},
    create: {
      name: "Roberto",
      email: "admin@robertito.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Services
  const services = [
    { name: "Service general", description: "Revisión completa del vehículo", durationMin: 120 },
    { name: "Embrague", description: "Reparación o reemplazo de embrague", durationMin: 180 },
    { name: "Suspensión", description: "Revisión y reparación de suspensión", durationMin: 120 },
    { name: "Diagnóstico", description: "Diagnóstico computarizado", durationMin: 60 },
    { name: "Cambio de aceite y filtro", description: "Cambio de aceite y filtros", durationMin: 60 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { id: service.name.toLowerCase().replace(/\s+/g, "-"), ...service },
    });
  }

  // Default schedule: Mon-Fri 8-18, Sat 8-13
  const weekdaySchedule = { startTime: "08:00", endTime: "18:00", maxSlots: 4, active: true };
  const saturdaySchedule = { startTime: "08:00", endTime: "13:00", maxSlots: 3, active: true };

  for (let day = 1; day <= 5; day++) {
    await prisma.schedule.upsert({
      where: { id: `day-${day}` },
      update: {},
      create: { id: `day-${day}`, dayOfWeek: day, ...weekdaySchedule },
    });
  }

  await prisma.schedule.upsert({
    where: { id: "day-6" },
    update: {},
    create: { id: "day-6", dayOfWeek: 6, ...saturdaySchedule },
  });

  // Settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", autoConfirm: false, shopEmail: "admin@robertito.com" },
  });

  console.log("Seed completed successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 8: Configure seed command in package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 9: Create `.env` with database URL**

Create `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/robertito?schema=public"
```

Add `.env` to `.gitignore` if not already there.

Create `.env.example`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/robertito?schema=public"
NEXTAUTH_SECRET="generate-a-secret-here"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your_api_key"
SHOP_EMAIL="admin@robertito.com"
```

- [ ] **Step 10: Update root layout with fonts and metadata**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Robertito Il Vecchio - Clínica del Automotor",
  description: "Agendá tu turno en nuestro taller mecánico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 11: Run migration and seed**

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Expected: Database tables created, seed data populated.

- [ ] **Step 12: Verify app starts**

```bash
npm run dev
```

Visit `http://localhost:3000` — should show the default Next.js page.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Next.js 15, Prisma schema, seed data, and custom theme"
```

---

### Task 2: Authentication & Admin Layout

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`
- Create: `src/app/(admin)/login/page.tsx`
- Create: `src/components/admin/login-form.tsx`
- Create: `src/app/(admin)/admin/layout.tsx`
- Create: `src/components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; `User` model from Prisma
- Produces: `auth`, `signIn`, `signOut` from `src/lib/auth.ts`; protected `/admin/*` routes; admin layout with sidebar navigation

- [ ] **Step 1: Install NextAuth**

```bash
npm install next-auth@beta
```

- [ ] **Step 2: Generate NextAuth secret**

```bash
npx auth secret
```

This adds `AUTH_SECRET` to `.env`. Also add `NEXTAUTH_URL=http://localhost:3000` to `.env`.

- [ ] **Step 3: Write auth configuration**

Create `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
```

- [ ] **Step 4: Write auth API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: Write middleware to protect admin routes**

Create `src/middleware.ts`:

```typescript
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isLoggedIn = !!req.auth;

  if (isAdmin && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 6: Install shadcn/ui and base components**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input label card separator sheet
```

- [ ] **Step 7: Write login form component**

Create `src/components/admin/login-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-navy-900">
          Panel de Administración
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@robertito.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-accent-500">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 hover:bg-navy-800"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 8: Write login page**

Create `src/app/(admin)/login/page.tsx`:

```tsx
import { LoginForm } from "@/components/admin/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="flex flex-col items-center gap-8">
        <Image
          src="/logo.png"
          alt="Robertito Il Vecchio"
          width={200}
          height={200}
          priority
        />
        <LoginForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Write admin sidebar**

Create `src/components/admin/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Wrench,
  Clock,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/turnos", label: "Turnos", icon: ClipboardList },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/admin/servicios", label: "Servicios", icon: Wrench },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-navy-700 p-4">
        <h2 className="text-lg font-bold text-white">Robertito</h2>
        <p className="text-sm text-navy-300">Panel de Control</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-navy-700 text-white"
                  : "text-navy-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-navy-700 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-300 transition-colors hover:bg-navy-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-navy-900 p-0">
          <NavContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <aside className="hidden h-screen w-64 flex-shrink-0 bg-navy-900 md:block">
        <NavContent />
      </aside>
    </>
  );
}
```

- [ ] **Step 10: Install lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 11: Write admin layout**

Create `src/app/(admin)/admin/layout.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-16 md:p-8 md:pt-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
```

- [ ] **Step 12: Create placeholder admin dashboard page**

Create `src/app/(admin)/admin/page.tsx`:

```tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Bienvenido al panel de administración.</p>
    </div>
  );
}
```

- [ ] **Step 13: Add logo to public folder**

Copy the provided logo image to `public/logo.png`.

- [ ] **Step 14: Test login flow manually**

```bash
npm run dev
```

1. Visit `http://localhost:3000/admin` → should redirect to `/login`
2. Login with `admin@robertito.com` / `admin123` → should redirect to `/admin`
3. Verify sidebar navigation works
4. Verify logout redirects to `/login`

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth login, admin layout with sidebar, and route protection"
```

---

### Task 3: Zod Validations & Availability Logic

**Files:**
- Create: `src/lib/validations.ts`
- Create: `src/lib/availability.ts`
- Create: `src/lib/__tests__/availability.test.ts`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; Schedule, ScheduleException, Appointment models
- Produces: `appointmentSchema` (Zod) from `src/lib/validations.ts`; `getAvailableSlots(date: Date): Promise<string[]>` and `getAvailableDates(month: number, year: number): Promise<Date[]>` from `src/lib/availability.ts`

- [ ] **Step 1: Write Zod validation schemas**

Create `src/lib/validations.ts`:

```typescript
import { z } from "zod";

export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Seleccioná un servicio"),
  date: z.string().min(1, "Seleccioná una fecha"),
  timeSlot: z.string().min(1, "Seleccioná un horario"),
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientPhone: z.string().min(8, "Ingresá un teléfono válido"),
  clientEmail: z.string().email("Ingresá un email válido"),
  vehicleBrand: z.string().min(1, "Ingresá la marca del vehículo"),
  vehicleModel: z.string().min(1, "Ingresá el modelo del vehículo"),
  description: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const serviceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  durationMin: z.coerce.number().min(15, "Mínimo 15 minutos").max(480, "Máximo 8 horas"),
  active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const scheduleSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  maxSlots: z.coerce.number().min(1, "Mínimo 1 turno"),
  active: z.boolean().default(true),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
```

- [ ] **Step 2: Write availability logic**

Create `src/lib/availability.ts`:

```typescript
import { db } from "./db";
import { startOfDay, endOfDay } from "date-fns";

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let currentH = startH;
  let currentM = startM;

  while (currentH < endH || (currentH === endH && currentM < endM)) {
    slots.push(
      `${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`
    );
    currentM += 60;
    if (currentM >= 60) {
      currentH += Math.floor(currentM / 60);
      currentM = currentM % 60;
    }
  }

  return slots;
}

export async function getAvailableSlots(date: Date): Promise<string[]> {
  const dayOfWeek = date.getDay();

  // Check if this day has a schedule
  const schedule = await db.schedule.findFirst({
    where: { dayOfWeek, active: true },
  });

  if (!schedule) return [];

  // Check for exceptions on this date
  const exception = await db.scheduleException.findFirst({
    where: {
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });

  if (exception && !exception.available) return [];

  // Get all possible time slots
  const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime);

  // Get existing appointments for this date
  const appointments = await db.appointment.findMany({
    where: {
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  // Count appointments per slot
  const slotCounts = new Map<string, number>();
  for (const apt of appointments) {
    const count = slotCounts.get(apt.timeSlot) || 0;
    slotCounts.set(apt.timeSlot, count + 1);
  }

  // Filter out full slots
  return allSlots.filter((slot) => {
    const count = slotCounts.get(slot) || 0;
    return count < schedule.maxSlots;
  });
}

export async function getAvailableDates(
  month: number,
  year: number
): Promise<{ date: Date; hasSlots: boolean }[]> {
  const results: { date: Date; hasSlots: boolean }[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    // Skip past dates
    if (date < today) continue;

    const slots = await getAvailableSlots(date);
    if (slots.length > 0) {
      results.push({ date, hasSlots: true });
    }
  }

  return results;
}
```

- [ ] **Step 3: Write tests for availability logic**

```bash
npm install -D vitest @vitest/coverage-v8
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `src/lib/__tests__/availability.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("../db", () => ({
  db: {
    schedule: {
      findFirst: vi.fn(),
    },
    scheduleException: {
      findFirst: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
  },
}));

import { getAvailableSlots } from "../availability";
import { db } from "../db";

const mockSchedule = db.schedule.findFirst as ReturnType<typeof vi.fn>;
const mockException = db.scheduleException.findFirst as ReturnType<typeof vi.fn>;
const mockAppointments = db.appointment.findMany as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAvailableSlots", () => {
  it("returns empty array when no schedule exists for the day", async () => {
    mockSchedule.mockResolvedValue(null);

    const slots = await getAvailableSlots(new Date(2026, 6, 13)); // Sunday
    expect(slots).toEqual([]);
  });

  it("returns empty array when day has an exception blocking it", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "18:00",
      maxSlots: 4,
      active: true,
    });
    mockException.mockResolvedValue({ available: false, reason: "Feriado" });

    const slots = await getAvailableSlots(new Date(2026, 6, 14)); // Monday
    expect(slots).toEqual([]);
  });

  it("returns all slots when no appointments exist", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "12:00",
      maxSlots: 4,
      active: true,
    });
    mockException.mockResolvedValue(null);
    mockAppointments.mockResolvedValue([]);

    const slots = await getAvailableSlots(new Date(2026, 6, 14));
    expect(slots).toEqual(["08:00", "09:00", "10:00", "11:00"]);
  });

  it("filters out slots that have reached maxSlots", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "10:00",
      maxSlots: 2,
      active: true,
    });
    mockException.mockResolvedValue(null);
    mockAppointments.mockResolvedValue([
      { timeSlot: "08:00", status: "CONFIRMED" },
      { timeSlot: "08:00", status: "PENDING" },
    ]);

    const slots = await getAvailableSlots(new Date(2026, 6, 14));
    expect(slots).toEqual(["09:00"]);
  });

  it("keeps slots that have appointments below maxSlots", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "10:00",
      maxSlots: 3,
      active: true,
    });
    mockException.mockResolvedValue(null);
    mockAppointments.mockResolvedValue([
      { timeSlot: "08:00", status: "CONFIRMED" },
    ]);

    const slots = await getAvailableSlots(new Date(2026, 6, 14));
    expect(slots).toEqual(["08:00", "09:00"]);
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Zod validations, availability logic, and tests"
```

---

### Task 4: Public Landing Page

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/public/header.tsx`
- Create: `src/components/public/footer.tsx`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; `Service` model
- Produces: Public layout wrapping all `(public)` routes; landing page at `/`

- [ ] **Step 1: Write public header**

Create `src/components/public/header.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Robertito Il Vecchio"
            width={48}
            height={48}
          />
          <div className="hidden sm:block">
            <p className="text-lg font-bold leading-tight">Robertito Il Vecchio</p>
            <p className="text-xs text-navy-300">Clínica del Automotor</p>
          </div>
        </Link>
        <Button asChild className="bg-accent-500 hover:bg-accent-600">
          <Link href="/agendar">Agendar Turno</Link>
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Write public footer**

Create `src/components/public/footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="bg-navy-950 py-8 text-navy-300">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm">
        <p className="font-semibold text-white">
          Robertito Il Vecchio — Clínica del Automotor
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Write public layout**

Create `src/app/(public)/layout.tsx`:

```tsx
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Write landing page**

Create `src/app/(public)/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench, Clock, Shield, Phone } from "lucide-react";
import { db } from "@/lib/db";

export default async function HomePage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 px-4 py-16 text-center text-white md:py-24">
        <Image
          src="/logo.png"
          alt="Robertito Il Vecchio"
          width={180}
          height={180}
          className="mx-auto mb-8"
          priority
        />
        <h1 className="text-3xl font-bold md:text-5xl">
          Clínica del Automotor
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-navy-200">
          Taller mecánico de confianza. Agendá tu turno online de forma rápida y
          sencilla.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-accent-500 px-8 text-lg hover:bg-accent-600"
        >
          <Link href="/agendar">Agendar Turno</Link>
        </Button>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
              <Clock className="h-7 w-7 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Turnos Online</h3>
            <p className="mt-2 text-gray-600">
              Agendá tu turno las 24hs sin necesidad de llamar.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
              <Wrench className="h-7 w-7 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Profesionales</h3>
            <p className="mt-2 text-gray-600">
              Mecánicos con años de experiencia y dedicación.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
              <Shield className="h-7 w-7 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Confianza</h3>
            <p className="mt-2 text-gray-600">
              Transparencia y honestidad en cada trabajo.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy-900">
            Nuestros Servicios
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-navy-900">{service.name}</h3>
                {service.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-accent-500 hover:bg-accent-600"
            >
              <Link href="/agendar">Agendar Turno</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Verify landing page renders**

```bash
npm run dev
```

Visit `http://localhost:3000` — should show hero with logo, features section, and services list from DB.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add public layout and landing page with services"
```

---

### Task 5: Public Booking Flow & Appointment Detail

**Files:**
- Create: `src/app/(public)/agendar/page.tsx`
- Create: `src/components/public/booking-wizard.tsx`
- Create: `src/components/public/step-service.tsx`
- Create: `src/components/public/step-date.tsx`
- Create: `src/components/public/step-details.tsx`
- Create: `src/components/public/step-confirm.tsx`
- Create: `src/actions/appointments.ts`
- Create: `src/app/(public)/turno/[id]/page.tsx`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; `getAvailableSlots` from `src/lib/availability.ts`; `appointmentSchema` from `src/lib/validations.ts`; `Service`, `Appointment` models
- Produces: Booking wizard UI at `/agendar`; `createAppointment(data: AppointmentInput): Promise<{ id: string } | { error: string }>` server action; appointment detail page at `/turno/[id]`

- [ ] **Step 1: Install shadcn calendar and select components**

```bash
npx shadcn@latest add calendar select badge textarea
```

- [ ] **Step 2: Write createAppointment server action**

Create `src/actions/appointments.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
import { getAvailableSlots } from "@/lib/availability";
import { revalidatePath } from "next/cache";

export async function createAppointment(data: AppointmentInput) {
  const parsed = appointmentSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { date, timeSlot, serviceId, ...clientData } = parsed.data;
  const appointmentDate = new Date(date);

  // Verify slot is still available
  const availableSlots = await getAvailableSlots(appointmentDate);
  if (!availableSlots.includes(timeSlot)) {
    return { error: "El horario seleccionado ya no está disponible" };
  }

  // Check auto-confirm setting
  const settings = await db.settings.findUnique({ where: { id: "default" } });
  const status = settings?.autoConfirm ? "CONFIRMED" : "PENDING";

  const appointment = await db.appointment.create({
    data: {
      date: appointmentDate,
      timeSlot,
      serviceId,
      status,
      createdBy: "CLIENT",
      ...clientData,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");

  return { id: appointment.id };
}

export async function getAppointment(id: string) {
  return db.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
) {
  const appointment = await db.appointment.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  revalidatePath(`/turno/${id}`);

  return appointment;
}
```

- [ ] **Step 3: Write API route for available slots**

Create `src/app/api/slots/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const date = new Date(dateParam);
  const slots = await getAvailableSlots(date);

  return NextResponse.json({ slots });
}
```

- [ ] **Step 4: Write service selection step**

Create `src/components/public/step-service.tsx`:

```tsx
"use client";

import type { Service } from "@prisma/client";

interface StepServiceProps {
  services: Service[];
  selected: string;
  onSelect: (serviceId: string) => void;
}

export function StepService({ services, selected, onSelect }: StepServiceProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">
        ¿Qué servicio necesitás?
      </h2>
      <div className="grid gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              selected === service.id
                ? "border-accent-500 bg-accent-50 ring-2 ring-accent-500"
                : "border-gray-200 hover:border-navy-300"
            }`}
          >
            <p className="font-medium text-navy-900">{service.name}</p>
            {service.description && (
              <p className="mt-1 text-sm text-gray-600">{service.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write date/time selection step**

Create `src/components/public/step-date.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StepDateProps {
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

export function StepDate({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: StepDateProps) {
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;

    setLoading(true);
    fetch(`/api/slots?date=${date.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoading(false);
      });
  }, [date]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">
        Elegí fecha y horario
      </h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d);
                onSelectDate(d.toISOString());
                onSelectTime("");
              }
            }}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            locale={es}
            className="rounded-md border"
          />
        </div>
        <div className="flex-1">
          {date && (
            <>
              <p className="mb-3 text-sm font-medium text-gray-700">
                Horarios para {format(date, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              {loading ? (
                <p className="text-sm text-gray-500">Cargando horarios...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay horarios disponibles para este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => onSelectTime(slot)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        selectedTime === slot
                          ? "border-accent-500 bg-accent-500 text-white"
                          : "border-gray-200 text-navy-900 hover:border-navy-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write client details step**

Create `src/components/public/step-details.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientDetails {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  description: string;
}

interface StepDetailsProps {
  details: ClientDetails;
  onChange: (details: ClientDetails) => void;
  errors: Record<string, string>;
}

export function StepDetails({ details, onChange, errors }: StepDetailsProps) {
  function update(field: keyof ClientDetails, value: string) {
    onChange({ ...details, [field]: value });
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">Tus datos</h2>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre completo</Label>
            <Input
              id="clientName"
              value={details.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="Juan Pérez"
            />
            {errors.clientName && (
              <p className="text-sm text-accent-500">{errors.clientName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input
              id="clientPhone"
              value={details.clientPhone}
              onChange={(e) => update("clientPhone", e.target.value)}
              placeholder="11 2345-6789"
            />
            {errors.clientPhone && (
              <p className="text-sm text-accent-500">{errors.clientPhone}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input
            id="clientEmail"
            type="email"
            value={details.clientEmail}
            onChange={(e) => update("clientEmail", e.target.value)}
            placeholder="juan@email.com"
          />
          {errors.clientEmail && (
            <p className="text-sm text-accent-500">{errors.clientEmail}</p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vehicleBrand">Marca del vehículo</Label>
            <Input
              id="vehicleBrand"
              value={details.vehicleBrand}
              onChange={(e) => update("vehicleBrand", e.target.value)}
              placeholder="Ford"
            />
            {errors.vehicleBrand && (
              <p className="text-sm text-accent-500">{errors.vehicleBrand}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Modelo</Label>
            <Input
              id="vehicleModel"
              value={details.vehicleModel}
              onChange={(e) => update("vehicleModel", e.target.value)}
              placeholder="Focus 2.0"
            />
            {errors.vehicleModel && (
              <p className="text-sm text-accent-500">{errors.vehicleModel}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción del problema (opcional)</Label>
          <Textarea
            id="description"
            value={details.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describí brevemente qué le pasa al auto..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Write confirmation step**

Create `src/components/public/step-confirm.tsx`:

```tsx
"use client";

import type { Service } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StepConfirmProps {
  service: Service | undefined;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  description: string;
}

export function StepConfirm(props: StepConfirmProps) {
  const dateObj = new Date(props.date);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">
        Confirmá tu turno
      </h2>
      <div className="space-y-4 rounded-lg border bg-gray-50 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Servicio</p>
            <p className="font-medium text-navy-900">{props.service?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha y hora</p>
            <p className="font-medium text-navy-900">
              {format(dateObj, "EEEE d 'de' MMMM, yyyy", { locale: es })} a las{" "}
              {props.timeSlot}hs
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-navy-900">{props.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium text-navy-900">{props.clientPhone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-navy-900">{props.clientEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vehículo</p>
            <p className="font-medium text-navy-900">
              {props.vehicleBrand} {props.vehicleModel}
            </p>
          </div>
        </div>
        {props.description && (
          <div>
            <p className="text-sm text-gray-500">Descripción</p>
            <p className="font-medium text-navy-900">{props.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Write booking wizard**

Create `src/components/public/booking-wizard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { StepService } from "./step-service";
import { StepDate } from "./step-date";
import { StepDetails } from "./step-details";
import { StepConfirm } from "./step-confirm";
import { createAppointment } from "@/actions/appointments";
import { appointmentSchema } from "@/lib/validations";

interface BookingWizardProps {
  services: Service[];
}

const STEP_LABELS = ["Servicio", "Fecha", "Datos", "Confirmar"];

export function BookingWizard({ services }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [details, setDetails] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    vehicleBrand: "",
    vehicleModel: "",
    description: "",
  });

  const selectedService = services.find((s) => s.id === serviceId);

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!serviceId;
      case 1: return !!date && !!timeSlot;
      case 2: {
        const result = appointmentSchema.safeParse({
          serviceId,
          date,
          timeSlot,
          ...details,
        });
        return result.success;
      }
      default: return true;
    }
  }

  function handleNext() {
    if (step === 2) {
      const result = appointmentSchema.safeParse({
        serviceId,
        date,
        timeSlot,
        ...details,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await createAppointment({
      serviceId,
      date,
      timeSlot,
      ...details,
    });

    if ("error" in result) {
      setErrors({ submit: result.error });
      setSubmitting(false);
    } else {
      router.push(`/turno/${result.id}`);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step
                  ? "bg-navy-900 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i <= step ? "text-navy-900 font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className="mx-2 h-px w-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <StepService
          services={services}
          selected={serviceId}
          onSelect={setServiceId}
        />
      )}
      {step === 1 && (
        <StepDate
          selectedDate={date}
          selectedTime={timeSlot}
          onSelectDate={setDate}
          onSelectTime={setTimeSlot}
        />
      )}
      {step === 2 && (
        <StepDetails details={details} onChange={setDetails} errors={errors} />
      )}
      {step === 3 && (
        <StepConfirm
          service={selectedService}
          date={date}
          timeSlot={timeSlot}
          {...details}
        />
      )}

      {/* Error message */}
      {errors.submit && (
        <p className="mt-4 text-center text-sm text-accent-500">
          {errors.submit}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          Anterior
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="bg-navy-900 hover:bg-navy-800"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-accent-500 hover:bg-accent-600"
          >
            {submitting ? "Confirmando..." : "Confirmar Turno"}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Write booking page**

Create `src/app/(public)/agendar/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { BookingWizard } from "@/components/public/booking-wizard";

export const metadata = {
  title: "Agendar Turno - Robertito Il Vecchio",
};

export default async function AgendarPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-2 text-center text-2xl font-bold text-navy-900">
        Agendar Turno
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Completá los pasos para reservar tu turno en el taller.
      </p>
      <BookingWizard services={services} />
    </div>
  );
}
```

- [ ] **Step 10: Write appointment detail page**

Create `src/app/(public)/turno/[id]/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  CONFIRMED: { label: "Confirmado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  COMPLETED: { label: "Completado", variant: "default" },
  NO_SHOW: { label: "No se presentó", variant: "destructive" },
};

export default async function TurnoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) {
    notFound();
  }

  const statusInfo = STATUS_MAP[appointment.status] || {
    label: appointment.status,
    variant: "outline" as const,
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:py-16">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">
            Turno Registrado
          </h1>
          <Badge variant={statusInfo.variant} className="mt-2">
            {statusInfo.label}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Servicio</p>
              <p className="font-medium">{appointment.service.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium">
                {format(appointment.date, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Horario</p>
              <p className="font-medium">{appointment.timeSlot}hs</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehículo</p>
              <p className="font-medium">
                {appointment.vehicleBrand} {appointment.vehicleModel}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Guardá esta página para consultar el estado de tu turno.
        </p>
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Test the full booking flow manually**

```bash
npm run dev
```

1. Go to `http://localhost:3000/agendar`
2. Select a service → Next
3. Pick a date and time → Next
4. Fill in client details → Next
5. Confirm → should redirect to `/turno/[id]`
6. Verify turno page shows correct data

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add booking wizard, appointment creation, and turno detail page"
```

---

### Task 6: Admin Dashboard & Turnos Management

**Files:**
- Modify: `src/app/(admin)/admin/page.tsx`
- Create: `src/app/(admin)/admin/turnos/page.tsx`
- Create: `src/components/admin/stats-cards.tsx`
- Create: `src/components/admin/appointments-table.tsx`
- Create: `src/components/admin/create-appointment-dialog.tsx`
- Create: `src/components/admin/status-actions.tsx`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; `updateAppointmentStatus` and `createAppointment` from `src/actions/appointments.ts`; all Appointment, Service models
- Produces: Admin dashboard at `/admin` with stats; turnos list at `/admin/turnos` with filters and actions

- [ ] **Step 1: Install shadcn table and dialog components**

```bash
npx shadcn@latest add table dialog dropdown-menu tabs
```

- [ ] **Step 2: Write stats cards component**

Create `src/components/admin/stats-cards.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  todayCount: number;
  pendingCount: number;
  weekCount: number;
  completedCount: number;
}

export function StatsCards({
  todayCount,
  pendingCount,
  weekCount,
  completedCount,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Turnos Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-navy-900">{todayCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-accent-500">{pendingCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-navy-900">{weekCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Completados (mes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Write status actions component**

Create `src/components/admin/status-actions.tsx`:

```tsx
"use client";

import { updateAppointmentStatus } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatusActionsProps {
  appointmentId: string;
  currentStatus: string;
}

export function StatusActions({ appointmentId, currentStatus }: StatusActionsProps) {
  const router = useRouter();

  async function handleAction(status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW") {
    await updateAppointmentStatus(appointmentId, status);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === "PENDING" && (
          <DropdownMenuItem onClick={() => handleAction("CONFIRMED")}>
            Confirmar
          </DropdownMenuItem>
        )}
        {(currentStatus === "PENDING" || currentStatus === "CONFIRMED") && (
          <DropdownMenuItem onClick={() => handleAction("CANCELLED")}>
            Cancelar
          </DropdownMenuItem>
        )}
        {currentStatus === "CONFIRMED" && (
          <>
            <DropdownMenuItem onClick={() => handleAction("COMPLETED")}>
              Marcar Completado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("NO_SHOW")}>
              No se presentó
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 4: Write appointments table**

Create `src/components/admin/appointments-table.tsx`:

```tsx
import type { Appointment, Service } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusActions } from "./status-actions";

type AppointmentWithService = Appointment & { service: Service };

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  CONFIRMED: { label: "Confirmado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  COMPLETED: { label: "Completado", variant: "outline" },
  NO_SHOW: { label: "Ausente", variant: "destructive" },
};

interface AppointmentsTableProps {
  appointments: AppointmentWithService[];
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No hay turnos para mostrar.</p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Vehículo</TableHead>
            <TableHead className="hidden md:table-cell">Servicio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => {
            const status = STATUS_BADGES[apt.status];
            return (
              <TableRow key={apt.id}>
                <TableCell>
                  {format(apt.date, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{apt.timeSlot}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{apt.clientName}</p>
                    <p className="text-xs text-gray-500">{apt.clientPhone}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {apt.vehicleBrand} {apt.vehicleModel}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {apt.service.name}
                </TableCell>
                <TableCell>
                  <Badge variant={status?.variant || "outline"}>
                    {status?.label || apt.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusActions
                    appointmentId={apt.id}
                    currentStatus={apt.status}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 5: Update admin dashboard page**

Replace `src/app/(admin)/admin/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { StatsCards } from "@/components/admin/stats-cards";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default async function AdminDashboard() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [todayCount, pendingCount, weekCount, completedCount, todayAppointments] =
    await Promise.all([
      db.appointment.count({
        where: { date: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
      }),
      db.appointment.count({
        where: { status: "PENDING" },
      }),
      db.appointment.count({
        where: { date: { gte: weekStart, lte: weekEnd }, status: { not: "CANCELLED" } },
      }),
      db.appointment.count({
        where: { status: "COMPLETED", date: { gte: monthStart, lte: monthEnd } },
      }),
      db.appointment.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        include: { service: true },
        orderBy: { timeSlot: "asc" },
      }),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
      <StatsCards
        todayCount={todayCount}
        pendingCount={pendingCount}
        weekCount={weekCount}
        completedCount={completedCount}
      />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Turnos de Hoy</h2>
        <AppointmentsTable appointments={todayAppointments} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write turnos list page with filters**

Create `src/app/(admin)/admin/turnos/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import { Prisma } from "@prisma/client";

interface TurnosPageProps {
  searchParams: Promise<{ status?: string; date?: string }>;
}

export default async function TurnosPage({ searchParams }: TurnosPageProps) {
  const params = await searchParams;

  const where: Prisma.AppointmentWhereInput = {};

  if (params.status && params.status !== "ALL") {
    where.status = params.status as any;
  }

  if (params.date) {
    const date = new Date(params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    where.date = { gte: date, lt: nextDay };
  }

  const appointments = await db.appointment.findMany({
    where,
    include: { service: true },
    orderBy: [{ date: "desc" }, { timeSlot: "asc" }],
  });

  const statuses = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
  const statusLabels: Record<string, string> = {
    ALL: "Todos",
    PENDING: "Pendientes",
    CONFIRMED: "Confirmados",
    CANCELLED: "Cancelados",
    COMPLETED: "Completados",
    NO_SHOW: "Ausentes",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Turnos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <a
            key={s}
            href={`/admin/turnos?status=${s}${params.date ? `&date=${params.date}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              (params.status || "ALL") === s
                ? "bg-navy-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {statusLabels[s]}
          </a>
        ))}
      </div>

      <AppointmentsTable appointments={appointments} />
    </div>
  );
}
```

- [ ] **Step 7: Test dashboard and turnos pages**

```bash
npm run dev
```

1. Login to `/admin` → verify dashboard shows stats and today's appointments
2. Navigate to `/admin/turnos` → verify table shows all appointments
3. Use filter buttons → verify filtering works
4. Use status actions dropdown → verify status changes

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add admin dashboard with stats and turnos management page"
```

---

### Task 7: Admin Services, Schedule & Config Pages

**Files:**
- Create: `src/app/(admin)/admin/servicios/page.tsx`
- Create: `src/components/admin/service-form.tsx`
- Create: `src/actions/services.ts`
- Create: `src/app/(admin)/admin/horarios/page.tsx`
- Create: `src/components/admin/schedule-form.tsx`
- Create: `src/actions/schedule.ts`
- Create: `src/app/(admin)/admin/configuracion/page.tsx`
- Create: `src/actions/settings.ts`

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; `serviceSchema`, `scheduleSchema` from `src/lib/validations.ts`
- Produces: CRUD for services at `/admin/servicios`; schedule config at `/admin/horarios`; settings page at `/admin/configuracion`

- [ ] **Step 1: Write services server actions**

Create `src/actions/services.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { serviceSchema, type ServiceInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createService(data: ServiceInput) {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await db.service.create({ data: parsed.data });
  revalidatePath("/admin/servicios");
  return { success: true };
}

export async function updateService(id: string, data: ServiceInput) {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await db.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/servicios");
  return { success: true };
}

export async function toggleService(id: string, active: boolean) {
  await db.service.update({ where: { id }, data: { active } });
  revalidatePath("/admin/servicios");
}
```

- [ ] **Step 2: Write service form component**

Create `src/components/admin/service-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createService, updateService } from "@/actions/services";
import type { Service } from "@prisma/client";

interface ServiceFormProps {
  service?: Service;
  trigger: React.ReactNode;
}

export function ServiceForm({ service, trigger }: ServiceFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      durationMin: Number(formData.get("durationMin")),
      active: true,
    };

    const result = service
      ? await updateService(service.id, data)
      : await createService(data);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={service?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              defaultValue={service?.description || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMin">Duración (minutos)</Label>
            <Input
              id="durationMin"
              name="durationMin"
              type="number"
              defaultValue={service?.durationMin || 60}
              min={15}
              required
            />
          </div>
          {error && <p className="text-sm text-accent-500">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 hover:bg-navy-800"
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Write servicios page**

Create `src/app/(admin)/admin/servicios/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/admin/service-form";
import { toggleService } from "@/actions/services";
import { Plus, Pencil } from "lucide-react";

export default async function ServiciosPage() {
  const services = await db.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Servicios</h1>
        <ServiceForm
          trigger={
            <Button className="bg-navy-900 hover:bg-navy-800">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
            </Button>
          }
        />
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              service.active ? "bg-white" : "bg-gray-50 opacity-60"
            }`}
          >
            <div>
              <p className="font-medium text-navy-900">{service.name}</p>
              {service.description && (
                <p className="text-sm text-gray-600">{service.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {service.durationMin} min
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ServiceForm
                service={service}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              <form
                action={async () => {
                  "use server";
                  await toggleService(service.id, !service.active);
                }}
              >
                <Button variant="outline" size="sm">
                  {service.active ? "Desactivar" : "Activar"}
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write schedule server actions**

Create `src/actions/schedule.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { scheduleSchema, type ScheduleInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function updateSchedule(id: string, data: ScheduleInput) {
  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await db.schedule.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function createException(data: {
  date: string;
  available: boolean;
  reason?: string;
}) {
  await db.scheduleException.create({
    data: {
      date: new Date(data.date),
      available: data.available,
      reason: data.reason,
    },
  });
  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function deleteException(id: string) {
  await db.scheduleException.delete({ where: { id } });
  revalidatePath("/admin/horarios");
  return { success: true };
}
```

- [ ] **Step 5: Write horarios page**

Create `src/app/(admin)/admin/horarios/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { ScheduleManager } from "@/components/admin/schedule-manager";

const DAY_NAMES = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

export default async function HorariosPage() {
  const schedules = await db.schedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  const exceptions = await db.scheduleException.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy-900">Horarios</h1>
      <ScheduleManager
        schedules={schedules}
        exceptions={exceptions}
        dayNames={DAY_NAMES}
      />
    </div>
  );
}
```

- [ ] **Step 6: Write schedule manager component**

Create `src/components/admin/schedule-manager.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Schedule, ScheduleException } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSchedule, createException, deleteException } from "@/actions/schedule";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";

interface ScheduleManagerProps {
  schedules: Schedule[];
  exceptions: ScheduleException[];
  dayNames: string[];
}

export function ScheduleManager({
  schedules,
  exceptions,
  dayNames,
}: ScheduleManagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);

  async function handleScheduleSave(schedule: Schedule, formData: FormData) {
    setSaving(schedule.id);
    await updateSchedule(schedule.id, {
      dayOfWeek: schedule.dayOfWeek,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      maxSlots: Number(formData.get("maxSlots")),
      active: formData.get("active") === "on",
    });
    setSaving(null);
    router.refresh();
  }

  async function handleAddException(formData: FormData) {
    await createException({
      date: formData.get("date") as string,
      reason: formData.get("reason") as string,
      available: false,
    });
    router.refresh();
  }

  async function handleDeleteException(id: string) {
    await deleteException(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Weekly schedule */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-navy-900">
          Horario Semanal
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {dayNames[schedule.dayOfWeek]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleScheduleSave(schedule, new FormData(e.currentTarget));
                  }}
                  className="space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-xs">Desde</Label>
                      <Input
                        name="startTime"
                        defaultValue={schedule.startTime}
                        placeholder="08:00"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Hasta</Label>
                      <Input
                        name="endTime"
                        defaultValue={schedule.endTime}
                        placeholder="18:00"
                      />
                    </div>
                    <div className="w-20">
                      <Label className="text-xs">Turnos</Label>
                      <Input
                        name="maxSlots"
                        type="number"
                        defaultValue={schedule.maxSlots}
                        min={1}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={schedule.active}
                      />
                      Activo
                    </label>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={saving === schedule.id}
                      className="bg-navy-900 hover:bg-navy-800"
                    >
                      {saving === schedule.id ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Exceptions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-navy-900">
          Excepciones (feriados, vacaciones)
        </h2>
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddException(new FormData(e.currentTarget));
                e.currentTarget.reset();
              }}
              className="mb-4 flex flex-wrap gap-3"
            >
              <Input name="date" type="date" required className="w-auto" />
              <Input name="reason" placeholder="Motivo (opcional)" className="w-48" />
              <Button type="submit" className="bg-accent-500 hover:bg-accent-600">
                Agregar
              </Button>
            </form>
            {exceptions.length === 0 ? (
              <p className="text-sm text-gray-500">No hay excepciones cargadas.</p>
            ) : (
              <div className="space-y-2">
                {exceptions.map((exc) => (
                  <div
                    key={exc.id}
                    className="flex items-center justify-between rounded border px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">
                        {format(exc.date, "dd/MM/yyyy", { locale: es })}
                      </span>
                      {exc.reason && (
                        <span className="ml-2 text-sm text-gray-500">
                          — {exc.reason}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteException(exc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-accent-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Write settings server action**

Create `src/actions/settings.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: {
  autoConfirm: boolean;
  shopEmail: string;
  shopPhone: string;
}) {
  await db.settings.update({
    where: { id: "default" },
    data,
  });
  revalidatePath("/admin/configuracion");
  return { success: true };
}
```

- [ ] **Step 8: Write configuracion page**

Create `src/app/(admin)/admin/configuracion/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { ConfigForm } from "@/components/admin/config-form";

export default async function ConfiguracionPage() {
  const settings = await db.settings.findUnique({ where: { id: "default" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Configuración</h1>
      <ConfigForm settings={settings!} />
    </div>
  );
}
```

Create `src/components/admin/config-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "@/actions/settings";

interface ConfigFormProps {
  settings: Settings;
}

export function ConfigForm({ settings }: ConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);

    await updateSettings({
      autoConfirm: formData.get("autoConfirm") === "on",
      shopEmail: formData.get("shopEmail") as string,
      shopPhone: formData.get("shopPhone") as string,
    });

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración General</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoConfirm"
              name="autoConfirm"
              defaultChecked={settings.autoConfirm}
              className="h-4 w-4"
            />
            <Label htmlFor="autoConfirm">
              Confirmar turnos automáticamente (sin aprobación manual)
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopEmail">Email del taller</Label>
            <Input
              id="shopEmail"
              name="shopEmail"
              type="email"
              defaultValue={settings.shopEmail}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopPhone">Teléfono del taller</Label>
            <Input
              id="shopPhone"
              name="shopPhone"
              defaultValue={settings.shopPhone}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-navy-900 hover:bg-navy-800"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            {saved && (
              <p className="text-sm text-green-600">Guardado correctamente</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 9: Test all admin pages**

```bash
npm run dev
```

1. `/admin/servicios` — create, edit, deactivate a service
2. `/admin/horarios` — modify schedule, add/remove exceptions
3. `/admin/configuracion` — toggle auto-confirm, save settings

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add admin services CRUD, schedule management, and settings page"
```

---

### Task 8: Admin Calendar View & Email Notifications

**Files:**
- Create: `src/app/(admin)/admin/calendario/page.tsx`
- Create: `src/components/admin/calendar-view.tsx`
- Create: `src/lib/email.ts`
- Modify: `src/actions/appointments.ts` (add email sending)

**Interfaces:**
- Consumes: `db` from `src/lib/db.ts`; `Appointment`, `Service` models; Resend API key from env
- Produces: Calendar page at `/admin/calendario`; `sendAppointmentEmail(appointmentId: string, type: "new" | "status-change"): Promise<void>` from `src/lib/email.ts`

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Write email utility**

Create `src/lib/email.ts`:

```typescript
import { Resend } from "resend";
import { db } from "./db";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente de confirmación",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

export async function sendNewAppointmentEmail(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true },
  });

  if (!appointment) return;

  const settings = await db.settings.findUnique({ where: { id: "default" } });
  const dateStr = format(appointment.date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Email to client
  if (appointment.clientEmail) {
    await resend.emails.send({
      from: "Robertito Il Vecchio <turnos@robertito.com>",
      to: appointment.clientEmail,
      subject: `Turno ${appointment.status === "CONFIRMED" ? "confirmado" : "registrado"} - ${appointment.service.name}`,
      html: `
        <h2>Tu turno fue registrado</h2>
        <p><strong>Servicio:</strong> ${appointment.service.name}</p>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <p><strong>Horario:</strong> ${appointment.timeSlot}hs</p>
        <p><strong>Estado:</strong> ${STATUS_LABELS[appointment.status] || appointment.status}</p>
        <p><a href="${baseUrl}/turno/${appointment.id}">Ver estado del turno</a></p>
        <hr>
        <p><small>Robertito Il Vecchio - Clínica del Automotor</small></p>
      `,
    });
  }

  // Email to shop
  if (settings?.shopEmail) {
    await resend.emails.send({
      from: "Sistema de Turnos <turnos@robertito.com>",
      to: settings.shopEmail,
      subject: `Nuevo turno: ${appointment.clientName} - ${appointment.service.name}`,
      html: `
        <h2>Nuevo turno registrado</h2>
        <p><strong>Cliente:</strong> ${appointment.clientName}</p>
        <p><strong>Teléfono:</strong> ${appointment.clientPhone}</p>
        <p><strong>Email:</strong> ${appointment.clientEmail}</p>
        <p><strong>Vehículo:</strong> ${appointment.vehicleBrand} ${appointment.vehicleModel}</p>
        <p><strong>Servicio:</strong> ${appointment.service.name}</p>
        <p><strong>Fecha:</strong> ${dateStr} a las ${appointment.timeSlot}hs</p>
        ${appointment.description ? `<p><strong>Descripción:</strong> ${appointment.description}</p>` : ""}
        <p><a href="${baseUrl}/admin/turnos">Ver en el panel</a></p>
      `,
    });
  }
}

export async function sendStatusChangeEmail(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true },
  });

  if (!appointment || !appointment.clientEmail) return;

  const dateStr = format(appointment.date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  await resend.emails.send({
    from: "Robertito Il Vecchio <turnos@robertito.com>",
    to: appointment.clientEmail,
    subject: `Tu turno fue ${STATUS_LABELS[appointment.status]?.toLowerCase() || "actualizado"}`,
    html: `
      <h2>Actualización de tu turno</h2>
      <p><strong>Servicio:</strong> ${appointment.service.name}</p>
      <p><strong>Fecha:</strong> ${dateStr} a las ${appointment.timeSlot}hs</p>
      <p><strong>Nuevo estado:</strong> ${STATUS_LABELS[appointment.status] || appointment.status}</p>
      <p><a href="${baseUrl}/turno/${appointment.id}">Ver detalle</a></p>
      <hr>
      <p><small>Robertito Il Vecchio - Clínica del Automotor</small></p>
    `,
  });
}
```

- [ ] **Step 3: Update appointments actions to send emails**

Add email sending to `src/actions/appointments.ts`. After `db.appointment.create` in `createAppointment`:

```typescript
// At the top, add import:
import { sendNewAppointmentEmail, sendStatusChangeEmail } from "@/lib/email";

// After appointment creation (inside createAppointment, before return):
  // Send email notification (don't await to avoid blocking)
  sendNewAppointmentEmail(appointment.id).catch(console.error);

// Inside updateAppointmentStatus, after the update:
  sendStatusChangeEmail(id).catch(console.error);
```

- [ ] **Step 4: Write calendar view component**

Create `src/components/admin/calendar-view.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Appointment, Service } from "@prisma/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AppointmentWithService = Appointment & { service: Service };

interface CalendarViewProps {
  appointments: AppointmentWithService[];
}

export function CalendarView({ appointments }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start to align with day of week (Monday = 0)
  const startDay = (getDay(monthStart) + 6) % 7; // Convert Sun=0 to Mon=0
  const paddedDays = Array.from({ length: startDay }, () => null).concat(days);

  function getAppointmentsForDay(day: Date) {
    return appointments.filter((apt) => isSameDay(apt.date, day));
  }

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800 line-through",
    COMPLETED: "bg-blue-100 text-blue-800",
  };

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold capitalize text-navy-900">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px text-center text-sm font-medium text-gray-500">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="p-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg border bg-gray-200">
        {paddedDays.map((day, i) => {
          if (!day) {
            return <div key={`pad-${i}`} className="min-h-24 bg-gray-50" />;
          }

          const dayAppointments = getAppointmentsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 bg-white p-1 ${isToday ? "ring-2 ring-inset ring-accent-500" : ""}`}
            >
              <p
                className={`mb-1 text-right text-sm ${
                  isToday ? "font-bold text-accent-500" : "text-gray-700"
                }`}
              >
                {format(day, "d")}
              </p>
              <div className="space-y-0.5">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`truncate rounded px-1 text-xs ${STATUS_COLORS[apt.status] || ""}`}
                  >
                    {apt.timeSlot} {apt.clientName.split(" ")[0]}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{dayAppointments.length - 3} más
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write calendario page**

Create `src/app/(admin)/admin/calendario/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { CalendarView } from "@/components/admin/calendar-view";

export default async function CalendarioPage() {
  const appointments = await db.appointment.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { service: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Calendario</h1>
      <CalendarView appointments={appointments} />
    </div>
  );
}
```

- [ ] **Step 6: Test calendar and emails**

```bash
npm run dev
```

1. `/admin/calendario` — verify monthly calendar renders with appointments
2. Create a new appointment from `/agendar` — check console for email send (will error without Resend API key, that's OK)
3. Change appointment status from admin — check console

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add admin calendar view and email notifications via Resend"
```

---

## Post-Implementation

After all tasks are complete:

1. **Run all tests:** `npm test`
2. **Build check:** `npm run build`
3. **Add logo:** Copy the provided logo to `public/logo.png`
4. **Connect Supabase:** Update `DATABASE_URL` in `.env` with Supabase connection string
5. **Deploy to Vercel:** Connect GitHub repo to Vercel, add env vars
6. **Configure Resend:** Add verified domain and API key
