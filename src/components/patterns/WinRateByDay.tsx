import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import ChartCard from './ChartCard'
import type { WinRateByDayItem } from '../../hooks/usePatterns'

interface Props {
  data: WinRateByDayItem[]
}

interface TipProps {
  active?: boolean
  payload?: { payload?: WinRateByDayItem }[]
  label?: string
}
function Tip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-0.5">{d.day}</p>
      {d.total === 0 ? (
        <p className="text-zinc-500">No trades</p>
      ) : (
        <p className="text-white font-mono">{d.wins} wins / {d.total} trades</p>
      )}
    </div>
  )
}

export default function WinRateByDay({ data }: Props) {
  const hasData = data.some((d) => d.total > 0)

  return (
    <ChartCard title="Win Rate by Day">
      {!hasData ? (
        <p className="text-zinc-500 text-sm text-center py-6">No trades logged yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.total === 0 ? '#3f3f46' : entry.winRate > 50 ? '#22C55E' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
