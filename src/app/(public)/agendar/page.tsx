import { db } from "@/lib/db";
import { BookingWizard } from "@/components/public/booking-wizard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agendar Turno - Robertito Il Vecchio",
};

export default async function AgendarPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-2 text-center text-2xl font-bold text-navy-900">
        Agendar Turno
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Completá los pasos para reservar tu turno en el taller.
      </p>
      <BookingWizard services={services} />
    </div>
  );
}
