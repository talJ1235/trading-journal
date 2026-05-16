import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { usePatterns } from '../../../hooks/usePatterns'
import type { WidgetProps } from '../widgetRegistry'

interface TipProps { active?: boolean; payload?: { value?: number }[]; label?: string }
function Tip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null
  const v = payload[0].value ?? 0
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      <p className={`font-mono font-semibold ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {v >= 0 ? '+$' : '-$'}{Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })} avg
      </p>
    </div>
  )
}

export default function EmotionWidget({ h }: WidgetProps) {
  const { avgPnlByEmotion } = usePatterns()
  const showAxes = h >= 4

  if (avgPnlByEmotion.length === 0) {
    return <p className="text-zinc-500 text-sm text-center pt-6">Not enough data yet</p>
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={avgPnlByEmotion} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          {showAxes && (
            <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 14 }} axisLine={false} tickLine={false} />
          )}
          {showAxes && (
            <YAxis tickFormatter={(v: number) => `$${Math.round(v)}`}
              tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
          )}
          <Tooltip content={<Tip />} />
          <ReferenceLine y={0} stroke="#3f3f46" />
          <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
            {avgPnlByEmotion.map((entry, i) => (
              <Cell key={i} fill={entry.avgPnl >= 0 ? '#22C55E' : '#EF4444'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
