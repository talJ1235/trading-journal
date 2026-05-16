import { useMemo } from 'react'
import { useTradesStore } from '../../../store/tradesStore'
import { useSettingsStore, formatPnlCurrency } from '../../../store/settingsStore'
import type { WidgetProps } from '../widgetRegistry'

export default function NetPnlWidget(_props: WidgetProps) {
  const { trades } = useTradesStore()
  const { settings } = useSettingsStore()

  const { netPnl, closedCount } = useMemo(() => {
    const closed = trades.filter((t) => t.pnl != null)
    return { netPnl: closed.reduce((s, t) => s + (t.pnl ?? 0), 0), closedCount: closed.length }
  }, [trades])

  if (closedCount === 0) {
    return <p className="text-zinc-500 text-sm text-center pt-4">No closed trades yet</p>
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p className={`text-4xl font-bold font-mono ${netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {formatPnlCurrency(netPnl, settings.currency)}
      </p>
      <p className="text-zinc-500 text-xs mt-1">{closedCount} closed trade{closedCount !== 1 ? 's' : ''}</p>
    </div>
  )
}
