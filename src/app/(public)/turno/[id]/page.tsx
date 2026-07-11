import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  CONFIRMED: { label: "Confirmado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  COMPLETED: { label: "Completado", variant: "default" },
  NO_SHOW: { label: "No se presentó", variant: "destructive" },
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
    variant: "outline" as const,
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:py-16">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
            <span className="text-2xl text-navy-900">&#10003;</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">
            Turno Registrado
          </h1>
          <Badge variant={statusInfo.variant} className="mt-2">
            {statusInfo.label}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Servicio</p>
              <p className="font-medium">{appointment.service.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium">
                {format(appointment.date, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Horario</p>
              <p className="font-medium">{appointment.timeSlot}hs</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehículo</p>
              <p className="font-medium">
                {appointment.vehicleBrand} {appointment.vehicleModel}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Guardá esta página para consultar el estado de tu turno.
        </p>
        <div className="mt-4 text-center">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
