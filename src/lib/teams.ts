import { createClient } from '@/lib/supabase/client'

export type Team = {
  id: string
  user_id: string
  name: string
  created_at: string
}

export type Player = {
  id: string
  team_id: string
  name: string
  position: string | null
  number: number | null
  is_active: boolean
  created_at: string
}

export async function getTeams(userId: string): Promise<Team[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()
  if (error) throw error
  return data
}

export async function createTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .insert(team)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTeam(teamId: string, updates: Partial<Omit<Team, 'id' | 'user_id' | 'created_at'>>): Promise<Team> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTeam(teamId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) throw error
}

export async function getPlayers(teamId: string): Promise<Player[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('number', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data || []
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()
  if (error) throw error
  return data
}

export async function createPlayer(player: Omit<Player, 'id' | 'created_at'>): Promise<Player> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlayer(playerId: string, updates: Partial<Omit<Player, 'id' | 'team_id' | 'created_at'>>): Promise<Player> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(playerId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw error
}
