import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamForm } from "@/components/teams/team-form";

export const metadata = {
  title: "Nuevo equipo | F7 Manager",
};

export default async function NuevoEquipoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-f7-bg px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <Link
          href="/dashboard"
          className="font-sans text-sm text-white/60 transition hover:text-f7-accent"
        >
          ← Volver al dashboard
        </Link>

        <h1 className="mt-4 font-bebas text-4xl tracking-wide text-f7-accent md:text-5xl">
          Nuevo equipo
        </h1>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <TeamForm />
        </div>
      </div>
    </main>
  );
}
