import { db } from "@/lib/db";
import { StatsCards } from "@/components/admin/stats-cards";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export const dynamic = "force-dynamic";

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
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
      }),
      db.appointment.count({
        where: { status: "PENDING" },
      }),
      db.appointment.count({
        where: {
          date: { gte: weekStart, lte: weekEnd },
          status: { not: "CANCELLED" },
        },
      }),
      db.appointment.count({
        where: {
          status: "COMPLETED",
          date: { gte: monthStart, lte: monthEnd },
        },
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
        <h2 className="mb-4 text-lg font-semibold text-navy-900">
          Turnos de Hoy
        </h2>
        <AppointmentsTable appointments={todayAppointments} />
      </div>
    </div>
  );
}
