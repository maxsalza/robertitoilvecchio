"use client";

import type { Service } from "@prisma/client";

interface StepServiceProps {
  services: Service[];
  selected: string;
  onSelect: (serviceId: string) => void;
}

export function StepService({ services, selected, onSelect }: StepServiceProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-navy-900">
        ¿Qué servicio necesitás?
      </h2>
      <div className="grid gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              selected === service.id
                ? "border-accent-500 bg-accent-50 ring-2 ring-accent-500"
                : "border-gray-200 hover:border-navy-300"
            }`}
          >
            <p className="font-medium text-navy-900">{service.name}</p>
            {service.description && (
              <p className="mt-1 text-sm text-gray-600">{service.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
