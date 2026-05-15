import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getSP500WeeklyReturn } from '../../lib/sp500'
import type { Trade } from '../../types'

interface Props {
  weekStart: string
  weekEnd: string
  weekTrades: Trade[]
}

function computeUserReturn(trades: Trade[]): number | null {
  const closed = trades.filter(
    (t) => t.pnl != null && t.entry_price != null && t.quantity != null && t.entry_price > 0
  )
  if (closed.length === 0) return null
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const capital = closed.reduce((s, t) => s + (t.entry_price! * Math.abs(t.quantity!)), 0)
  return capital > 0 ? (totalPnl / capital) * 100 : null
}

function sign(n: number): string {
  return n >= 0 ? '+' : ''
}

export default function SP500Comparison({ weekStart, weekEnd, weekTrades }: Props) {
  const [spReturn, setSpReturn] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSP500WeeklyReturn(weekStart, weekEnd)
      .then(setSpReturn)
      .finally(() => setLoading(false))
  }, [weekStart, weekEnd])

  // Hide entirely if key is missing and loading finished
  if (!loading && spReturn === null) return null

  const userReturn = computeUserReturn(weekTrades)
  const beating = userReturn != null && spReturn != null && userReturn > spReturn

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">S&P 500 Comparison</p>

      {loading ? (
        <div className="animate-pulse flex gap-4">
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            {userReturn != null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">You</span>
                <span className={`text-xl font-bold font-mono ${userReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sign(userReturn)}{userReturn.toFixed(2)}%
                </span>
              </div>
            )}
            {spReturn != null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">S&P 500</span>
                <span className={`text-xl font-bold font-mono ${spReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sign(spReturn)}{spReturn.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {userReturn != null && spReturn != null && (
            <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl w-fit ${
              beating ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {beating ? <TrendingUp size={13} /> : userReturn === spReturn ? <Minus size={13} /> : <TrendingDown size={13} />}
              {beating ? 'Beating the market ✓' : 'Lagging the market'}
            </div>
          )}
        </>
      )}
    </div>
  )
}
