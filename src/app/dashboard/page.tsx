import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata = {
  title: "Dashboard | F7 Manager",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-f7-bg px-4">
      <h1 className="font-bebas text-5xl tracking-wide text-f7-accent md:text-7xl">
        Dashboard
      </h1>
      <p className="mt-4 font-sans text-white/60">{user.email}</p>
      <LogoutButton />
    </main>
  );
}
