import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("../db", () => ({
  db: {
    schedule: {
      findFirst: vi.fn(),
    },
    scheduleException: {
      findFirst: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
  },
}));

import { getAvailableSlots } from "../availability";
import { db } from "../db";

const mockSchedule = db.schedule.findFirst as ReturnType<typeof vi.fn>;
const mockException = db.scheduleException.findFirst as ReturnType<typeof vi.fn>;
const mockAppointments = db.appointment.findMany as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAvailableSlots", () => {
  it("returns empty array when no schedule exists for the day", async () => {
    mockSchedule.mockResolvedValue(null);

    const slots = await getAvailableSlots(new Date(2026, 6, 13)); // Sunday
    expect(slots).toEqual([]);
  });

  it("returns empty array when day has an exception blocking it", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "18:00",
      maxSlots: 4,
      active: true,
    });
    mockException.mockResolvedValue({ available: false, reason: "Feriado" });

    const slots = await getAvailableSlots(new Date(2026, 6, 14)); // Monday
    expect(slots).toEqual([]);
  });

  it("returns all slots when no appointments exist", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "12:00",
      maxSlots: 4,
      active: true,
    });
    mockException.mockResolvedValue(null);
    mockAppointments.mockResolvedValue([]);

    const slots = await getAvailableSlots(new Date(2026, 6, 14));
    expect(slots).toEqual(["08:00", "09:00", "10:00", "11:00"]);
  });

  it("filters out slots that have reached maxSlots", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "10:00",
      maxSlots: 2,
      active: true,
    });
    mockException.mockResolvedValue(null);
    mockAppointments.mockResolvedValue([
      { timeSlot: "08:00", status: "CONFIRMED" },
      { timeSlot: "08:00", status: "PENDING" },
    ]);

    const slots = await getAvailableSlots(new Date(2026, 6, 14));
    expect(slots).toEqual(["09:00"]);
  });

  it("keeps slots that have appointments below maxSlots", async () => {
    mockSchedule.mockResolvedValue({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "10:00",
      maxSlots: 3,
      active: true,
    });
    mockException.mockResolvedValue(null);
    mockAppointments.mockResolvedValue([
      { timeSlot: "08:00", status: "CONFIRMED" },
    ]);

    const slots = await getAvailableSlots(new Date(2026, 6, 14));
    expect(slots).toEqual(["08:00", "09:00"]);
  });
});
