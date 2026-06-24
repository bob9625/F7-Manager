'use client'

import type { Player } from '@/lib/teams'
import type { MatchPlayerInput } from '@/lib/matches'

export type ParticipationState = Record<string, MatchPlayerInput>

export function createEmptyParticipation(players: Player[]): ParticipationState {
  const state: ParticipationState = {}
  for (const p of players.filter((pl) => pl.active)) {
    state[p.id] = {
      player_id: p.id,
      partes: [],
      goles: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
    }
  }
  return state
}

export function hasParticipation(entry: MatchPlayerInput): boolean {
  return (
    entry.partes.length > 0 ||
    entry.goles > 0 ||
    entry.tarjetas_amarillas > 0 ||
    entry.tarjetas_rojas > 0
  )
}

type MatchParticipationFormProps = {
  players: Player[]
  participation: ParticipationState
  onChange: (next: ParticipationState) => void
}

export function MatchParticipationForm({
  players,
  participation,
  onChange,
}: MatchParticipationFormProps) {
  const activePlayers = players.filter((p) => p.active)

  function update(playerId: string, patch: Partial<MatchPlayerInput>) {
    onChange({
      ...participation,
      [playerId]: { ...participation[playerId], ...patch },
    })
  }

  function toggleParte(playerId: string, parte: number) {
    const entry = participation[playerId]
    if (!entry) return
    const partes = entry.partes.includes(parte)
      ? entry.partes.filter((p) => p !== parte)
      : [...entry.partes, parte].sort((a, b) => a - b)
    update(playerId, { partes })
  }

  function toggleCard(
    playerId: string,
    field: 'tarjetas_amarillas' | 'tarjetas_rojas'
  ) {
    const entry = participation[playerId]
    if (!entry) return
    update(playerId, { [field]: entry[field] > 0 ? 0 : 1 })
  }

  if (activePlayers.length === 0) {
    return (
      <p className="text-sm text-f7-text3 text-center py-4">
        No hay jugadores activos en el equipo
      </p>
    )
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {activePlayers.map((player) => {
        const entry = participation[player.id]
        if (!entry) return null

        return (
          <div
            key={player.id}
            className="rounded-lg border border-f7-border bg-f7-bg3 p-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-f7-accent/10 text-xs font-semibold text-f7-accent">
                {player.dorsal ?? '—'}
              </span>
              <span className="text-sm font-semibold flex-1 truncate">
                {player.name}
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
              <div>
                <div className="mb-1 text-[10px] text-f7-text3 uppercase tracking-wider">
                  Partes
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((parte) => (
                    <label
                      key={parte}
                      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded border text-xs font-semibold transition-colors ${
                        entry.partes.includes(parte)
                          ? 'border-f7-accent bg-f7-accent/20 text-f7-accent'
                          : 'border-f7-border2 text-f7-text3 hover:border-f7-accent/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={entry.partes.includes(parte)}
                        onChange={() => toggleParte(player.id, parte)}
                      />
                      {parte}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 text-[10px] text-f7-text3 uppercase tracking-wider">
                  Goles
                </div>
                <input
                  type="number"
                  min={0}
                  value={entry.goles}
                  onChange={(e) =>
                    update(player.id, {
                      goles: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-14 rounded border border-f7-border2 bg-f7-bg2 px-2 py-1 text-sm text-f7-text outline-none focus:border-f7-accent2"
                />
              </div>

              <div>
                <div className="mb-1 text-[10px] text-f7-text3 uppercase tracking-wider">
                  Tarjetas
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => toggleCard(player.id, 'tarjetas_amarillas')}
                    className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                      entry.tarjetas_amarillas > 0
                        ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                        : 'border border-f7-border2 text-f7-text3 hover:border-yellow-500/50'
                    }`}
                    title="Tarjeta amarilla"
                  >
                    🟨
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCard(player.id, 'tarjetas_rojas')}
                    className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                      entry.tarjetas_rojas > 0
                        ? 'bg-f7-red/30 text-f7-red border border-f7-red/50'
                        : 'border border-f7-border2 text-f7-text3 hover:border-f7-red/50'
                    }`}
                    title="Tarjeta roja"
                  >
                    🟥
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
