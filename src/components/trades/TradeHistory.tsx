import { useState, useMemo } from 'react'
import { Plus, Upload, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTradesStore } from '../../store/tradesStore'
import { useLivePrices } from '../../hooks/useLivePrices'
import type { Trade } from '../../types'
import TradeCard from './TradeCard'
import TradeFilters from './TradeFilters'
import TradeSkeleton from './TradeSkeleton'
import OpenPositionCard from './OpenPositionCard'
import type { GroupedPosition } from './OpenPositionCard'

interface FilterState {
  typeFilter: 'all' | 'stock' | 'etf'
  resultFilter: 'all' | 'win' | 'loss'
  dateFrom: string
  dateTo: string
}

interface Props {
  onAddTrade: () => void
  onDelete: (id: string) => Promise<void>
  onImportCsv: () => void
}

function applyFilters(trades: Trade[], f: FilterState): Trade[] {
  return trades.filter((t) => {
    if (f.typeFilter !== 'all' && t.type !== f.typeFilter) return false
    if (f.resultFilter === 'win' && (t.pnl == null || t.pnl <= 0)) return false
    if (f.resultFilter === 'loss' && (t.pnl == null || t.pnl >= 0)) return false
    if (f.dateFrom && t.entry_date < f.dateFrom) return false
    if (f.dateTo && t.entry_date > f.dateTo) return false
    return true
  })
}

export default function TradeHistory({ onAddTrade, onDelete, onImportCsv }: Props) {
  const { trades, loading, error } = useTradesStore()
  const [filters, setFilters] = useState<FilterState>({
    typeFilter: 'all',
    resultFilter: 'all',
    dateFrom: '',
    dateTo: '',
  })

  const openPositions = useMemo(() => trades.filter((t) => !t.exit_date), [trades])

  const groupedPositions = useMemo((): GroupedPosition[] => {
    const acc: Record<string, GroupedPosition> = {}
    for (const trade of openPositions) {
      // Group by symbol + direction so long and short are kept separate
      const key = `${trade.symbol}|${trade.direction}`
      if (!acc[key]) {
        acc[key] = {
          symbol: trade.symbol,
          type: trade.type,
          direction: trade.direction,
          trades: [],
          totalQuantity: 0,
          avgEntryPrice: 0,
          totalCost: 0,
          earliestDate: trade.entry_date,
        }
      }
      const pos = acc[key]
      pos.trades.push(trade)
      pos.totalQuantity += trade.quantity ?? 0
      pos.totalCost += (trade.entry_price ?? 0) * (trade.quantity ?? 0)
      if (trade.entry_date < pos.earliestDate) pos.earliestDate = trade.entry_date
    }
    // Compute weighted average entry price
    for (const pos of Object.values(acc)) {
      pos.avgEntryPrice = pos.totalQuantity > 0 ? pos.totalCost / pos.totalQuantity : 0
    }
    return Object.values(acc)
  }, [openPositions])

  // Deduplicate symbols for price fetching
  const openSymbols = useMemo(
    () => [...new Set(groupedPositions.map((p) => p.symbol))],
    [groupedPositions]
  )
  const { prices, refresh: refreshPrices, lastUpdated } = useLivePrices(openSymbols)

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filtered = applyFilters(trades, filters)

  return (
    <div className="relative">
      {/* Open Positions */}
      {groupedPositions.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 uppercase tracking-wide">
              Open Positions ({groupedPositions.length})
            </span>
            <button
              onClick={() => void refreshPrices()}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Refresh prices"
            >
              <RefreshCw size={11} />
              {lastUpdated
                ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Refresh'}
            </button>
          </div>
          <div className="space-y-2">
            {groupedPositions.map((position) => (
              <OpenPositionCard
                key={`${position.symbol}|${position.direction}`}
                position={position}
                livePrice={prices[position.symbol]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm">{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
        <button
          onClick={onImportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700"
        >
          <Upload size={13} /> Import CSV
        </button>
      </div>

      <TradeFilters {...filters} onChange={handleFilterChange} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm mb-3">
          {error}
        </div>
      )}

      {loading ? (
        <TradeSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-zinc-400 font-medium">
            {trades.length === 0 ? 'No trades yet' : 'No trades match filters'}
          </p>
          {trades.length === 0 && (
            <p className="text-zinc-500 text-sm mt-1">Log your first trade to get started</p>
          )}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {filtered.map((trade) => (
            <motion.div
              key={trade.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <TradeCard trade={trade} onDelete={onDelete} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* FAB — floating add button */}
      <button
        onClick={onAddTrade}
        className="fixed bottom-[76px] right-4 md:bottom-8 md:right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-30 transition-colors"
        aria-label="Add trade"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  )
}
