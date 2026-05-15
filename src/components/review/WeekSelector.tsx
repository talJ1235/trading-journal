import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  weekStart: Date
  weekEnd: Date
  tradeCount: number
  onPrev: () => void
  onNext: () => void
  isCurrentWeek: boolean
}

function fmt(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-US', opts)
}

export default function WeekSelector({
  weekStart,
  weekEnd,
  tradeCount,
  onPrev,
  onNext,
  isCurrentWeek,
}: Props) {
  const startStr = fmt(weekStart, { month: 'short', day: 'numeric' })
  const endStr = fmt(weekEnd, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mb-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">
            {isCurrentWeek ? 'Current week' : 'Week of'}
          </p>
          <p className="text-white font-semibold text-sm">
            {startStr} – {endStr}
          </p>
          <p className="text-xs mt-0.5">
            {tradeCount === 0 ? (
              <span className="text-zinc-500">No trades this week</span>
            ) : (
              <span className="text-blue-400">
                {tradeCount} trade{tradeCount !== 1 ? 's' : ''} this week
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={isCurrentWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
