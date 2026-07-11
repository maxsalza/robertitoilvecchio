"use server";

import { db } from "@/lib/db";
import { scheduleSchema, type ScheduleInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function updateSchedule(id: string, data: ScheduleInput) {
  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.schedule.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function createException(data: {
  date: string;
  available: boolean;
  reason?: string;
}) {
  await db.scheduleException.create({
    data: {
      date: new Date(data.date),
      available: data.available,
      reason: data.reason,
    },
  });
  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function deleteException(id: string) {
  await db.scheduleException.delete({ where: { id } });
  revalidatePath("/admin/horarios");
  return { success: true };
}
