"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: {
  autoConfirm: boolean;
  shopEmail: string;
  shopPhone: string;
}) {
  await db.settings.update({
    where: { id: "default" },
    data,
  });
  revalidatePath("/admin/configuracion");
  return { success: true };
}
