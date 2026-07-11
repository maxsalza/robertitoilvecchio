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
