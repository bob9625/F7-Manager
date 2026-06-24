'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getMatch,
  getMatchPlayers,
  getMatchPlayerRatings,
  upsertMatchPlayerRating,
  type Match,
  type MatchPlayer,
  type MatchPlayerRating,
} from '@/lib/matches'
import { getTeam, getPlayers, type Player } from '@/lib/teams'
import { PlayerRatingModal } from '@/components/matches/player-rating-modal'
import { LogoutButton } from '@/components/auth/logout-button'

export default function MatchDetailPage() {
  const router = useRouter()
  const { id: teamId, matchId } = useParams<{ id: string; matchId: string }>()
  const [team, setTeam] = useState<{ name: string } | null>(null)
  const [match, setMatch] = useState<Match | null>(null)
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>([])
  const [ratings, setRatings] = useState<MatchPlayerRating[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [ratingPlayer, setRatingPlayer] = useState<Player | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')

      const [teamData, matchData, mp, r, p] = await Promise.all([
        getTeam(teamId),
        getMatch(matchId),
        getMatchPlayers(matchId),
        getMatchPlayerRatings(matchId),
        getPlayers(teamId),
      ])

      if (!matchData || matchData.team_id !== teamId) {
        router.push(`/dashboard/equipos/${teamId}/partidos`)
        return
      }

      setTeam(teamData)
      setMatch(matchData)
      setMatchPlayers(mp)
      setRatings(r)
      setPlayers(p)
      setLoading(false)
    }
    load()
  }, [teamId, matchId, router])

  function getPlayer(playerId: string) {
    return players.find((p) => p.id === playerId)
  }

  function getRating(playerId: string) {
    return ratings.find((r) => r.player_id === playerId) ?? null
  }

  async function handleSaveRating(rating: Parameters<typeof upsertMatchPlayerRating>[2]) {
    if (!ratingPlayer) return
    const saved = await upsertMatchPlayerRating(matchId, ratingPlayer.id, rating)
    setRatings((prev) => {
      const idx = prev.findIndex((r) => r.player_id === ratingPlayer.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
  }

  function getResult() {
    if (!match) return { label: 'E', color: '#f59e0b' }
    if (match.gf > match.gc) return { label: 'V', color: '#00e5a0' }
    if (match.gf === match.gc) return { label: 'E', color: '#f59e0b' }
    return { label: 'D', color: '#ef4444' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-f7-bg flex items-center justify-center">
        <div className="text-f7-text2 font-dm">Cargando...</div>
      </div>
    )
  }

  if (!match) return null

  const res = getResult()

  return (
    <div className="min-h-screen bg-f7-bg font-dm text-f7-text">
      <div className="flex items-center justify-between border-b border-f7-border bg-f7-bg/98 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/equipos/${teamId}/partidos`)}
            className="rounded border border-f7-border2 bg-transparent px-3 py-1 text-xs text-f7-text2 transition-colors hover:bg-f7-bg3"
          >
            ← Volver
          </button>
          <div className="font-bebas text-lg tracking-wider text-f7-accent">
            {team?.name} — PARTIDO
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-f7-text3 text-xs">{userEmail}</span>
          <LogoutButton />
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {/* Match summary */}
        <div className="mb-4 rounded-xl border border-f7-border bg-f7-bg2 p-4">
          <div className="flex items-center gap-4">
            <div
              className="font-bebas text-4xl"
              style={{ color: res.color, minWidth: '32px' }}
            >
              {res.label}
            </div>
            <div className="flex-1">
              <div className="font-bebas text-2xl tracking-wide">{match.rival}</div>
              <div className="text-sm text-f7-text3">
                {match.date} · {match.loc_vis}
                {match.jornada ? ` · J${match.jornada}` : ''}
              </div>
            </div>
            <div className="font-bebas text-3xl tracking-wider text-f7-accent">
              {match.gf}—{match.gc}
            </div>
          </div>

          {match.notes && (
            <p className="mt-3 text-sm text-f7-text2 border-t border-f7-border pt-3">
              {match.notes}
            </p>
          )}
        </div>

        {/* Participation */}
        <div className="rounded-xl border border-f7-border bg-f7-bg2 overflow-hidden">
          <div className="border-b border-f7-border bg-f7-bg3 px-4 py-3">
            <div className="font-bebas text-lg tracking-wide text-f7-accent">
              PARTICIPACIÓN
            </div>
          </div>

          {matchPlayers.length === 0 ? (
            <div className="p-8 text-center text-f7-text3 text-sm">
              Sin datos de participación
            </div>
          ) : (
            matchPlayers.map((mp) => {
              const player = getPlayer(mp.player_id)
              const rating = getRating(mp.player_id)
              if (!player) return null

              return (
                <div
                  key={mp.id}
                  className="flex flex-wrap items-center gap-3 border-b border-f7-border px-4 py-3 last:border-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-f7-accent/10 text-sm font-semibold text-f7-accent">
                    {player.dorsal ?? '—'}
                  </span>
                  <div className="flex-1 min-w-[120px]">
                    <div className="text-sm font-semibold">{player.name}</div>
                    <div className="text-xs text-f7-text3">
                      Partes:{' '}
                      {mp.partes.length > 0
                        ? mp.partes.join(', ')
                        : '—'}{' '}
                      · Goles: {mp.goles}
                      {mp.tarjetas_amarillas > 0 && ' · 🟨'}
                      {mp.tarjetas_rojas > 0 && ' · 🟥'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rating?.nota_media != null && (
                      <span className="font-bebas text-lg text-f7-accent">
                        {rating.nota_media.toFixed(1)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setRatingPlayer(player)}
                      className="rounded-lg border border-f7-border2 bg-transparent px-3 py-1.5 text-xs font-semibold text-f7-text2 transition-colors hover:border-f7-accent hover:text-f7-accent"
                    >
                      Valorar
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {ratingPlayer && (
        <PlayerRatingModal
          player={ratingPlayer}
          existingRating={getRating(ratingPlayer.id)}
          onSave={handleSaveRating}
          onClose={() => setRatingPlayer(null)}
        />
      )}
    </div>
  )
}
