import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { Wrench, Clock, Shield, ChevronRight } from "lucide-react";
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
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80"
          alt="Motor de auto"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/80 to-navy-950/90" />

        {/* Grid texture overlay */}
        <div className="absolute inset-0 grid-overlay" />

        {/* Red bottom edge accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-700 via-accent-500 to-accent-700" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-sm font-medium text-accent-300 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            Taller Mecánico de Confianza
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl animate-fade-in-up delay-100">
            Clínica del{" "}
            <span className="text-accent-400">Automotor</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-navy-200 md:text-xl animate-fade-in-up delay-200">
            Mecánicos profesionales con años de experiencia. Agendá tu turno
            online en minutos, sin llamadas, sin esperas.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up delay-300">
            <Link
              href="/agendar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "animate-pulse-glow bg-accent-500 hover:bg-accent-400 text-white px-10 text-lg font-bold shadow-xl shadow-accent-900/50 hover:shadow-accent-500/40 transition-all duration-200 hover:-translate-y-0.5"
              )}
            >
              Agendar Turno
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#servicios"
              className="text-navy-300 hover:text-white underline-offset-4 hover:underline transition-colors text-sm font-medium"
            >
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-navy-900 md:text-4xl">
              ¿Por qué elegirnos?
            </h2>
            <p className="mt-3 text-gray-500">
              Experiencia, honestidad y tecnología al servicio de tu vehículo.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="card-lift rounded-xl border-l-4 border-accent-500 bg-white p-8 shadow-sm ring-1 ring-navy-100">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 shadow-md">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Turnos Online 24/7</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Agendá tu turno en cualquier momento sin necesidad de llamar. Rápido y sencillo.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-lift rounded-xl border-l-4 border-accent-500 bg-white p-8 shadow-sm ring-1 ring-navy-100">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 shadow-md">
                <Wrench className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Mecánicos Profesionales</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Nuestro equipo tiene años de experiencia diagnosticando y resolviendo todo tipo de problemas mecánicos.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-lift rounded-xl border-l-4 border-accent-500 bg-white p-8 shadow-sm ring-1 ring-navy-100">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 shadow-md">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Transparencia Total</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Presupuesto claro antes de empezar. Sin sorpresas, sin letras chicas. Tu confianza es nuestra prioridad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section
        id="servicios"
        className="bg-gradient-to-b from-navy-900 to-navy-950 px-4 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Nuestros Servicios
            </h2>
            <p className="mt-3 text-navy-300">
              Atendemos todo lo que tu vehículo necesita.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="service-card-glow glass-card rounded-xl p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/20">
                  <Wrench className="h-5 w-5 text-accent-400" />
                </div>
                <h3 className="font-bold text-white">{service.name}</h3>
                {service.description && (
                  <p className="mt-2 text-sm text-navy-300 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/agendar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-accent-500 hover:bg-accent-400 text-white px-10 font-bold shadow-lg shadow-accent-900/50 hover:-translate-y-0.5 transition-all duration-200"
              )}
            >
              Agendar un Turno
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-accent-500 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Listos para atenderte hoy
          </h2>
          <p className="mt-3 text-accent-100 text-lg">
            No esperes hasta que el problema sea mayor. Agendá tu turno ahora y dejalo en manos de profesionales.
          </p>
          <Link
            href="/agendar"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 bg-white text-accent-600 hover:bg-accent-50 px-10 text-lg font-bold shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            )}
          >
            Reservar mi Turno
          </Link>
        </div>
      </section>
    </div>
  );
}
