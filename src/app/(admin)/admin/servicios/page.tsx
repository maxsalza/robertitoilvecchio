import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ServiceFormToggle } from "@/components/admin/service-form";
import { NewServiceButton } from "@/components/admin/new-service-button";
import { toggleService } from "@/actions/services";
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const services = await db.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Servicios</h1>
        <NewServiceButton />
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`rounded-lg border p-4 ${
              service.active ? "bg-white" : "bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-navy-900">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}
                <p className="text-xs text-gray-400">{service.durationMin} min</p>
              </div>
              <div className="flex items-center gap-2">
                <ServiceFormToggle service={service} />
                <form
                  action={async () => {
                    "use server";
                    await toggleService(service.id, !service.active);
                  }}
                >
                  <Button variant="outline" size="sm" type="submit">
                    {service.active ? "Desactivar" : "Activar"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            No hay servicios cargados. Agregá el primero.
          </p>
        )}
      </div>
    </div>
  );
}
