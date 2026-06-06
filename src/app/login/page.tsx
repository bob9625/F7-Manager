import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginFooter, LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar sesión | F7 Manager",
};

export default function LoginPage() {
  return (
    <AuthLayout footer={<LoginFooter />}>
      <Suspense fallback={<p className="text-center font-sans text-white/60">Cargando...</p>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
