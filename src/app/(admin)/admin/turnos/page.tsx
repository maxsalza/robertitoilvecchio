import { db } from "@/lib/db";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface TurnosPageProps {
  searchParams: Promise<{ status?: string; date?: string }>;
}

export default async function TurnosPage({ searchParams }: TurnosPageProps) {
  const params = await searchParams;

  const where: Prisma.AppointmentWhereInput = {};

  if (params.status && params.status !== "ALL") {
    where.status = params.status as Prisma.EnumAppointmentStatusFilter;
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

  const statuses = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
  ];

  const statusLabels: Record<string, string> = {
    ALL: "Todos",
    PENDING: "Pendientes",
    CONFIRMED: "Confirmados",
    CANCELLED: "Cancelados",
    COMPLETED: "Completados",
    NO_SHOW: "Ausentes",
  };

  const activeStatus = params.status ?? "ALL";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Turnos</h1>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <a
            key={s}
            href={`/admin/turnos?status=${s}${params.date ? `&date=${params.date}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeStatus === s
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
