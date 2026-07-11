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

const FROM_ADDRESS = "Robertito Il Vecchio <onboarding@resend.dev>";

export async function sendNewAppointmentEmail(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true },
  });

  if (!appointment) return;

  const settings = await db.settings.findUnique({ where: { id: "default" } });
  const dateStr = format(appointment.date, "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Email to client
  if (appointment.clientEmail) {
    await resend.emails.send({
      from: FROM_ADDRESS,
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
      from: FROM_ADDRESS,
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

  const dateStr = format(appointment.date, "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  await resend.emails.send({
    from: FROM_ADDRESS,
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
