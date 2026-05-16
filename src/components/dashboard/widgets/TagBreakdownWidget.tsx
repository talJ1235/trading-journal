import { usePatterns } from '../../../hooks/usePatterns'
import type { WidgetProps } from '../widgetRegistry'

const TAG_LABELS: Record<string, string> = {
  planned: 'Planned',
  impulse: 'Impulse',
  emotional_exit: 'Emotional Exit',
  surgical: 'Surgical',
  news_play: 'News Play',
}

export default function TagBreakdownWidget(_props: WidgetProps) {
  const { winRateByTag } = usePatterns()

  if (winRateByTag.length === 0) {
    return <p className="text-zinc-500 text-sm text-center pt-6">No tagged trades yet</p>
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      {winRateByTag.map(({ tag, winRate, wins, total }) => (
        <div key={tag}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300">{TAG_LABELS[tag] ?? tag}</span>
            <span className="text-zinc-400 font-mono">{winRate.toFixed(0)}% <span className="text-zinc-600">({wins}/{total})</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${winRate}%`,
                background: winRate >= 60 ? '#22C55E' : winRate >= 40 ? '#EAB308' : '#EF4444',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
