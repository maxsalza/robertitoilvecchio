"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "glass-header border-white/10 shadow-lg shadow-navy-950/40"
          : "bg-navy-900 border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-500 text-white font-bold text-xl shadow-md shadow-accent-900/50 group-hover:scale-105 transition-transform duration-200">
            R
          </div>
          <div className="hidden sm:block">
            <p className="text-base font-bold leading-tight text-white tracking-tight">
              Robertito Il Vecchio
            </p>
            <p className="text-xs text-navy-300 tracking-wide">
              Clínica del Automotor
            </p>
          </div>
        </Link>

        <Link
          href="/agendar"
          className={cn(
            buttonVariants({ size: "sm" }),
            "bg-accent-500 hover:bg-accent-400 text-white shadow-md shadow-accent-900/40 font-semibold tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/30 hover:-translate-y-px"
          )}
        >
          Agendar Turno
        </Link>
      </div>
    </header>
  );
}
