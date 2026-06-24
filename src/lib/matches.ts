import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Match = {
  id: string
  team_id: string
  date: string
  rival: string
  jornada: number | null
  loc_vis: 'local' | 'visitante'
  gf: number
  gc: number
  mvp_player_id: string | null
  notes: string | null
  rival_style: string | null
  rival_system: string | null
  rival_dangers: string | null
  rival_weakness: string | null
  created_at: string
}

export type MatchEvent = {
  id: string
  match_id: string
  player_id: string
  type: 'goal' | 'card'
  card_color: 'yellow' | 'red' | null
  created_at: string
}

export type MatchPlayer = {
  id: string
  match_id: string
  player_id: string
  goles: number
  partes: number[]
  tarjetas_amarillas: number
  tarjetas_rojas: number
  created_at: string
}

export type MatchPlayerInput = {
  player_id: string
  goles: number
  partes: number[]
  tarjetas_amarillas: number
  tarjetas_rojas: number
}

export type MatchPlayerRating = {
  id: string
  match_id: string
  player_id: string
  presion: number | null
  finalizacion: number | null
  asociacion: number | null
  intensidad: number | null
  movimiento_sin_balon: number | null
  comportamiento_tactico: number | null
  actitud: number | null
  juego_en_equipo: number | null
  nota_media: number | null
  created_at: string
}

export type MatchPlayerRatingInput = {
  presion: number | null
  finalizacion: number | null
  asociacion: number | null
  intensidad: number | null
  movimiento_sin_balon: number | null
  comportamiento_tactico: number | null
  actitud: number | null
  juego_en_equipo: number | null
}

export type PlayerMatchStats = {
  partidos: number
  goles: number
  tarjetas_amarillas: number
  tarjetas_rojas: number
  partes_totales: number
  promedio_partes: number
  nota_media: number | null
}

export const RATING_ASPECTS = [
  { key: 'presion', label: 'Presión' },
  { key: 'finalizacion', label: 'Finalización' },
  { key: 'asociacion', label: 'Asociación' },
  { key: 'intensidad', label: 'Intensidad' },
  { key: 'movimiento_sin_balon', label: 'Movimiento sin balón' },
  { key: 'comportamiento_tactico', label: 'Comportamiento táctico' },
  { key: 'actitud', label: 'Actitud' },
  { key: 'juego_en_equipo', label: 'Juego en equipo' },
] as const

export type RatingAspectKey = (typeof RATING_ASPECTS)[number]['key']

export function computeRatingAverage(rating: MatchPlayerRatingInput): number | null {
  const values = RATING_ASPECTS.map(({ key }) => rating[key]).filter(
    (v): v is number => v != null && !Number.isNaN(v)
  )
  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

export async function getMatches(teamId: string): Promise<Match[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMatch(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}

export async function createMatchPlayers(
  matchId: string,
  players: MatchPlayerInput[]
): Promise<void> {
  if (players.length === 0) return
  const supabase = createClient()
  const rows = players.map((p) => ({
    match_id: matchId,
    player_id: p.player_id,
    goles: p.goles,
    partes: p.partes,
    tarjetas_amarillas: p.tarjetas_amarillas,
    tarjetas_rojas: p.tarjetas_rojas,
  }))
  const { error } = await supabase.from('match_players').insert(rows)
  if (error) throw error
}

export async function getMatchPlayers(matchId: string): Promise<MatchPlayer[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_players')
    .select('*')
    .eq('match_id', matchId)
  if (error) throw error
  return data || []
}

export async function getMatchPlayerRatings(matchId: string): Promise<MatchPlayerRating[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_player_ratings')
    .select('*')
    .eq('match_id', matchId)
  if (error) throw error
  return data || []
}

export async function upsertMatchPlayerRating(
  matchId: string,
  playerId: string,
  rating: MatchPlayerRatingInput
): Promise<MatchPlayerRating> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_player_ratings')
    .upsert(
      {
        match_id: matchId,
        player_id: playerId,
        ...rating,
      },
      { onConflict: 'match_id,player_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTeamPlayerStats(
  supabase: SupabaseClient,
  teamId: string
): Promise<Record<string, PlayerMatchStats>> {
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id')
    .eq('team_id', teamId)

  if (matchesError) throw matchesError

  const matchIds = (matches ?? []).map((m) => m.id)
  if (matchIds.length === 0) return {}

  const [{ data: matchPlayers, error: mpError }, { data: ratings, error: rError }] =
    await Promise.all([
      supabase.from('match_players').select('*').in('match_id', matchIds),
      supabase.from('match_player_ratings').select('*').in('match_id', matchIds),
    ])

  if (mpError) throw mpError
  if (rError) throw rError

  const stats: Record<string, PlayerMatchStats> = {}

  for (const mp of matchPlayers ?? []) {
    const pid = mp.player_id as string
    if (!stats[pid]) {
      stats[pid] = {
        partidos: 0,
        goles: 0,
        tarjetas_amarillas: 0,
        tarjetas_rojas: 0,
        partes_totales: 0,
        promedio_partes: 0,
        nota_media: null,
      }
    }
    const s = stats[pid]
    s.partidos += 1
    s.goles += mp.goles ?? 0
    s.tarjetas_amarillas += mp.tarjetas_amarillas ?? 0
    s.tarjetas_rojas += mp.tarjetas_rojas ?? 0
    s.partes_totales += (mp.partes ?? []).length
  }

  const ratingSums: Record<string, { total: number; count: number }> = {}
  for (const r of ratings ?? []) {
    const pid = r.player_id as string
    if (r.nota_media == null) continue
    if (!ratingSums[pid]) ratingSums[pid] = { total: 0, count: 0 }
    ratingSums[pid].total += r.nota_media
    ratingSums[pid].count += 1
  }

  for (const [pid, s] of Object.entries(stats)) {
    s.promedio_partes =
      s.partidos > 0 ? Math.round((s.partes_totales / s.partidos) * 10) / 10 : 0
    const rs = ratingSums[pid]
    s.nota_media = rs
      ? Math.round((rs.total / rs.count) * 10) / 10
      : null
  }

  return stats
}

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
  if (error) throw error
  return data || []
}

export async function createMatchEvent(event: Omit<MatchEvent, 'id' | 'created_at'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('match_events').insert(event)
  if (error) throw error
}

export async function deleteMatchEvents(matchId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('match_events').delete().eq('match_id', matchId)
  if (error) throw error
}
