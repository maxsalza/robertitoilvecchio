"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/admin/service-form";
import { Plus } from "lucide-react";

export function NewServiceButton() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="w-full max-w-md">
        <ServiceForm onClose={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <Button
      onClick={() => setOpen(true)}
      className="bg-navy-900 hover:bg-navy-800"
    >
      <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
    </Button>
  );
}
