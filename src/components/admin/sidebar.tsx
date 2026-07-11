"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Wrench,
  Clock,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/turnos", label: "Turnos", icon: ClipboardList },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/admin/servicios", label: "Servicios", icon: Wrench },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-navy-700 p-4">
        <h2 className="text-lg font-bold text-white">Robertito</h2>
        <p className="text-sm text-navy-300">Panel de Control</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-navy-700 text-white"
                  : "text-navy-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-navy-700 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-300 transition-colors hover:bg-navy-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="fixed left-4 top-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm shadow-xs hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-navy-900 p-0">
          <NavContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <aside className="hidden h-screen w-64 flex-shrink-0 bg-navy-900 md:block">
        <NavContent />
      </aside>
    </>
  );
}
