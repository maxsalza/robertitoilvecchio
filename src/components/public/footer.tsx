export function Footer() {
  return (
    <footer className="bg-navy-950 py-8 text-navy-300">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm">
        <p className="font-semibold text-white">
          Robertito Il Vecchio — Clínica del Automotor
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
