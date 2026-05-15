import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getSP500YtdReturn } from '../../lib/sp500'
import type { Trade } from '../../types'

interface Props {
  trades: Trade[]
}

function computeUserYtdReturn(trades: Trade[]): number | null {
  const yearStart = `${new Date().getFullYear()}-01-01`
  const ytd = trades.filter(
    (t) =>
      t.entry_date >= yearStart &&
      t.pnl != null &&
      t.entry_price != null &&
      t.quantity != null &&
      t.entry_price > 0
  )
  if (!ytd.length) return null
  const totalPnl = ytd.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const capital = ytd.reduce((s, t) => s + (t.entry_price! * Math.abs(t.quantity!)), 0)
  return capital > 0 ? (totalPnl / capital) * 100 : null
}

function sign(n: number): string {
  return n >= 0 ? '+' : ''
}

export default function YtdComparison({ trades }: Props) {
  const [spReturn, setSpReturn] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSP500YtdReturn()
      .then(setSpReturn)
      .finally(() => setLoading(false))
  }, [])

  const userReturn = computeUserYtdReturn(trades)
  const hasClosedTrades = trades.some((t) => t.pnl != null)

  // Hide if no API key (finished loading, still null) and no user data to show
  if (!loading && spReturn === null && !hasClosedTrades) return null

  const beating = userReturn != null && spReturn != null && userReturn > spReturn

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">S&P 500 — YTD</p>

      {loading ? (
        <div className="animate-pulse flex gap-4">
          <div className="h-8 w-28 bg-zinc-800 rounded-lg" />
          <div className="h-8 w-28 bg-zinc-800 rounded-lg" />
        </div>
      ) : !hasClosedTrades ? (
        <p className="text-zinc-500 text-sm">Start trading to see comparison</p>
      ) : (
        <>
          <div className="flex items-center gap-6 flex-wrap">
            {userReturn != null && (
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Your YTD</p>
                <p className={`text-2xl font-bold font-mono ${userReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sign(userReturn)}{userReturn.toFixed(2)}%
                </p>
              </div>
            )}
            {spReturn != null && (
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">S&P 500 YTD</p>
                <p className={`text-2xl font-bold font-mono ${spReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sign(spReturn)}{spReturn.toFixed(2)}%
                </p>
              </div>
            )}
          </div>

          {userReturn != null && spReturn != null && (
            <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl ${
              beating ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {beating ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {beating ? 'Beating the market ✓' : 'Lagging the market'}
            </div>
          )}
        </>
      )}
    </div>
  )
}
