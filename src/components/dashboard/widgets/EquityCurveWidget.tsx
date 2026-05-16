import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePatterns } from '../../../hooks/usePatterns'
import type { WidgetProps } from '../widgetRegistry'

type Range = '1M' | '3M' | 'All'

function cutoff(range: Range): Date {
  const now = new Date()
  if (range === '1M') return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  if (range === '3M') return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  return new Date(0)
}

function fmtDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface TipProps { active?: boolean; payload?: { value?: number }[]; label?: string }
function Tip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null
  const v = payload[0].value ?? 0
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-0.5">{label ? fmtDate(label) : ''}</p>
      <p className={`font-mono font-semibold ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {v >= 0 ? '+$' : '-$'}{Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function EquityCurveWidget({ h }: WidgetProps) {
  const { equityCurve } = usePatterns()
  const [range, setRange] = useState<Range>('All')

  const filtered = equityCurve.filter((d) => new Date(d.date + 'T12:00:00') >= cutoff(range))
  const last = filtered[filtered.length - 1]?.cumPnl ?? 0
  const color = last >= 0 ? '#22C55E' : '#EF4444'
  const showAxes = h >= 3

  if (equityCurve.length < 2) {
    return <p className="text-zinc-500 text-sm text-center pt-6">Not enough data yet</p>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end gap-1 mb-1 shrink-0">
        {(['1M', '3M', 'All'] as Range[]).map((r) => (
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
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showAxes && <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />}
            {showAxes && (
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#a1a1aa', fontSize: 10 }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
            )}
            {showAxes && (
              <YAxis tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            )}
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="cumPnl" stroke={color} fill="url(#eq-grad)"
              strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
