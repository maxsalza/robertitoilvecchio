export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300">
      {/* Red top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-accent-700 via-accent-500 to-accent-700" />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2">
          {/* Left: Shop info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white font-bold text-lg flex-shrink-0">
                R
              </div>
              <div>
                <p className="font-bold text-white leading-tight">
                  Robertito Il Vecchio
                </p>
                <p className="text-xs text-navy-400 tracking-wide">
                  Clínica del Automotor
                </p>
              </div>
            </div>
            <p className="text-sm text-navy-400 leading-relaxed max-w-xs">
              Taller mecánico con años de experiencia. Profesionalismo y honestidad en cada trabajo.
            </p>
          </div>

          {/* Right: Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-navy-400 mb-4">
              Horarios de Atención
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-navy-300">Lunes a Viernes</span>
                <span className="font-medium text-white">8:00 — 18:00</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-navy-300">Sábados</span>
                <span className="font-medium text-white">8:00 — 13:00</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-navy-300">Domingos</span>
                <span className="text-navy-500">Cerrado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-navy-800 pt-6 text-center text-xs text-navy-500">
          &copy; {new Date().getFullYear()} Robertito Il Vecchio — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
