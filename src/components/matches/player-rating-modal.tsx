'use client'

import { useEffect, useState } from 'react'
import {
  RATING_ASPECTS,
  computeRatingAverage,
  type MatchPlayerRating,
  type MatchPlayerRatingInput,
} from '@/lib/matches'
import type { Player } from '@/lib/teams'

type PlayerRatingModalProps = {
  player: Player
  existingRating: MatchPlayerRating | null
  onSave: (rating: MatchPlayerRatingInput) => Promise<void>
  onClose: () => void
}

const emptyRating = (): MatchPlayerRatingInput => ({
  presion: null,
  finalizacion: null,
  asociacion: null,
  intensidad: null,
  movimiento_sin_balon: null,
  comportamiento_tactico: null,
  actitud: null,
  juego_en_equipo: null,
})

export function PlayerRatingModal({
  player,
  existingRating,
  onSave,
  onClose,
}: PlayerRatingModalProps) {
  const [rating, setRating] = useState<MatchPlayerRatingInput>(emptyRating())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existingRating) {
      setRating({
        presion: existingRating.presion,
        finalizacion: existingRating.finalizacion,
        asociacion: existingRating.asociacion,
        intensidad: existingRating.intensidad,
        movimiento_sin_balon: existingRating.movimiento_sin_balon,
        comportamiento_tactico: existingRating.comportamiento_tactico,
        actitud: existingRating.actitud,
        juego_en_equipo: existingRating.juego_en_equipo,
      })
    }
  }, [existingRating])

  const average = computeRatingAverage(rating)

  async function handleSave() {
    if (average == null) return
    setSaving(true)
    try {
      await onSave(rating)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#050812]/92 p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-md rounded-xl border border-f7-border bg-f7-bg2 p-6">
        <div className="mb-1 font-bebas text-xl tracking-wider text-f7-accent">
          VALORAR JUGADOR
        </div>
        <div className="mb-4 text-sm text-f7-text2">
          {player.name}
          {player.dorsal != null ? ` (${player.dorsal})` : ''}
        </div>

        <div className="space-y-3 mb-4">
          {RATING_ASPECTS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="flex-1 text-xs text-f7-text2">{label}</label>
              <input
                type="number"
                min={1}
                max={10}
                value={rating[key] ?? ''}
                onChange={(e) => {
                  const raw = e.target.value
                  const val =
                    raw === '' ? null : Math.min(10, Math.max(1, parseInt(raw) || 1))
                  setRating({ ...rating, [key]: val })
                }}
                placeholder="—"
                className="w-16 rounded-lg border border-f7-border2 bg-f7-bg3 px-2 py-1.5 text-sm text-f7-text text-center outline-none focus:border-f7-accent2"
              />
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-lg border border-f7-border bg-f7-bg3 p-3 text-center">
          <div className="text-xs text-f7-text3 uppercase tracking-wider mb-1">
            Nota media
          </div>
          <div className="font-bebas text-3xl text-f7-accent">
            {average != null ? average.toFixed(1) : '—'}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-f7-border2 bg-transparent px-4 py-2 text-sm font-semibold text-f7-text2 transition-colors hover:bg-f7-bg3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={average == null || saving}
            className="flex-1 rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
