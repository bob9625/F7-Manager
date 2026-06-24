'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getTeam, getPlayers, createPlayer, updatePlayer, deletePlayer, type Team, type Player } from '@/lib/teams'
import { LogoutButton } from '@/components/auth/logout-button'

export default function TeamDetailPage() {
  const router = useRouter()
  const { id: teamId } = useParams<{ id: string }>()
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [userEmail, setUserEmail] = useState('')

  const [form, setForm] = useState({
    name: '',
    position: '',
    number: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')

      const [teamData, playersData] = await Promise.all([
        getTeam(teamId),
        getPlayers(teamId),
      ])
      setTeam(teamData)
      setPlayers(playersData)
      setLoading(false)
    }
    load()
  }, [teamId, router])

  async function handleCreatePlayer() {
    if (!form.name.trim()) return
    await createPlayer({
      team_id: teamId,
      name: form.name.trim(),
      position: form.position.trim() || null,
      number: form.number ? parseInt(form.number) : null,
      is_active: true,
    })
    const playersData = await getPlayers(teamId)
    setPlayers(playersData)
    setForm({ name: '', position: '', number: '' })
    setShowForm(false)
  }

  async function handleUpdatePlayer() {
    if (!editingPlayer || !form.name.trim()) return
    await updatePlayer(editingPlayer.id, {
      name: form.name.trim(),
      position: form.position.trim() || null,
      number: form.number ? parseInt(form.number) : null,
    })
    const playersData = await getPlayers(teamId)
    setPlayers(playersData)
    setEditingPlayer(null)
    setForm({ name: '', position: '', number: '' })
  }

  async function handleToggleActive(player: Player) {
    await updatePlayer(player.id, { is_active: !player.is_active })
    const playersData = await getPlayers(teamId)
    setPlayers(playersData)
  }

  async function handleDeletePlayer(playerId: string) {
    if (!confirm('¿Eliminar este jugador?')) return
    await deletePlayer(playerId)
    setPlayers(players.filter(p => p.id !== playerId))
  }

  function openEditForm(player: Player) {
    setEditingPlayer(player)
    setForm({
      name: player.name,
      position: player.position || '',
      number: player.number?.toString() || '',
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-f7-bg flex items-center justify-center">
        <div className="text-f7-text2 font-dm">Cargando...</div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-f7-bg flex items-center justify-center">
        <div className="text-f7-text2 font-dm">Equipo no encontrado</div>
      </div>
    )
  }

  const activePlayers = players.filter(p => p.is_active)
  const inactivePlayers = players.filter(p => !p.is_active)

  return (
    <div className="min-h-screen bg-f7-bg font-dm text-f7-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-f7-border bg-f7-bg/98 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded border border-f7-border2 bg-transparent px-3 py-1 text-xs text-f7-text2 transition-colors hover:bg-f7-bg3"
          >
            ← Volver
          </button>
          <div className="font-bebas text-lg tracking-wider text-f7-accent">
            {team.name}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/equipos/${teamId}/partidos`)}
            className="rounded-lg bg-f7-accent2 px-3 py-1 text-xs font-semibold text-white transition-colors hover:opacity-85"
          >
            Partidos
          </button>
          <span className="text-f7-text3 text-xs">{userEmail}</span>
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Team Info Card */}
        <div className="mb-4 rounded-xl border border-f7-border bg-f7-bg2 p-4">
          <div className="mb-2 font-bebas text-lg tracking-wide text-f7-accent">
            INFORMACIÓN DEL EQUIPO
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="mb-1 text-xs text-f7-text3 uppercase tracking-wider">Nombre</div>
              <div className="text-sm font-semibold">{team.name}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-f7-text3 uppercase tracking-wider">Jugadores Activos</div>
              <div className="text-sm font-semibold">{activePlayers.length}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-f7-text3 uppercase tracking-wider">Creado</div>
              <div className="text-sm">{new Date(team.created_at).toLocaleDateString('es-ES')}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-f7-border">
            <button
              onClick={() => router.push(`/dashboard/equipos/${teamId}/partidos`)}
              className="w-full rounded-lg bg-f7-accent2 px-4 py-3 text-sm font-semibold text-white transition-colors hover:opacity-85"
            >
              Gestionar Partidos →
            </button>
          </div>
        </div>

        {/* Players Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bebas text-2xl tracking-wide text-f7-accent">JUGADORES</h2>
          <button
            onClick={() => {
              setEditingPlayer(null)
              setForm({ name: '', position: '', number: '' })
              setShowForm(true)
            }}
            className="rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988]"
          >
            + Añadir Jugador
          </button>
        </div>

        {/* Active Players */}
        {activePlayers.length > 0 && (
          <div className="mb-4 rounded-xl border border-f7-border bg-f7-bg2 overflow-hidden">
            <div className="border-b border-f7-border bg-f7-bg3 px-4 py-2">
              <div className="text-xs font-semibold text-f7-text3 uppercase tracking-wider">
                Activos ({activePlayers.length})
              </div>
            </div>
            {activePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 border-b border-f7-border px-4 py-3 last:border-0"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-f7-bg4 font-bebas text-f7-accent">
                  {player.number || '-'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{player.name}</div>
                  <div className="text-xs text-f7-text3">{player.position || 'Sin posición'}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(player)}
                    className="rounded border border-f7-border2 bg-transparent px-2 py-1 text-xs text-f7-text2 transition-colors hover:bg-f7-bg3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(player)}
                    className="rounded border border-f7-border2 bg-transparent px-2 py-1 text-xs text-f7-text2 transition-colors hover:bg-f7-bg3"
                  >
                    Desactivar
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="rounded border border-f7-red bg-transparent px-2 py-1 text-xs text-f7-red transition-colors hover:bg-f7-red/10"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inactive Players */}
        {inactivePlayers.length > 0 && (
          <div className="rounded-xl border border-f7-border bg-f7-bg2 overflow-hidden">
            <div className="border-b border-f7-border bg-f7-bg3 px-4 py-2">
              <div className="text-xs font-semibold text-f7-text3 uppercase tracking-wider">
                Inactivos ({inactivePlayers.length})
              </div>
            </div>
            {inactivePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 border-b border-f7-border px-4 py-3 last:border-0 opacity-60"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-f7-bg4 font-bebas text-f7-text3">
                  {player.number || '-'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{player.name}</div>
                  <div className="text-xs text-f7-text3">{player.position || 'Sin posición'}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(player)}
                    className="rounded border border-f7-border2 bg-transparent px-2 py-1 text-xs text-f7-text2 transition-colors hover:bg-f7-bg3"
                  >
                    Activar
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="rounded border border-f7-red bg-transparent px-2 py-1 text-xs text-f7-red transition-colors hover:bg-f7-red/10"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {players.length === 0 && (
          <div className="rounded-xl border border-f7-border bg-f7-bg2 p-8 text-center">
            <div className="text-f7-text3 mb-4">No hay jugadores en este equipo</div>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988]"
            >
              + Añadir Jugador
            </button>
          </div>
        )}
      </div>

      {/* Player Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050812]/92 p-4">
          <div className="w-full max-w-md rounded-xl border border-f7-border bg-f7-bg2 p-6">
            <div className="mb-4 font-bebas text-xl tracking-wider text-f7-accent">
              {editingPlayer ? 'EDITAR JUGADOR' : 'NUEVO JUGADOR'}
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs text-f7-text3 uppercase tracking-wider">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre del jugador"
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs text-f7-text3 uppercase tracking-wider">
                    Número
                  </label>
                  <input
                    type="number"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    placeholder="1-99"
                    min="1"
                    max="99"
                    className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-f7-text3 uppercase tracking-wider">
                    Posición
                  </label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Ej: Portero"
                    className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingPlayer(null)
                  setForm({ name: '', position: '', number: '' })
                }}
                className="flex-1 rounded-lg border border-f7-border2 bg-transparent px-4 py-2 text-sm font-semibold text-f7-text2 transition-colors hover:bg-f7-bg3"
              >
                Cancelar
              </button>
              <button
                onClick={editingPlayer ? handleUpdatePlayer : handleCreatePlayer}
                disabled={!form.name.trim()}
                className="flex-1 rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988] disabled:opacity-50"
              >
                {editingPlayer ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
