"use server";

import { db } from "@/lib/db";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
import { getAvailableSlots } from "@/lib/availability";
import { revalidatePath } from "next/cache";
import {
  sendNewAppointmentEmail,
  sendStatusChangeEmail,
} from "@/lib/email";

export async function createAppointment(data: AppointmentInput) {
  const parsed = appointmentSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
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

  // Send email notification (fire-and-forget to avoid blocking)
  sendNewAppointmentEmail(appointment.id).catch(console.error);

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

  // Send status change email notification (fire-and-forget to avoid blocking)
  sendStatusChangeEmail(id).catch(console.error);

  return appointment;
}
