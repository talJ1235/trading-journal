import { emotionEmoji, formatPnl } from '../../lib/utils'
import { TAG_CONFIG, TAG_ORDER } from '../../lib/constants'
import type { Trade, TradeTag } from '../../types'

interface Props {
  trades: Trade[]
}

function avg(vals: (number | null | undefined)[]): number | null {
  const nums = vals.filter((v): v is number => v != null)
  return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : null
}

export default function WeekStats({ trades }: Props) {
  if (trades.length === 0) return null

  const closed = trades.filter((t) => t.pnl != null)
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0)
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : null

  const tagCounts: Partial<Record<TradeTag, number>> = {}
  for (const t of trades) {
    if (t.tag) tagCounts[t.tag] = (tagCounts[t.tag] ?? 0) + 1
  }

  const avgBefore = avg(trades.map((t) => t.emotion_before))
  const avgDuring = avg(trades.map((t) => t.emotion_during))
  const avgAfter = avg(trades.map((t) => t.emotion_after))
  const hasEmotions = avgBefore != null || avgDuring != null || avgAfter != null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Trades</p>
          <p className="text-2xl font-bold font-mono text-white">{trades.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Win Rate</p>
          <p className={`text-2xl font-bold font-mono ${winRate == null ? 'text-zinc-500' : winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
            {winRate == null ? '—' : `${winRate}%`}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">P&amp;L</p>
          <p className={`text-2xl font-bold font-mono ${totalPnl > 0 ? 'text-green-500' : totalPnl < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
            {formatPnl(totalPnl)}
          </p>
        </div>
      </div>

      {Object.keys(tagCounts).length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">Tag Breakdown</p>
          <div className="space-y-2">
            {TAG_ORDER.filter((tag) => tagCounts[tag]).map((tag) => {
              const count = tagCounts[tag] ?? 0
              const pct = Math.round((count / trades.length) * 100)
              return (
                <div key={tag} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-28 capitalize">{TAG_CONFIG[tag].label}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full transition-all ${TAG_CONFIG[tag].solid}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-zinc-400 w-4 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasEmotions && (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">Emotion Average</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {([
              { label: 'Before', value: avgBefore },
              { label: 'During', value: avgDuring },
              { label: 'After',  value: avgAfter },
            ] as { label: string; value: number | null }[]).map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                <p className="text-lg">{emotionEmoji(value)}</p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{value != null ? value.toFixed(1) : '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
