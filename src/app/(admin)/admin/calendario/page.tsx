import { db } from "@/lib/db";
import { CalendarView } from "@/components/admin/calendar-view";

export const dynamic = "force-dynamic";

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
