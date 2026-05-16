import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ChartCard from './ChartCard'
import { formatPnl } from '../../lib/utils'
import { useSettingsStore, formatPnlCurrency } from '../../store/settingsStore'
import type { Trade } from '../../types'

interface Props {
  trades: Trade[]
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekday(year: number, month: number): number {
  // 0=Sun, returns 0-based Mon-Sun index (Mon=0)
  const raw = new Date(year, month, 1).getDay()
  return (raw + 6) % 7
}

interface DayData {
  date: string
  pnl: number
  count: number
}

export default function PnlCalendar({ trades }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const { settings } = useSettingsStore()

  const goBack = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const goForward = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const monthStr = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const { dayMap, monthSummary } = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const map = new Map<string, DayData>()
    let totalPnl = 0
    let tradingDays = 0
    let bestPnl = -Infinity
    let bestDate = ''

    for (const t of trades) {
      if (!t.entry_date.startsWith(prefix)) continue
      const existing = map.get(t.entry_date) ?? { date: t.entry_date, pnl: 0, count: 0 }
      existing.pnl += t.pnl ?? 0
      existing.count++
      map.set(t.entry_date, existing)
    }

    for (const [date, d] of map) {
      totalPnl += d.pnl
      tradingDays++
      if (d.pnl > bestPnl) { bestPnl = d.pnl; bestDate = date }
    }

    return {
      dayMap: map,
      monthSummary: { totalPnl, tradingDays, bestPnl: bestPnl === -Infinity ? null : bestPnl, bestDate },
    }
  }, [trades, year, month])

  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekday(year, month)
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedTrades = selectedDay
    ? trades.filter((t) => t.entry_date === selectedDay)
    : []

  return (
    <ChartCard title="P&L Calendar">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goBack} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-white">{monthStr}</span>
        <button onClick={goForward} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] text-zinc-600 py-0.5">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const data = dayMap.get(dateStr)
          const isToday = dateStr === today.toISOString().split('T')[0]
          const isSelected = selectedDay === dateStr

          let cellBg = 'bg-zinc-800/40'
          let pnlText = ''
          if (data) {
            cellBg = data.pnl >= 0 ? 'bg-green-500/15' : 'bg-red-500/15'
            pnlText = formatPnl(data.pnl)
          }

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(isSelected ? null : (data ? dateStr : null))}
              disabled={!data}
              className={`rounded-md py-1 px-0.5 flex flex-col items-center transition-all ${cellBg} ${
                isSelected ? 'ring-1 ring-blue-500' : ''
              } ${isToday ? 'ring-1 ring-zinc-500' : ''} ${data ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}
            >
              <span className={`text-[10px] leading-none ${isToday ? 'text-blue-400 font-bold' : 'text-zinc-500'}`}>
                {day}
              </span>
              {data && (
                <span className={`text-[8px] leading-tight font-mono mt-0.5 ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pnlText}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day trades */}
      {selectedDay && selectedTrades.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          {selectedTrades.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-xs">
              <span className="text-white font-medium">{t.symbol}</span>
              <span className={`font-mono ${t.pnl == null ? 'text-zinc-500' : t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {t.pnl == null ? 'Open' : formatPnlCurrency(t.pnl, settings.currency)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Month summary */}
      {monthSummary.tradingDays > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Month P&L</p>
            <p className={`text-sm font-mono font-bold ${monthSummary.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnlCurrency(monthSummary.totalPnl, settings.currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Active Days</p>
            <p className="text-sm font-bold text-white">{monthSummary.tradingDays}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Best Day</p>
            <p className={`text-sm font-mono font-bold ${(monthSummary.bestPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthSummary.bestPnl != null ? formatPnlCurrency(monthSummary.bestPnl, settings.currency) : '—'}
            </p>
          </div>
        </div>
      )}

      {monthSummary.tradingDays === 0 && (
        <p className="text-zinc-600 text-xs text-center mt-3">No trades this month</p>
      )}
    </ChartCard>
  )
}
