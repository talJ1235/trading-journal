import ChartCard from './ChartCard'
import { formatPnl } from '../../lib/utils'
import type { EmotionAvgItem } from '../../hooks/usePatterns'

interface Props {
  data: EmotionAvgItem[]
}

export default function EmotionVsResults({ data }: Props) {
  if (data.length === 0) {
    return (
      <ChartCard title="Emotion vs Results">
        <p className="text-zinc-500 text-sm text-center py-6">
          Log emotions on at least 2 trades per level to see patterns
        </p>
      </ChartCard>
    )
  }

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.avgPnl)), 1)

  // Find the emotion with the best avg pnl for the insight line
  const best = [...data].sort((a, b) => b.avgPnl - a.avgPnl)[0]

  return (
    <ChartCard title="Emotion vs Results">
      <div className="space-y-3">
        {data.map(({ emotion, label, avgPnl, count }) => {
          const pct = Math.abs(avgPnl) / maxAbs
          const isPositive = avgPnl >= 0
          return (
            <div key={emotion} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">{label}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.round(pct * 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-mono w-20 text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPnl(avgPnl)} avg
                </span>
              </div>
              <span className="text-xs text-zinc-500 w-12 text-right">{count} trade{count !== 1 ? 's' : ''}</span>
            </div>
          )
        })}
      </div>

      {best && (
        <p className="text-xs text-zinc-500 mt-4 pt-3 border-t border-zinc-800">
          Your best trades happen when you feel {best.label} (avg {formatPnl(best.avgPnl)})
        </p>
      )}
    </ChartCard>
  )
}
