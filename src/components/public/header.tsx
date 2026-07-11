import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500 text-white font-bold text-xl">
            R
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-bold leading-tight">Robertito Il Vecchio</p>
            <p className="text-xs text-navy-300">Clínica del Automotor</p>
          </div>
        </Link>
        <Link
          href="/agendar"
          className={cn(buttonVariants({ variant: "default" }), "bg-accent-500 hover:bg-accent-600")}
        >
          Agendar Turno
        </Link>
      </div>
    </header>
  );
}
