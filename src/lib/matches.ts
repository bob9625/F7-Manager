import { createClient } from '@/lib/supabase/client'

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