"use client";

import { updateAppointmentStatus } from "@/actions/appointments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatusActionsProps {
  appointmentId: string;
  currentStatus: string;
}

export function StatusActions({
  appointmentId,
  currentStatus,
}: StatusActionsProps) {
  const router = useRouter();

  async function handleAction(
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
  ) {
    await updateAppointmentStatus(appointmentId, status);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none"
        aria-label="Acciones"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === "PENDING" && (
          <DropdownMenuItem onClick={() => handleAction("CONFIRMED")}>
            Confirmar
          </DropdownMenuItem>
        )}
        {(currentStatus === "PENDING" || currentStatus === "CONFIRMED") && (
          <DropdownMenuItem onClick={() => handleAction("CANCELLED")}>
            Cancelar
          </DropdownMenuItem>
        )}
        {currentStatus === "CONFIRMED" && (
          <>
            <DropdownMenuItem onClick={() => handleAction("COMPLETED")}>
              Marcar Completado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("NO_SHOW")}>
              No se presentó
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
