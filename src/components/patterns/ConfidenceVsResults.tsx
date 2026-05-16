import ChartCard from './ChartCard'
import { formatPnl } from '../../lib/utils'
import type { ConfidenceVsResultsItem } from '../../hooks/usePatterns'

interface Props {
  data: ConfidenceVsResultsItem[]
}

const CONFIDENCE_LABELS: Record<number, string> = {
  1: '1 — Very Low',
  2: '2 — Low',
  3: '3 — Neutral',
  4: '4 — High',
  5: '5 — Very High',
}

function confidenceColor(c: number): string {
  if (c <= 2) return 'bg-red-500'
  if (c === 3) return 'bg-yellow-500'
  return 'bg-green-500'
}

function confidenceTextColor(c: number): string {
  if (c <= 2) return 'text-red-400'
  if (c === 3) return 'text-yellow-400'
  return 'text-green-400'
}

export default function ConfidenceVsResults({ data }: Props) {
  if (data.length === 0) {
    return (
      <ChartCard title="Confidence vs Results">
        <p className="text-zinc-500 text-sm text-center py-6">
          Log confidence scores on trades to see patterns
        </p>
      </ChartCard>
    )
  }

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.avgPnl)), 1)

  const best = [...data].sort((a, b) => b.avgPnl - a.avgPnl)[0]

  return (
    <ChartCard title="Confidence vs Results">
      <div className="space-y-3">
        {data.map(({ confidence, avgPnl, winRate, count }) => {
          const pct = Math.abs(avgPnl) / maxAbs
          const isPositive = avgPnl >= 0
          return (
            <div key={confidence} className="flex items-center gap-3">
              <span className={`text-xs font-medium w-20 shrink-0 ${confidenceTextColor(confidence)}`}>
                {CONFIDENCE_LABELS[confidence]}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${isPositive ? confidenceColor(confidence) : 'bg-red-500'}`}
                    style={{ width: `${Math.round(pct * 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-mono w-20 text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPnl(avgPnl)} avg
                </span>
              </div>
              <span className="text-xs text-zinc-500 w-16 text-right">
                {Math.round(winRate)}% win · {count}t
              </span>
            </div>
          )
        })}
      </div>

      {best && (
        <p className="text-xs text-zinc-500 mt-4 pt-3 border-t border-zinc-800">
          Confidence {best.confidence} trades perform best (avg {formatPnl(best.avgPnl)})
        </p>
      )}
    </ChartCard>
  )
}
