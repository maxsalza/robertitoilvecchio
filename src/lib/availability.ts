import { db } from "./db";
import { startOfDay, endOfDay } from "date-fns";

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let currentH = startH;
  let currentM = startM;

  while (currentH < endH || (currentH === endH && currentM < endM)) {
    slots.push(
      `${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`
    );
    currentM += 60;
    if (currentM >= 60) {
      currentH += Math.floor(currentM / 60);
      currentM = currentM % 60;
    }
  }

  return slots;
}

export async function getAvailableSlots(date: Date): Promise<string[]> {
  const dayOfWeek = date.getDay();

  // Check if this day has a schedule
  const schedule = await db.schedule.findFirst({
    where: { dayOfWeek, active: true },
  });

  if (!schedule) return [];

  // Check for exceptions on this date
  const exception = await db.scheduleException.findFirst({
    where: {
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });

  if (exception && !exception.available) return [];

  // Get all possible time slots
  const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime);

  // Get existing appointments for this date
  const appointments = await db.appointment.findMany({
    where: {
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  // Count appointments per slot
  const slotCounts = new Map<string, number>();
  for (const apt of appointments) {
    const count = slotCounts.get(apt.timeSlot) || 0;
    slotCounts.set(apt.timeSlot, count + 1);
  }

  // Filter out full slots
  return allSlots.filter((slot) => {
    const count = slotCounts.get(slot) || 0;
    return count < schedule.maxSlots;
  });
}

export async function getAvailableDates(
  month: number,
  year: number
): Promise<{ date: Date; hasSlots: boolean }[]> {
  const results: { date: Date; hasSlots: boolean }[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    // Skip past dates
    if (date < today) continue;

    const slots = await getAvailableSlots(date);
    if (slots.length > 0) {
      results.push({ date, hasSlots: true });
    }
  }

  return results;
}
