"use server";

import { db } from "@/lib/db";
import { serviceSchema, type ServiceInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createService(data: ServiceInput) {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.service.create({ data: parsed.data });
  revalidatePath("/admin/servicios");
  return { success: true };
}

export async function updateService(id: string, data: ServiceInput) {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/servicios");
  return { success: true };
}

export async function toggleService(id: string, active: boolean) {
  await db.service.update({ where: { id }, data: { active } });
  revalidatePath("/admin/servicios");
}
