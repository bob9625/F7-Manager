import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  TEAM_CATEGORY_LABELS,
  TRAINING_DAY_LABELS,
  type Team,
  type TeamCategory,
  type TrainingDay,
} from "@/lib/teams";

function categoryLabel(category: string) {
  return TEAM_CATEGORY_LABELS[category as TeamCategory] ?? category;
}

function dayLabel(day: string) {
  return TRAINING_DAY_LABELS[day as TrainingDay] ?? day;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: teams, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });

  const teamList = (teams ?? []) as Team[];

  return (
    <main className="min-h-screen bg-f7-bg px-4 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bebas text-4xl tracking-wide text-f7-accent md:text-5xl">
              Dashboard
            </h1>
            <p className="mt-1 font-sans text-sm text-white/60">{user.email}</p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-bebas text-2xl tracking-wide text-white">
              Mis equipos
            </h2>
            <Link
              href="/dashboard/equipos/nuevo"
              className="rounded-lg bg-f7-accent px-4 py-2 font-sans text-sm font-semibold text-f7-bg transition hover:bg-f7-accent/90"
            >
              + Nuevo equipo
            </Link>
          </div>

          {error && (
            <p className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-300">
              No se pudieron cargar los equipos: {error.message}
            </p>
          )}

          {!error && teamList.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 p-10 text-center font-sans">
              <p className="text-white/70">Todavía no tienes equipos.</p>
              <Link
                href="/dashboard/equipos/nuevo"
                className="mt-4 inline-block rounded-lg border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-f7-accent hover:text-f7-accent"
              >
                Crear tu primer equipo
              </Link>
            </div>
          )}

          {teamList.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {teamList.map((team) => (
                <li key={team.id}>
                  <div className="block h-full rounded-xl border border-white/10 bg-white/5 p-6 font-sans backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bebas text-2xl tracking-wide text-white">
                        {team.name}
                      </h3>
                      <span className="rounded-full bg-f7-accent/10 px-3 py-1 text-xs font-semibold text-f7-accent">
                        {categoryLabel(team.category)}
                      </span>
                    </div>

                    <dl className="mt-4 space-y-1 text-sm text-white/60">
                      <div className="flex gap-2">
                        <dt className="text-white/40">Días:</dt>
                        <dd>
                          {team.training_days.length > 0
                            ? team.training_days.map(dayLabel).join(", ")
                            : "Sin definir"}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-white/40">Hora:</dt>
                        <dd>{team.training_time ?? "Sin definir"}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/dashboard/equipos/${team.id}`}
                        className="flex-1 rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-center text-sm font-semibold text-f7-text2 transition hover:border-f7-accent hover:text-f7-accent"
                      >
                        Jugadores
                      </Link>
                      <Link
                        href={`/dashboard/equipos/${team.id}/partidos`}
                        className="flex-1 rounded-lg bg-f7-accent2 px-3 py-2 text-center text-sm font-semibold text-white transition hover:opacity-85"
                      >
                        Partidos
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
