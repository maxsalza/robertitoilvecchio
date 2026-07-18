"use client";

import { Wrench, Check } from "lucide-react";
import type { Service } from "@prisma/client";
import { cn } from "@/lib/utils";

interface StepServiceProps {
  services: Service[];
  selected: string;
  onSelect: (serviceId: string) => void;
}

export function StepService({ services, selected, onSelect }: StepServiceProps) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-navy-900">
        ¿Qué servicio necesitás?
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Seleccioná el servicio que querés agendar.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = selected === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={cn(
                "group relative rounded-xl border-2 p-5 text-left transition-all duration-200",
                isSelected
                  ? "border-accent-500 bg-accent-50 shadow-md shadow-accent-100 ring-1 ring-accent-500/30"
                  : "border-gray-200 bg-white hover:border-navy-300 hover:shadow-md hover:scale-[1.02] hover:shadow-navy-100/80"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                  isSelected
                    ? "bg-accent-500 text-white"
                    : "bg-navy-50 text-navy-700 group-hover:bg-navy-100"
                )}
              >
                <Wrench className="h-5 w-5" />
              </div>

              {/* Text */}
              <p
                className={cn(
                  "font-semibold leading-tight",
                  isSelected ? "text-accent-700" : "text-navy-900"
                )}
              >
                {service.name}
              </p>
              {service.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {service.description}
                </p>
              )}

              {/* Selected checkmark badge */}
              {isSelected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-white shadow-sm">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
