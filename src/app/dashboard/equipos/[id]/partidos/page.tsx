'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getMatches,
  createMatch,
  createMatchPlayers,
  deleteMatch,
  type Match,
} from '@/lib/matches'
import { getTeam, getPlayers, type Player } from '@/lib/teams'
import {
  MatchParticipationForm,
  createEmptyParticipation,
  hasParticipation,
  type ParticipationState,
} from '@/components/matches/match-participation-form'
import { LogoutButton } from '@/components/auth/logout-button'

export default function PartidosPage() {
  const router = useRouter()
  const { id: teamId } = useParams<{ id: string }>()
  const [team, setTeam] = useState<{ name: string } | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterLocVis, setFilterLocVis] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [userEmail, setUserEmail] = useState('')

  const [form, setForm] = useState({
    date: '',
    rival: '',
    jornada: '',
    loc_vis: 'local' as 'local' | 'visitante',
    gf: 0,
    gc: 0,
    mvp_player_id: '',
    notes: '',
    rival_style: '',
    rival_system: '',
    rival_dangers: '',
    rival_weakness: '',
  })
  const [participation, setParticipation] = useState<ParticipationState>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')

      const [teamData, m, p] = await Promise.all([
        getTeam(teamId),
        getMatches(teamId),
        getPlayers(teamId),
      ])
      setTeam(teamData)
      setMatches(m)
      setPlayers(p)
      setParticipation(createEmptyParticipation(p))
      setLoading(false)
    }
    load()
  }, [teamId, router])

  const filtered = matches.filter(m => {
    if (filterLocVis !== 'all' && m.loc_vis !== filterLocVis) return false
    if (filterMonth !== 'all' && new Date(m.date).getMonth() + 1 !== parseInt(filterMonth)) return false
    return true
  })

  const wins = matches.filter(m => m.gf > m.gc).length
  const draws = matches.filter(m => m.gf === m.gc).length
  const losses = matches.filter(m => m.gf < m.gc).length

  function openForm() {
    setParticipation(createEmptyParticipation(players))
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.date || !form.rival) return
    const created = await createMatch({
      team_id: teamId,
      date: form.date,
      rival: form.rival,
      jornada: form.jornada ? parseInt(form.jornada) : null,
      loc_vis: form.loc_vis,
      gf: form.gf,
      gc: form.gc,
      mvp_player_id: form.mvp_player_id || null,
      notes: form.notes || null,
      rival_style: form.rival_style || null,
      rival_system: form.rival_system || null,
      rival_dangers: form.rival_dangers || null,
      rival_weakness: form.rival_weakness || null,
    })

    const participationRows = Object.values(participation).filter(hasParticipation)
    if (participationRows.length > 0) {
      await createMatchPlayers(created.id, participationRows)
    }

    const m = await getMatches(teamId)
    setMatches(m)
    setShowForm(false)
    setForm({ date: '', rival: '', jornada: '', loc_vis: 'local', gf: 0, gc: 0, mvp_player_id: '', notes: '', rival_style: '', rival_system: '', rival_dangers: '', rival_weakness: '' })
    setParticipation(createEmptyParticipation(players))
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este partido?')) return
    await deleteMatch(id)
    setMatches(matches.filter(m => m.id !== id))
  }

  function getResult(m: Match) {
    if (m.gf > m.gc) return { label: 'V', color: '#00e5a0' }
    if (m.gf === m.gc) return { label: 'E', color: '#f59e0b' }
    return { label: 'D', color: '#ef4444' }
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/equipos/${teamId}`)}
            className="rounded border border-f7-border2 bg-transparent px-3 py-1 text-xs text-f7-text2 transition-colors hover:bg-f7-bg3"
          >
            ← Volver
          </button>
          <div className="font-bebas text-lg tracking-wider text-f7-accent">
            {team?.name} - PARTIDOS
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-f7-text3 text-xs">{userEmail}</span>
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Team Info Summary */}
        <div className="mb-4 rounded-xl border border-f7-border bg-f7-bg2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-xs text-f7-text3 uppercase tracking-wider">Equipo</div>
              <div className="text-sm font-semibold">{team?.name}</div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/equipos/${teamId}`)}
              className="rounded-lg border border-f7-border2 bg-transparent px-4 py-2 text-xs font-semibold text-f7-text2 transition-colors hover:bg-f7-bg3"
            >
              ← Volver al Equipo
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Partidos', value: matches.length, color: 'text-f7-text' },
            { label: 'Victorias', value: wins, color: 'text-f7-accent' },
            { label: 'Empates', value: draws, color: 'text-f7-accent3' },
            { label: 'Derrotas', value: losses, color: 'text-f7-red' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-f7-border bg-f7-bg3 p-3"
            >
              <div className="mb-1 text-xs text-f7-text3 uppercase tracking-wider">
                {metric.label}
              </div>
              <div className={`font-bebas text-2xl ${metric.color} leading-none`}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Historial */}
        <div className="mb-4 rounded-xl border border-f7-border bg-f7-bg2 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-f7-border bg-f7-bg3 px-4 py-3">
            <div className="font-bebas text-lg tracking-wide text-f7-accent">
              HISTORIAL
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterLocVis}
                onChange={(e) => setFilterLocVis(e.target.value)}
                className="rounded border border-f7-border2 bg-f7-bg3 px-2 py-1 text-xs text-f7-text outline-none transition-colors focus:border-f7-accent2"
              >
                <option value="all">Todos</option>
                <option value="local">Local</option>
                <option value="visitante">Visitante</option>
              </select>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="rounded border border-f7-border2 bg-f7-bg3 px-2 py-1 text-xs text-f7-text outline-none transition-colors focus:border-f7-accent2"
              >
                <option value="all">Todo el año</option>
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(
                  (m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  )
                )}
              </select>
              <button
                onClick={openForm}
                className="rounded-lg bg-f7-accent px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-[#00c988]"
              >
                + Nuevo
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-f7-text3 text-sm">
              Sin partidos registrados
            </div>
          ) : (
            filtered.map((m) => {
              const res = getResult(m)
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 border-b border-f7-border px-4 py-3 last:border-0"
                >
                  <div
                    className="font-bebas text-xl"
                    style={{ color: res.color, minWidth: '24px' }}
                  >
                    {res.label}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/equipos/${teamId}/partidos/${m.id}`
                      )
                    }
                    className="flex-1 text-left transition-colors hover:opacity-80"
                  >
                    <div className="text-sm font-semibold">{m.rival}</div>
                    <div className="text-xs text-f7-text3">
                      {m.date} · {m.loc_vis}{' '}
                      {m.jornada ? `· J${m.jornada}` : ''}
                    </div>
                  </button>
                  <div className="font-bebas text-xl tracking-wider">
                    {m.gf}—{m.gc}
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="rounded border border-f7-red bg-transparent px-2 py-1 text-xs text-f7-red transition-colors hover:bg-f7-red/10"
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal nuevo partido */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#050812]/92 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-xl border border-f7-border bg-f7-bg2 p-6">
            <div className="mb-4 font-bebas text-xl tracking-wider text-f7-accent">
              NUEVO PARTIDO
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                  Fecha
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                  Rival
                </label>
                <input
                  type="text"
                  value={form.rival}
                  onChange={(e) => setForm({ ...form, rival: e.target.value })}
                  placeholder="Equipo rival"
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                  Jornada
                </label>
                <input
                  type="number"
                  value={form.jornada}
                  onChange={(e) => setForm({ ...form, jornada: e.target.value })}
                  placeholder="Nº"
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                  Local/Vis
                </label>
                <select
                  value={form.loc_vis}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      loc_vis: e.target.value as 'local' | 'visitante',
                    })
                  }
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                >
                  <option value="local">Local</option>
                  <option value="visitante">Visitante</option>
                </select>
              </div>
              <div className="col-span-1"></div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                  GF
                </label>
                <input
                  type="number"
                  value={form.gf}
                  onChange={(e) =>
                    setForm({ ...form, gf: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                  GC
                </label>
                <input
                  type="number"
                  value={form.gc}
                  onChange={(e) =>
                    setForm({ ...form, gc: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                MVP
              </label>
              <select
                value={form.mvp_player_id}
                onChange={(e) => setForm({ ...form, mvp_player_id: e.target.value })}
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
              >
                <option value="">Sin MVP</option>
                {players
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.dorsal ? `(${p.dorsal})` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                Notas
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas del partido..."
                rows={2}
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2 resize-y"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                Estilo rival
              </label>
              <input
                type="text"
                value={form.rival_style}
                onChange={(e) => setForm({ ...form, rival_style: e.target.value })}
                placeholder="Ej: Ofensivo, defensivo..."
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                Sistema rival
              </label>
              <input
                type="text"
                value={form.rival_system}
                onChange={(e) => setForm({ ...form, rival_system: e.target.value })}
                placeholder="Ej: 1-2-3-1"
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                Peligros rival
              </label>
              <textarea
                value={form.rival_dangers}
                onChange={(e) => setForm({ ...form, rival_dangers: e.target.value })}
                placeholder="Jugadores o situaciones peligrosas..."
                rows={2}
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2 resize-y"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs text-f7-text3 uppercase tracking-wider">
                Debilidades rival
              </label>
              <textarea
                value={form.rival_weakness}
                onChange={(e) => setForm({ ...form, rival_weakness: e.target.value })}
                placeholder="Aspectos a explotar..."
                rows={2}
                className="w-full rounded-lg border border-f7-border2 bg-f7-bg3 px-3 py-2 text-sm text-f7-text outline-none transition-colors focus:border-f7-accent2 resize-y"
              />
            </div>

            <div className="mb-4 rounded-xl border border-f7-border bg-f7-bg3 p-4">
              <div className="mb-3 font-bebas text-lg tracking-wide text-f7-accent">
                PARTICIPACIÓN
              </div>
              <MatchParticipationForm
                players={players}
                participation={participation}
                onChange={setParticipation}
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
                onClick={handleSave}
                disabled={!form.date || !form.rival}
                className="flex-1 rounded-lg bg-f7-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00c988] disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
