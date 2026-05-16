import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useTradesStore } from '../../../store/tradesStore'
import type { WidgetProps } from '../widgetRegistry'

export default function WinRateWidget({ w }: WidgetProps) {
  const { trades } = useTradesStore()

  const { winRate, wins, total } = useMemo(() => {
    const closed = trades.filter((t) => t.pnl != null)
    const w = closed.filter((t) => (t.pnl ?? 0) > 0).length
    return { winRate: closed.length ? (w / closed.length) * 100 : 0, wins: w, total: closed.length }
  }, [trades])

  const color = winRate > 50 ? '#22C55E' : '#EF4444'
  const showDonut = w >= 4 && total > 0

  if (total === 0) {
    return <p className="text-zinc-500 text-sm text-center pt-4">No closed trades yet</p>
  }

  return (
    <div className="h-full flex items-center justify-center gap-4">
      {showDonut && (
        <div className="w-16 h-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ v: wins }, { v: total - wins }]} dataKey="v" innerRadius="60%" outerRadius="100%" startAngle={90} endAngle={-270} strokeWidth={0}>
                <Cell fill={color} />
                <Cell fill="#27272a" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="text-center">
        <p className={`text-5xl font-bold font-mono ${winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
          {winRate.toFixed(0)}%
        </p>
        <p className="text-zinc-500 text-xs mt-1">{wins} wins / {total} trades</p>
      </div>
    </div>
  )
}
