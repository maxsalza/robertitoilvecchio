"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "@/actions/settings";

interface ConfigFormProps {
  settings: Settings;
}

export function ConfigForm({ settings }: ConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await updateSettings({
      autoConfirm: formData.get("autoConfirm") === "on",
      shopEmail: formData.get("shopEmail") as string,
      shopPhone: formData.get("shopPhone") as string,
    });

    setLoading(false);
    if (result && "error" in result) {
      setError(String((result as { error: unknown }).error));
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración General</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoConfirm"
              name="autoConfirm"
              defaultChecked={settings.autoConfirm}
              className="h-4 w-4 accent-navy-900"
            />
            <Label htmlFor="autoConfirm">
              Confirmar turnos automáticamente (sin aprobación manual)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopEmail">Email del taller</Label>
            <Input
              id="shopEmail"
              name="shopEmail"
              type="email"
              defaultValue={settings.shopEmail}
              placeholder="taller@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopPhone">Teléfono del taller</Label>
            <Input
              id="shopPhone"
              name="shopPhone"
              defaultValue={settings.shopPhone}
              placeholder="+54 11 1234-5678"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-navy-900 hover:bg-navy-800"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
            {saved && (
              <p className="text-sm text-green-600">Guardado correctamente</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
