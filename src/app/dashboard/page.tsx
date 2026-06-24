'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getTeams, createTeam, deleteTeam, type Team } from '@/lib/teams'
import { LogoutButton } from '@/components/auth/logout-button'

export default function DashboardPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')
      const teamsData = await getTeams(user.id)
      setTeams(teamsData)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await createTeam({
      user_id: user.id,
      name: newTeamName.trim(),
    })
    const teamsData = await getTeams(user.id)
    setTeams(teamsData)
    setNewTeamName('')
    setShowForm(false)
  }

  async function handleDeleteTeam(teamId: string) {
    if (!confirm('¿Eliminar este equipo?')) return
    await deleteTeam(teamId)
    setTeams(teams.filter(t => t.id !== teamId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-f7-bg flex items-center justify-center">
        <div className="text-f7-text2 font-dm">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-f7-bg font-dm text-f7-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-f7-border bg-f7-bg/98 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="font-bebas text-f7-accent text-lg tracking-wider">
            F7 MANAGER
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-f7-text3 text-xs">{userEmail}</span>
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="mb-6">
          <h1 className="font-bebas text-3xl tracking-wide text-f7-accent">MIS EQUIPOS</h1>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="rounded-xl border border-f7-border bg-f7-bg2 p-8 text-center">
            <div className="text-f7-text3 mb-4">No tienes equipos todavía</div>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988]"
            >
              + Crear Equipo
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="cursor-pointer rounded-xl border border-f7-border bg-f7-bg2 p-4 transition-colors hover:bg-f7-bg3"
                onClick={() => router.push(`/dashboard/equipos/${team.id}`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="font-bebas text-xl tracking-wide text-f7-accent">
                    {team.name}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTeam(team.id)
                    }}
                    className="rounded border border-f7-border2 bg-transparent px-2 py-1 text-xs text-f7-text2 transition-colors hover:border-f7-red hover:text-f7-red"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-f7-text3 text-xs">
                  Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            ))}
            
            {/* Add Team Card */}
            <button
              onClick={() => setShowForm(true)}
              className="flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed border-f7-border2 bg-transparent transition-colors hover:border-f7-accent hover:bg-f7-bg3"
            >
              <div className="text-center">
                <div className="font-bebas text-2xl text-f7-accent">+</div>
                <div className="text-f7-text2 text-xs">Crear Equipo</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050812]/92 p-4">
          <div className="w-full max-w-md rounded-xl border border-f7-border bg-f7-bg2 p-6">
            <div className="mb-4 font-bebas text-xl tracking-wider text-f7-accent">
              NUEVO EQUIPO
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-xs text-f7-text3 uppercase tracking-wider">
                Nombre del Equipo
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ej: Los Rayos FC"
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTeam()
                  if (e.key === 'Escape') setShowForm(false)
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-f7-border2 bg-transparent px-4 py-2 text-sm font-semibold text-f7-text2 transition-colors hover:bg-f7-bg3"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                className="flex-1 rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988] disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
