import { db } from "@/lib/db";
import { ConfigForm } from "@/components/admin/config-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await db.settings.findUnique({ where: { id: "default" } });

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy-900">Configuración</h1>
        <p className="text-gray-500">
          No se encontró configuración. Verificá que la base de datos esté
          inicializada con el seed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Configuración</h1>
      <ConfigForm settings={settings} />
    </div>
  );
}
