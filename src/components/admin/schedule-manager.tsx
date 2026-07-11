"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Schedule, ScheduleException } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateSchedule,
  createException,
  deleteException,
} from "@/actions/schedule";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleScheduleSave(
    schedule: Schedule,
    formData: FormData
  ) {
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
    const date = formData.get("date") as string;
    if (!date) return;
    await createException({
      date,
      reason: (formData.get("reason") as string) || undefined,
      available: false,
    });
    router.refresh();
  }

  async function handleDeleteException(id: string) {
    setDeletingId(id);
    await deleteException(id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Horario semanal */}
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
                    handleScheduleSave(
                      schedule,
                      new FormData(e.currentTarget)
                    );
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
                        className="h-4 w-4"
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

      {/* Excepciones */}
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
              <Input
                name="date"
                type="date"
                required
                className="w-auto"
              />
              <Input
                name="reason"
                placeholder="Motivo (opcional)"
                className="w-48"
              />
              <Button
                type="submit"
                className="bg-accent-500 hover:bg-accent-600"
              >
                Agregar
              </Button>
            </form>

            {exceptions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay excepciones cargadas.
              </p>
            ) : (
              <div className="space-y-2">
                {exceptions.map((exc) => (
                  <div
                    key={exc.id}
                    className="flex items-center justify-between rounded border px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">
                        {format(new Date(exc.date), "dd/MM/yyyy", {
                          locale: es,
                        })}
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
                      disabled={deletingId === exc.id}
                      onClick={() => handleDeleteException(exc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
