import { useMemo } from 'react'
import { useTradesStore } from '../../../store/tradesStore'
import type { WidgetProps } from '../widgetRegistry'

export default function TradeCountWidget(_props: WidgetProps) {
  const { trades } = useTradesStore()

  const { total, closed, open, wins, losses } = useMemo(() => {
    const closed = trades.filter((t) => t.pnl != null)
    return {
      total: trades.length,
      closed: closed.length,
      open: trades.filter((t) => !t.exit_date).length,
      wins: closed.filter((t) => (t.pnl ?? 0) > 0).length,
      losses: closed.filter((t) => (t.pnl ?? 0) < 0).length,
    }
  }, [trades])

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      <p className="text-5xl font-bold font-mono text-white">{total}</p>
      <p className="text-zinc-500 text-xs">total trades</p>
      <div className="flex gap-4 mt-1 text-xs text-zinc-500">
        <span className="text-green-400">{wins}W</span>
        <span className="text-red-400">{losses}L</span>
        <span className="text-blue-400">{open} open</span>
        <span>{closed} closed</span>
      </div>
    </div>
  )
}
