import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Wrench, Clock, Shield } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 px-4 py-16 text-center text-white md:py-24">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-accent-500 text-white font-bold text-5xl">
          R
        </div>
        <h1 className="text-3xl font-bold md:text-5xl">
          Clínica del Automotor
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-navy-200">
          Taller mecánico de confianza. Agendá tu turno online de forma rápida y
          sencilla.
        </p>
        <Link
          href="/agendar"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 bg-accent-500 px-8 text-lg hover:bg-accent-600"
          )}
        >
          Agendar Turno
        </Link>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
              <Clock className="h-7 w-7 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Turnos Online</h3>
            <p className="mt-2 text-gray-600">
              Agendá tu turno las 24hs sin necesidad de llamar.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
              <Wrench className="h-7 w-7 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Profesionales</h3>
            <p className="mt-2 text-gray-600">
              Mecánicos con años de experiencia y dedicación.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
              <Shield className="h-7 w-7 text-navy-900" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Confianza</h3>
            <p className="mt-2 text-gray-600">
              Transparencia y honestidad en cada trabajo.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy-900">
            Nuestros Servicios
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-navy-900">{service.name}</h3>
                {service.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/agendar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-accent-500 hover:bg-accent-600"
              )}
            >
              Agendar Turno
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
