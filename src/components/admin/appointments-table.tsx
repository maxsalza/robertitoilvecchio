import type { Appointment, Service } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusActions } from "./status-actions";

type AppointmentWithService = Appointment & { service: Service };

const STATUS_BADGES: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  CONFIRMED: { label: "Confirmado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  COMPLETED: { label: "Completado", variant: "outline" },
  NO_SHOW: { label: "Ausente", variant: "destructive" },
};

interface AppointmentsTableProps {
  appointments: AppointmentWithService[];
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No hay turnos para mostrar.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Vehículo</TableHead>
            <TableHead className="hidden md:table-cell">Servicio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => {
            const status = STATUS_BADGES[apt.status];
            return (
              <TableRow key={apt.id}>
                <TableCell>
                  {format(new Date(apt.date), "dd/MM/yyyy", { locale: es })}
                </TableCell>
                <TableCell>{apt.timeSlot}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{apt.clientName}</p>
                    <p className="text-xs text-gray-500">{apt.clientPhone}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {apt.vehicleBrand} {apt.vehicleModel}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {apt.service.name}
                </TableCell>
                <TableCell>
                  <Badge variant={status?.variant ?? "outline"}>
                    {status?.label ?? apt.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusActions
                    appointmentId={apt.id}
                    currentStatus={apt.status}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
