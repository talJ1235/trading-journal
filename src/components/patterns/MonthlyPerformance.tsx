import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import ChartCard from './ChartCard'
import type { MonthlyPerfItem } from '../../hooks/usePatterns'
import { formatPnl } from '../../lib/utils'

interface Props {
  data: MonthlyPerfItem[]
}

interface TipProps {
  active?: boolean
  payload?: { payload?: MonthlyPerfItem }[]
}
function Tip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs space-y-0.5">
      <p className="text-zinc-400">{d.month}</p>
      <p className={`font-mono font-semibold ${d.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {formatPnl(d.pnl)}
      </p>
      <p className="text-zinc-500">{d.winRate.toFixed(0)}% win rate · {d.trades} trades</p>
    </div>
  )
}

export default function MonthlyPerformance({ data }: Props) {
  if (data.length === 0) {
    return (
      <ChartCard title="Monthly Performance">
        <p className="text-zinc-500 text-sm text-center py-6">No monthly data yet</p>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Monthly Performance">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
