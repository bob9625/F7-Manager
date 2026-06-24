"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TEAM_CATEGORIES,
  TEAM_CATEGORY_LABELS,
  TRAINING_DAYS,
  TRAINING_DAY_LABELS,
  type TeamCategory,
} from "@/lib/teams";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-f7-bg px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-f7-accent focus:ring-1 focus:ring-f7-accent";

export function TeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TeamCategory>(TEAM_CATEGORIES[0]);
  const [trainingDays, setTrainingDays] = useState<string[]>([]);
  const [trainingTime, setTrainingTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleDay(day: string) {
    setTrainingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre del equipo es obligatorio");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("teams").insert({
      name: name.trim(),
      category,
      training_days: trainingDays,
      training_time: trainingTime.trim() ? trainingTime : null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-white/70">
          Nombre del equipo
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          placeholder="Ej. Atlético F7"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm text-white/70">
          Categoría
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as TeamCategory)}
          className={inputClass}
        >
          {TEAM_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {TEAM_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-2 block text-sm text-white/70">
          Días de entrenamiento
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TRAINING_DAYS.map((day) => {
            const selected = trainingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                aria-pressed={selected}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  selected
                    ? "border-f7-accent bg-f7-accent/10 text-f7-accent"
                    : "border-white/10 text-white/70 hover:border-white/30"
                }`}
              >
                {TRAINING_DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="trainingTime"
          className="mb-1 block text-sm text-white/70"
        >
          Hora de entrenamiento
        </label>
        <input
          id="trainingTime"
          type="time"
          value={trainingTime}
          onChange={(e) => setTrainingTime(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-f7-accent px-4 py-3 font-semibold text-f7-bg transition hover:bg-f7-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Crear equipo"}
      </button>
    </form>
  );
}
