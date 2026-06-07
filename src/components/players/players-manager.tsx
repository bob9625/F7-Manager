"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLAYER_POSITIONS, type Player } from "@/lib/teams";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-f7-bg px-3 py-2 text-white placeholder-white/30 outline-none transition focus:border-f7-accent focus:ring-1 focus:ring-f7-accent";

function parseDorsal(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isNaN(n) ? null : n;
}

type PlayersManagerProps = {
  teamId: string;
  initialPlayers: Player[];
};

export function PlayersManager({ teamId, initialPlayers }: PlayersManagerProps) {
  const supabase = createClient();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [dorsal, setDorsal] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editDorsal, setEditDorsal] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  function sortPlayers(list: Player[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre del jugador es obligatorio");
      return;
    }

    setAdding(true);
    const { data, error } = await supabase
      .from("players")
      .insert({
        team_id: teamId,
        name: name.trim(),
        position: position || null,
        dorsal: parseDorsal(dorsal),
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setAdding(false);
      return;
    }

    setPlayers((prev) => sortPlayers([...prev, data as Player]));
    setName("");
    setPosition("");
    setDorsal("");
    setAdding(false);
  }

  function startEdit(player: Player) {
    setError(null);
    setEditingId(player.id);
    setEditName(player.name);
    setEditPosition(player.position ?? "");
    setEditDorsal(player.dorsal != null ? String(player.dorsal) : "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id: string) {
    setError(null);

    if (!editName.trim()) {
      setError("El nombre del jugador es obligatorio");
      return;
    }

    setSavingId(id);
    const { data, error } = await supabase
      .from("players")
      .update({
        name: editName.trim(),
        position: editPosition || null,
        dorsal: parseDorsal(editDorsal),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSavingId(null);
      return;
    }

    setPlayers((prev) =>
      sortPlayers(prev.map((p) => (p.id === id ? (data as Player) : p)))
    );
    setSavingId(null);
    setEditingId(null);
  }

  async function toggleActive(player: Player) {
    setError(null);
    setSavingId(player.id);
    const { data, error } = await supabase
      .from("players")
      .update({ active: !player.active })
      .eq("id", player.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSavingId(null);
      return;
    }

    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? (data as Player) : p))
    );
    setSavingId(null);
  }

  return (
    <div className="font-sans">
      <form
        onSubmit={handleAdd}
        className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-5 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-end"
      >
        <div>
          <label htmlFor="player-name" className="mb-1 block text-xs text-white/60">
            Nombre
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Nombre del jugador"
          />
        </div>
        <div>
          <label
            htmlFor="player-position"
            className="mb-1 block text-xs text-white/60"
          >
            Posición
          </label>
          <select
            id="player-position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={inputClass}
          >
            <option value="">Sin posición</option>
            {PLAYER_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="player-dorsal"
            className="mb-1 block text-xs text-white/60"
          >
            Dorsal
          </label>
          <input
            id="player-dorsal"
            type="number"
            min={0}
            value={dorsal}
            onChange={(e) => setDorsal(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-f7-bg transition hover:bg-f7-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? "Añadiendo..." : "Añadir jugador"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6">
        {players.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-white/60">
            Todavía no hay jugadores en este equipo.
          </p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => {
              const isEditing = editingId === player.id;
              const isBusy = savingId === player.id;

              return (
                <li
                  key={player.id}
                  className={`rounded-xl border border-white/10 bg-white/5 p-4 ${
                    player.active ? "" : "opacity-60"
                  }`}
                >
                  {isEditing ? (
                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
                      <input
                        aria-label="Nombre"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={inputClass}
                      />
                      <select
                        aria-label="Posición"
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Sin posición</option>
                        {PLAYER_POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label="Dorsal"
                        type="number"
                        min={0}
                        value={editDorsal}
                        onChange={(e) => setEditDorsal(e.target.value)}
                        className={inputClass}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(player.id)}
                          disabled={isBusy}
                          className="rounded-lg bg-f7-accent px-3 py-2 text-sm font-semibold text-f7-bg transition hover:bg-f7-accent/90 disabled:opacity-60"
                        >
                          {isBusy ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={isBusy}
                          className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/70 transition hover:border-white/40"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-f7-accent/10 text-sm font-semibold text-f7-accent">
                          {player.dorsal != null ? player.dorsal : "—"}
                        </span>
                        <div>
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-sm text-white/50">
                            {player.position ?? "Sin posición"}
                            {!player.active && (
                              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                                Inactivo
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(player)}
                          disabled={isBusy}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/70 transition hover:border-f7-accent hover:text-f7-accent disabled:opacity-60"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(player)}
                          disabled={isBusy}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/40 disabled:opacity-60"
                        >
                          {player.active ? "Desactivar" : "Reactivar"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
