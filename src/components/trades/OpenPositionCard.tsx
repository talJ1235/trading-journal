import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import type { Trade } from '../../types'
import { useSettingsStore, formatPnlCurrency } from '../../store/settingsStore'
import { formatDate } from '../../lib/utils'

export interface GroupedPosition {
  symbol: string
  type: Trade['type']
  direction: Trade['direction']
  trades: Trade[]
  totalQuantity: number
  avgEntryPrice: number
  totalCost: number
  earliestDate: string
}

interface Props {
  position: GroupedPosition
  livePrice: number | null | undefined
}

export default function OpenPositionCard({ position, livePrice }: Props) {
  const { settings } = useSettingsStore()

  const livePnl =
    livePrice != null && position.totalQuantity > 0
      ? position.direction === 'long'
        ? (livePrice - position.avgEntryPrice) * position.totalQuantity
        : (position.avgEntryPrice - livePrice) * position.totalQuantity
      : null

  const livePnlPct =
    livePrice != null && position.avgEntryPrice > 0
      ? position.direction === 'long'
        ? ((livePrice - position.avgEntryPrice) / position.avgEntryPrice) * 100
        : ((position.avgEntryPrice - livePrice) / position.avgEntryPrice) * 100
      : null

  const pnlPositive = livePnl != null && livePnl >= 0
  const pnlColor = livePnl == null ? 'text-zinc-400' : pnlPositive ? 'text-green-400' : 'text-red-400'
  const isLoading = livePrice === undefined
  const hasMultiple = position.trades.length > 1

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          {/* Symbol row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white">{position.symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Open
            </span>
            {position.direction === 'long' ? (
              <TrendingUp size={13} className="text-green-400" />
            ) : (
              <TrendingDown size={13} className="text-red-400" />
            )}
            {hasMultiple && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {position.trades.length} lots
              </span>
            )}
          </div>

          {/* Size + avg price + date */}
          <span className="text-xs text-zinc-500">
            {position.totalQuantity} shares @ avg ${position.avgEntryPrice.toFixed(2)}
            {' · '}{formatDate(position.earliestDate)}
          </span>
        </div>

        {/* Right — price + P&L */}
        <div className="text-right flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-zinc-500 justify-end">
              <RefreshCw size={12} className="animate-spin" />
              <span className="text-xs">Loading</span>
            </div>
          ) : livePrice != null ? (
            <>
              <p className="text-sm font-mono font-bold text-white">${livePrice.toFixed(2)}</p>
              <p className={`text-xs font-mono font-bold ${pnlColor}`}>
                {formatPnlCurrency(livePnl, settings.currency)}
              </p>
              {livePnlPct != null && (
                <p className={`text-[10px] font-mono ${pnlColor}`}>
                  {livePnlPct >= 0 ? '+' : ''}{livePnlPct.toFixed(2)}%
                </p>
              )}
            </>
          ) : (
            <span className="text-xs text-zinc-500">No data</span>
          )}
        </div>
      </div>
    </div>
  )
}
