import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayersManager } from "@/components/players/players-manager";
import {
  TEAM_CATEGORY_LABELS,
  TRAINING_DAY_LABELS,
  type Player,
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

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!team) {
    notFound();
  }

  const typedTeam = team as Team;

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", id)
    .order("name", { ascending: true });

  const playerList = (players ?? []) as Player[];

  return (
    <main className="min-h-screen bg-f7-bg px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/dashboard"
          className="font-sans text-sm text-white/60 transition hover:text-f7-accent"
        >
          ← Volver al dashboard
        </Link>

        <header className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-bebas text-4xl tracking-wide text-f7-accent md:text-5xl">
              {typedTeam.name}
            </h1>
            <span className="rounded-full bg-f7-accent/10 px-3 py-1 font-sans text-xs font-semibold text-f7-accent">
              {categoryLabel(typedTeam.category)}
            </span>
          </div>
          <Link
            href={`/dashboard/equipos/${typedTeam.id}/partidos`}
            className="rounded-lg bg-f7-accent2 px-4 py-2 font-sans text-sm font-semibold text-white transition hover:opacity-85"
          >
            Partidos
          </Link>
        </header>

        <p className="mt-2 font-sans text-sm text-white/50">
          {typedTeam.training_days.length > 0
            ? typedTeam.training_days.map(dayLabel).join(", ")
            : "Sin días definidos"}
          {typedTeam.training_time ? ` · ${typedTeam.training_time}` : ""}
        </p>

        <section className="mt-10">
          <h2 className="mb-4 font-bebas text-2xl tracking-wide text-white">
            Jugadores
          </h2>
          <PlayersManager teamId={typedTeam.id} initialPlayers={playerList} />
        </section>
      </div>
    </main>
  );
}
