import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterFooter, RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Registro | F7 Manager",
};

export default function RegistroPage() {
  return (
    <AuthLayout footer={<RegisterFooter />}>
      <RegisterForm />
    </AuthLayout>
  );
}
