"use client";

import type { Service } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StepConfirmProps {
  service: Service | undefined;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  description: string;
}

export function StepConfirm(props: StepConfirmProps) {
  const dateObj = new Date(props.date);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">
        Confirmá tu turno
      </h2>
      <div className="space-y-4 rounded-lg border bg-gray-50 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Servicio</p>
            <p className="font-medium text-navy-900">{props.service?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha y hora</p>
            <p className="font-medium text-navy-900">
              {format(dateObj, "EEEE d 'de' MMMM, yyyy", { locale: es })} a las{" "}
              {props.timeSlot}hs
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-navy-900">{props.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium text-navy-900">{props.clientPhone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-navy-900">{props.clientEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vehículo</p>
            <p className="font-medium text-navy-900">
              {props.vehicleBrand} {props.vehicleModel}
            </p>
          </div>
        </div>
        {props.description && (
          <div>
            <p className="text-sm text-gray-500">Descripción</p>
            <p className="font-medium text-navy-900">{props.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
