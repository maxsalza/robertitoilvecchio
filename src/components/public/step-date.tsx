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
