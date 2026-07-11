import { db } from "@/lib/db";
import { ScheduleManager } from "@/components/admin/schedule-manager";

export const dynamic = "force-dynamic";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
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
