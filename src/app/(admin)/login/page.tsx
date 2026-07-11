import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Robertito Il Vecchio</h1>
          <p className="mt-1 text-navy-300">Clínica del Automotor</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
