import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Car, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    colorClass: string;
    dotClass: string;
  }
> = {
  PENDING: {
    label: "Pendiente de confirmación",
    colorClass: "bg-amber-50 text-amber-700 border border-amber-200",
    dotClass: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmado",
    colorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dotClass: "bg-emerald-400",
  },
  CANCELLED: {
    label: "Cancelado",
    colorClass: "bg-red-50 text-red-700 border border-red-200",
    dotClass: "bg-red-400",
  },
  COMPLETED: {
    label: "Completado",
    colorClass: "bg-blue-50 text-blue-700 border border-blue-200",
    dotClass: "bg-blue-400",
  },
  NO_SHOW: {
    label: "No se presentó",
    colorClass: "bg-gray-50 text-gray-600 border border-gray-200",
    dotClass: "bg-gray-400",
  },
};

export default async function TurnoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) {
    notFound();
  }

  const statusInfo = STATUS_MAP[appointment.status] || {
    label: appointment.status,
    colorClass: "bg-gray-50 text-gray-600 border border-gray-200",
    dotClass: "bg-gray-400",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white px-4 py-12 md:py-20">
      <div className="mx-auto max-w-lg animate-fade-in-up">

        {/* ── Big checkmark circle ── */}
        <div className="flex justify-center mb-8">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 shadow-xl shadow-emerald-100/60">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-300 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />

            {/* SVG checkmark */}
            <svg
              viewBox="0 0 52 52"
              className="h-14 w-14"
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="26" cy="26" r="24" stroke="#d1fae5" strokeWidth="2" fill="none" />
              <path
                d="M14 26l8 9 16-18"
                className="animate-checkmark"
              />
            </svg>
          </div>
        </div>

        {/* ── Heading ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy-900">
            Turno Registrado
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Guardá esta página para consultar el estado de tu turno.
          </p>
        </div>

        {/* ── Status badge ── */}
        <div className="flex justify-center mb-8">
          <span className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
            statusInfo.colorClass
          )}>
            <span className={cn("h-2 w-2 rounded-full", statusInfo.dotClass)} />
            {statusInfo.label}
          </span>
        </div>

        {/* ── Details card ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">
              Detalles del turno
            </p>
            <p className="mt-0.5 font-bold text-white text-lg">
              {appointment.clientName}
            </p>
          </div>

          {/* Details grid */}
          <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 flex-shrink-0">
                <Wrench className="h-4 w-4 text-navy-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Servicio</p>
                <p className="mt-0.5 font-semibold text-navy-900">{appointment.service.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 flex-shrink-0">
                <Calendar className="h-4 w-4 text-navy-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fecha</p>
                <p className="mt-0.5 font-semibold text-navy-900 capitalize">
                  {format(appointment.date, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 flex-shrink-0">
                <Clock className="h-4 w-4 text-navy-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Horario</p>
                <p className="mt-0.5 font-semibold text-navy-900">{appointment.timeSlot} hs</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 flex-shrink-0">
                <Car className="h-4 w-4 text-navy-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Vehículo</p>
                <p className="mt-0.5 font-semibold text-navy-900">
                  {appointment.vehicleBrand} {appointment.vehicleModel}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-100" />

          {/* ID reference */}
          <div className="px-6 py-4 bg-gray-50/60">
            <p className="text-xs text-gray-400">
              Referencia:{" "}
              <span className="font-mono text-gray-600">{appointment.id}</span>
            </p>
          </div>
        </div>

        {/* ── Action button ── */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-md px-10"
            )}
          >
            Volver al inicio
          </Link>
          <p className="mt-4 text-xs text-gray-400">
            Podés volver a esta página en cualquier momento con el enlace en tu email.
          </p>
        </div>
      </div>
    </div>
  );
}
