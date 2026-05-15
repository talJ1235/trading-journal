import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import ChartCard from './ChartCard'
import type { EquityCurvePoint } from '../../hooks/usePatterns'

interface Props {
  data: EquityCurvePoint[]
}

type Range = '1M' | '3M' | '6M' | 'All'

const RANGES: Range[] = ['1M', '3M', '6M', 'All']

function cutoffDate(range: Range): Date {
  const now = new Date()
  if (range === '1M') return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  if (range === '3M') return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  if (range === '6M') return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
  return new Date(0)
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtDollar(v: number): string {
  return (v >= 0 ? '+$' : '-$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface TipProps { active?: boolean; payload?: { value?: number }[]; label?: string }
function Tip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-0.5">{label ? fmtDate(label) : ''}</p>
      <p className={`font-mono font-semibold ${(payload[0].value ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {fmtDollar(payload[0].value ?? 0)}
      </p>
    </div>
  )
}

export default function EquityCurve({ data }: Props) {
  const [range, setRange] = useState<Range>('All')

  const filtered = data.filter((d) => new Date(d.date + 'T12:00:00') >= cutoffDate(range))
  const lastValue = filtered[filtered.length - 1]?.cumPnl ?? 0
  const color = lastValue >= 0 ? '#22C55E' : '#EF4444'
  const gradientId = 'equity-gradient'

  const toggles = (
    <div className="flex gap-1">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`text-xs px-2 py-0.5 rounded-lg transition-colors ${
            range === r ? 'bg-blue-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )

  if (data.length < 2) {
    return (
      <ChartCard title="Equity Curve">
        <p className="text-zinc-500 text-sm text-center py-8">Not enough data yet</p>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Equity Curve" action={toggles}>
      <ResponsiveContainer width="100%" height={192}>
        <AreaChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v: number) => `$${Math.round(v).toLocaleString()}`}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <Tooltip content={<Tip />} />
          <Area
            type="monotone"
            dataKey="cumPnl"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
