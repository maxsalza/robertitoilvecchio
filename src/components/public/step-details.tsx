"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientDetails {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  description: string;
}

interface StepDetailsProps {
  details: ClientDetails;
  onChange: (details: ClientDetails) => void;
  errors: Record<string, string>;
}

export function StepDetails({ details, onChange, errors }: StepDetailsProps) {
  function update(field: keyof ClientDetails, value: string) {
    onChange({ ...details, [field]: value });
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">Tus datos</h2>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre completo</Label>
            <Input
              id="clientName"
              value={details.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="Juan Pérez"
            />
            {errors.clientName && (
              <p className="text-sm text-accent-500">{errors.clientName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input
              id="clientPhone"
              value={details.clientPhone}
              onChange={(e) => update("clientPhone", e.target.value)}
              placeholder="11 2345-6789"
            />
            {errors.clientPhone && (
              <p className="text-sm text-accent-500">{errors.clientPhone}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input
            id="clientEmail"
            type="email"
            value={details.clientEmail}
            onChange={(e) => update("clientEmail", e.target.value)}
            placeholder="juan@email.com"
          />
          {errors.clientEmail && (
            <p className="text-sm text-accent-500">{errors.clientEmail}</p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vehicleBrand">Marca del vehículo</Label>
            <Input
              id="vehicleBrand"
              value={details.vehicleBrand}
              onChange={(e) => update("vehicleBrand", e.target.value)}
              placeholder="Ford"
            />
            {errors.vehicleBrand && (
              <p className="text-sm text-accent-500">{errors.vehicleBrand}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Modelo</Label>
            <Input
              id="vehicleModel"
              value={details.vehicleModel}
              onChange={(e) => update("vehicleModel", e.target.value)}
              placeholder="Focus 2.0"
            />
            {errors.vehicleModel && (
              <p className="text-sm text-accent-500">{errors.vehicleModel}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción del problema (opcional)</Label>
          <Textarea
            id="description"
            value={details.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describí brevemente qué le pasa al auto..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
