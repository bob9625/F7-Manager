import type { PlayerMatchStats } from '@/lib/matches'

type PlayerStatsSectionProps = {
  stats: PlayerMatchStats
}

export function PlayerStatsSection({ stats }: PlayerStatsSectionProps) {
  const items = [
    { label: 'Partidos', value: stats.partidos },
    { label: 'Goles', value: stats.goles },
    { label: 'Amarillas', value: stats.tarjetas_amarillas },
    { label: 'Rojas', value: stats.tarjetas_rojas },
    { label: 'Partes tot.', value: stats.partes_totales },
    { label: 'Partes/part.', value: stats.promedio_partes.toFixed(1) },
    {
      label: 'Nota media',
      value: stats.nota_media != null ? stats.nota_media.toFixed(1) : '—',
      accent: true,
    },
  ]

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-f7-border bg-f7-bg3/50 px-2 py-2 text-center"
        >
          <div className="text-[10px] text-f7-text3 uppercase tracking-wider">
            {item.label}
          </div>
          <div
            className={`font-bebas text-lg leading-tight ${
              item.accent ? 'text-f7-accent' : 'text-f7-text'
            }`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
