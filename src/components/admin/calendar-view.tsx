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
  const padding: null[] = new Array(startDay).fill(null) as null[];
  const paddedDays: (Date | null)[] = (padding as (Date | null)[]).concat(
    days as (Date | null)[]
  );

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
