"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createService, updateService } from "@/actions/services";
import type { Service } from "@prisma/client";

interface ServiceFormProps {
  service?: Service;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export function ServiceForm({ service, onClose }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      durationMin: Number(formData.get("durationMin")),
      active: true,
    };

    const result = service
      ? await updateService(service.id, data)
      : await createService(data);

    if (result && "error" in result) {
      setError(result.error ?? "Error desconocido");
      setLoading(false);
    } else {
      setLoading(false);
      router.refresh();
      if (onClose) onClose();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {service ? "Editar Servicio" : "Nuevo Servicio"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${service?.id ?? "new"}`}>Nombre</Label>
            <Input
              id={`name-${service?.id ?? "new"}`}
              name="name"
              defaultValue={service?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`description-${service?.id ?? "new"}`}>
              Descripción
            </Label>
            <Input
              id={`description-${service?.id ?? "new"}`}
              name="description"
              defaultValue={service?.description || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`durationMin-${service?.id ?? "new"}`}>
              Duración (minutos)
            </Label>
            <Input
              id={`durationMin-${service?.id ?? "new"}`}
              name="durationMin"
              type="number"
              defaultValue={service?.durationMin ?? 60}
              min={15}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-navy-900 hover:bg-navy-800"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface ServiceFormToggleProps {
  service?: Service;
}

export function ServiceFormToggle({ service }: ServiceFormToggleProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-navy-700 hover:text-navy-900"
      >
        {service ? "Editar" : null}
      </Button>
    );
  }

  return <ServiceForm service={service} onClose={() => setOpen(false)} />;
}
