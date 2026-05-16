import { useMemo } from 'react'
import { useTradesStore } from '../../../store/tradesStore'
import { useLivePrices } from '../../../hooks/useLivePrices'
import type { WidgetProps } from '../widgetRegistry'

export default function OpenPositionsWidget(_props: WidgetProps) {
  const { trades } = useTradesStore()

  const openPositions = useMemo(() => {
    const acc: Record<string, { symbol: string; totalQty: number; totalCost: number; direction: string }> = {}
    for (const t of trades.filter((t) => !t.exit_date)) {
      const key = `${t.symbol}|${t.direction}`
      if (!acc[key]) acc[key] = { symbol: t.symbol, totalQty: 0, totalCost: 0, direction: t.direction }
      acc[key].totalQty += t.quantity ?? 0
      acc[key].totalCost += (t.entry_price ?? 0) * (t.quantity ?? 0)
    }
    return Object.values(acc).map((p) => ({
      ...p,
      avgEntry: p.totalQty > 0 ? p.totalCost / p.totalQty : 0,
    }))
  }, [trades])

  const symbols = useMemo(() => [...new Set(openPositions.map((p) => p.symbol))], [openPositions])
  const { prices } = useLivePrices(symbols)

  if (openPositions.length === 0) {
    return <p className="text-zinc-500 text-sm text-center pt-6">No open positions</p>
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      {openPositions.map((pos) => {
        const live = prices[pos.symbol]
        const pnl = live != null ? (pos.direction === 'long' ? live - pos.avgEntry : pos.avgEntry - live) * pos.totalQty : null
        const pct = live != null && pos.avgEntry > 0 ? ((live - pos.avgEntry) / pos.avgEntry) * 100 * (pos.direction === 'long' ? 1 : -1) : null
        return (
          <div key={`${pos.symbol}|${pos.direction}`} className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-3 py-2">
            <div>
              <span className="text-sm font-semibold text-white">{pos.symbol}</span>
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${pos.direction === 'long' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {pos.direction.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              {live != null ? (
                <>
                  <p className="text-sm font-mono text-zinc-200">${live.toFixed(2)}</p>
                  {pnl != null && (
                    <p className={`text-xs font-mono ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)} {pct != null ? `(${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)` : ''}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-600">Loading…</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
