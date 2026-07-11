import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const passwordHash = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@robertito.com" },
    update: {},
    create: {
      name: "Roberto",
      email: "admin@robertito.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Services
  const services = [
    { name: "Service general", description: "Revisión completa del vehículo", durationMin: 120 },
    { name: "Embrague", description: "Reparación o reemplazo de embrague", durationMin: 180 },
    { name: "Suspensión", description: "Revisión y reparación de suspensión", durationMin: 120 },
    { name: "Diagnóstico", description: "Diagnóstico computarizado", durationMin: 60 },
    { name: "Cambio de aceite y filtro", description: "Cambio de aceite y filtros", durationMin: 60 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { id: service.name.toLowerCase().replace(/\s+/g, "-"), ...service },
    });
  }

  // Default schedule: Mon-Fri 8-18, Sat 8-13
  const weekdaySchedule = { startTime: "08:00", endTime: "18:00", maxSlots: 4, active: true };
  const saturdaySchedule = { startTime: "08:00", endTime: "13:00", maxSlots: 3, active: true };

  for (let day = 1; day <= 5; day++) {
    await prisma.schedule.upsert({
      where: { id: `day-${day}` },
      update: {},
      create: { id: `day-${day}`, dayOfWeek: day, ...weekdaySchedule },
    });
  }

  await prisma.schedule.upsert({
    where: { id: "day-6" },
    update: {},
    create: { id: "day-6", dayOfWeek: 6, ...saturdaySchedule },
  });

  // Settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", autoConfirm: false, shopEmail: "admin@robertito.com" },
  });

  console.log("Seed completed successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
