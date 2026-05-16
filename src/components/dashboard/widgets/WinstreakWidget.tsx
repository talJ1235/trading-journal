import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { useTradesStore } from '../../../store/tradesStore'
import type { WidgetProps } from '../widgetRegistry'

export default function WinstreakWidget(_props: WidgetProps) {
  const { trades } = useTradesStore()

  const { current, best } = useMemo(() => {
    const closed = [...trades].filter((t) => t.pnl != null).sort((a, b) => a.entry_date.localeCompare(b.entry_date))
    let cur = 0
    let best = 0
    let tmp = 0
    for (const t of closed) {
      if ((t.pnl ?? 0) > 0) { tmp++; if (tmp > best) best = tmp }
      else tmp = 0
    }
    cur = tmp
    return { current: cur, best }
  }, [trades])

  return (
    <div className="h-full flex items-center justify-center gap-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Flame size={16} className={current > 0 ? 'text-orange-400' : 'text-zinc-600'} />
          <span className={`text-4xl font-bold font-mono ${current > 0 ? 'text-orange-400' : 'text-zinc-500'}`}>{current}</span>
        </div>
        <p className="text-zinc-500 text-xs">Current</p>
      </div>
      <div className="w-px h-10 bg-zinc-800" />
      <div className="text-center">
        <p className="text-4xl font-bold font-mono text-zinc-300">{best}</p>
        <p className="text-zinc-500 text-xs">Best</p>
      </div>
    </div>
  )
}
