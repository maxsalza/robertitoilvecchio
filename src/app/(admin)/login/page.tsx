import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* ── Left: Image panel (hidden on mobile, shown md+) ── */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80"
          alt="Mecánico trabajando"
          fill
          priority
          className="object-cover object-center"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/80 to-navy-950/95" />

        {/* Grid texture */}
        <div className="absolute inset-0 grid-overlay" />

        {/* Red bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-700 via-accent-500 to-accent-700" />

        {/* Content */}
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-500 text-white font-extrabold text-3xl shadow-2xl shadow-accent-900/60">
            R
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Robertito Il Vecchio
          </h1>
          <p className="mt-2 text-navy-300 text-lg tracking-wide">
            Clínica del Automotor
          </p>
          <div className="mt-8 mx-auto h-px w-24 bg-accent-500/60" />
          <p className="mt-6 text-navy-400 text-sm max-w-xs mx-auto leading-relaxed">
            Panel de administración interno. Acceso exclusivo para el equipo de Robertito.
          </p>
        </div>
      </div>

      {/* ── Mobile top banner ── */}
      <div className="relative flex flex-col md:hidden">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80"
            alt="Mecánico trabajando"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-navy-950/85" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white font-extrabold text-xl mb-3">
              R
            </div>
            <h1 className="text-2xl font-extrabold text-white">Robertito Il Vecchio</h1>
            <p className="text-navy-300 text-sm">Clínica del Automotor</p>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900">Bienvenido de vuelta</h2>
            <p className="mt-1 text-gray-500 text-sm">Ingresá tus credenciales para acceder al panel.</p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-gray-400">
            Acceso restringido al equipo autorizado.
          </p>
        </div>
      </div>
    </div>
  );
}
