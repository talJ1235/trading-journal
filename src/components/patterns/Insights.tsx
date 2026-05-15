import { Lightbulb } from 'lucide-react'
import { formatPnl } from '../../lib/utils'
import type { PatternStats } from '../../hooks/usePatterns'
import type { Trade } from '../../types'

interface Props {
  patterns: PatternStats
  trades: Trade[]
}

function buildInsights(patterns: PatternStats, trades: Trade[]): string[] {
  const out: string[] = []

  // 1. Best trading day
  const bestDay = [...patterns.winRateByDay]
    .filter((d) => d.total >= 3)
    .sort((a, b) => b.winRate - a.winRate)[0]
  if (bestDay) {
    out.push(`Your best day is ${bestDay.day} (${bestDay.winRate.toFixed(0)}% win rate across ${bestDay.total} trades)`)
  }

  // 2. Impulse trade cost
  const impulsePnl = trades
    .filter((t) => t.tag === 'impulse' && t.pnl != null)
    .reduce((s, t) => s + (t.pnl ?? 0), 0)
  const impulseCount = trades.filter((t) => t.tag === 'impulse').length
  if (impulseCount >= 3 && impulsePnl < 0) {
    out.push(`Impulse trades have cost you ${formatPnl(impulsePnl)} across ${impulseCount} trades`)
  }

  // 3. Planned vs impulse win rate
  const planned = patterns.winRateByTag.find((d) => d.tag === 'planned')
  const impulse = patterns.winRateByTag.find((d) => d.tag === 'impulse')
  if (planned && impulse && planned.total >= 3 && impulse.total >= 3 && impulse.winRate > 0) {
    const diff = ((planned.winRate - impulse.winRate) / impulse.winRate) * 100
    if (Math.abs(diff) >= 10) {
      out.push(
        `Planned trades have a ${planned.winRate.toFixed(0)}% win rate vs ${impulse.winRate.toFixed(0)}% for impulse trades`
      )
    }
  }

  // 4. Best symbol
  if (patterns.bestSymbol && patterns.bestSymbol.trades >= 2) {
    out.push(
      `Best symbol: ${patterns.bestSymbol.symbol} (${formatPnl(patterns.bestSymbol.totalPnl)} across ${patterns.bestSymbol.trades} trades)`
    )
  }

  return out.slice(0, 4)
}

export default function Insights({ patterns, trades }: Props) {
  const insights = buildInsights(patterns, trades)

  if (insights.length === 0) return null

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-yellow-400" />
        <p className="text-xs text-zinc-400 uppercase tracking-wide">Insights</p>
      </div>
      <div className="space-y-2.5">
        {insights.map((text, i) => (
          <div key={i} className="flex gap-2.5">
            <span className="text-yellow-400 text-xs mt-0.5">→</span>
            <p className="text-zinc-300 text-sm leading-snug">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
