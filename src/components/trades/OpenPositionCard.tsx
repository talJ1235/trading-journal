import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import type { Trade } from '../../types'
import { useSettingsStore, formatPnlCurrency } from '../../store/settingsStore'
import { formatDate } from '../../lib/utils'

interface Props {
  trade: Trade
  livePrice: number | null | undefined
}

export default function OpenPositionCard({ trade, livePrice }: Props) {
  const { settings } = useSettingsStore()

  const livePnl =
    livePrice != null && trade.entry_price != null && trade.quantity != null
      ? trade.direction === 'long'
        ? (livePrice - trade.entry_price) * trade.quantity
        : (trade.entry_price - livePrice) * trade.quantity
      : null

  const pnlPositive = livePnl != null && livePnl >= 0
  const pnlColor = livePnl == null ? 'text-zinc-400' : pnlPositive ? 'text-green-400' : 'text-red-400'

  const isLoading = livePrice === undefined

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white">{trade.symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Open
            </span>
            {trade.direction === 'long' ? (
              <TrendingUp size={13} className="text-green-400" />
            ) : (
              <TrendingDown size={13} className="text-red-400" />
            )}
          </div>
          <span className="text-xs text-zinc-500">
            {formatDate(trade.entry_date)}
            {trade.quantity != null && trade.entry_price != null
              ? ` · ${trade.quantity} @ $${trade.entry_price}`
              : ''}
          </span>
        </div>

        <div className="text-right flex-shrink-0 ml-3">
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <RefreshCw size={12} className="animate-spin" />
              <span className="text-xs">Loading</span>
            </div>
          ) : livePrice != null ? (
            <>
              <p className="text-sm font-mono font-bold text-white">${livePrice.toFixed(2)}</p>
              <p className={`text-xs font-mono font-bold ${pnlColor}`}>
                {formatPnlCurrency(livePnl, settings.currency)}
              </p>
            </>
          ) : (
            <span className="text-xs text-zinc-500">No data</span>
          )}
        </div>
      </div>
    </div>
  )
}
