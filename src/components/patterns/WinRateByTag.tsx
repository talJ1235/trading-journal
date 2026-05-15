import ChartCard from './ChartCard'
import { TAG_CONFIG, TAG_ORDER } from '../../lib/constants'
import type { WinRateByTagItem } from '../../hooks/usePatterns'
import type { TradeTag } from '../../types'

interface Props {
  data: WinRateByTagItem[]
}

export default function WinRateByTag({ data }: Props) {
  if (data.length === 0) {
    return (
      <ChartCard title="Win Rate by Tag">
        <p className="text-zinc-500 text-sm text-center py-6">No tagged trades yet</p>
      </ChartCard>
    )
  }

  // Sort by TAG_ORDER to keep consistent visual order, filtered to what exists
  const sorted = TAG_ORDER
    .filter((tag) => data.some((d) => d.tag === tag))
    .map((tag) => data.find((d) => d.tag === tag)!)

  return (
    <ChartCard title="Win Rate by Tag">
      <div className="space-y-3">
        {sorted.map(({ tag, wins, total, winRate }) => {
          const cfg = TAG_CONFIG[tag as TradeTag]
          return (
            <div key={tag}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {winRate.toFixed(0)}% · {wins}/{total}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${cfg.solid}`}
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}
