import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTradesStore } from '../../../store/tradesStore'
import { useSettingsStore, formatPnlCurrency } from '../../../store/settingsStore'
import type { WidgetProps } from '../widgetRegistry'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function PnlCalendarWidget({ h }: WidgetProps) {
  const { trades } = useTradesStore()
  const { settings } = useSettingsStore()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const pnlByDay = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of trades) {
      if (t.pnl == null) continue
      const key = t.entry_date.slice(0, 10)
      map[key] = (map[key] ?? 0) + t.pnl
    }
    return map
  }, [trades])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstWeekday(viewYear, viewMonth)
  const prefix = settings.week_start === 'monday' ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthDays = Object.entries(pnlByDay).filter(([k]) => k.startsWith(monthKey))
  const monthTotal = monthDays.reduce((s, [, v]) => s + v, 0)
  const activeDays = monthDays.length

  const prev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const next = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const compact = h < 4
  const dayLabels = settings.week_start === 'monday'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="h-full flex flex-col gap-1">
      <div className="flex items-center justify-between shrink-0">
        <button onClick={prev} className="p-0.5 text-zinc-500 hover:text-zinc-300"><ChevronLeft size={14} /></button>
        <span className="text-xs text-zinc-400 font-medium">
          {new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
        <button onClick={next} className="p-0.5 text-zinc-500 hover:text-zinc-300"><ChevronRight size={14} /></button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 shrink-0">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-center text-[9px] text-zinc-600 font-medium pb-0.5">{d}</div>
        ))}
        {Array.from({ length: prefix }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const key = `${monthKey}-${String(day).padStart(2, '0')}`
          const pnl = pnlByDay[key]
          return (
            <div
              key={day}
              title={pnl != null ? formatPnlCurrency(pnl, settings.currency) : undefined}
              className={`aspect-square rounded-sm text-[9px] flex items-center justify-center transition-colors ${
                pnl == null
                  ? 'bg-zinc-800/40 text-zinc-700'
                  : pnl > 0
                  ? 'bg-green-500/30 text-green-400'
                  : 'bg-red-500/30 text-red-400'
              }`}
            >
              {compact ? '' : day}
            </div>
          )
        })}
      </div>

      {!compact && (
        <div className="flex gap-3 mt-auto pt-1 border-t border-zinc-800 shrink-0">
          <div className="text-center flex-1">
            <p className={`text-sm font-mono font-semibold ${monthTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnlCurrency(monthTotal, settings.currency)}
            </p>
            <p className="text-[10px] text-zinc-600">month</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-sm font-mono font-semibold text-zinc-300">{activeDays}</p>
            <p className="text-[10px] text-zinc-600">active days</p>
          </div>
        </div>
      )}
    </div>
  )
}
