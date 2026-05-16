import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { usePatterns } from '../../../hooks/usePatterns'
import type { WidgetProps } from '../widgetRegistry'

const CONF_LABEL: Record<number, string> = { 1: '1 Low', 2: '2', 3: '3 Mid', 4: '4', 5: '5 High' }
const CONF_COLOR: Record<number, string> = { 1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#84CC16', 5: '#22C55E' }

interface TipProps { active?: boolean; payload?: { value?: number; payload?: { confidence: number } }[]; label?: string }
function Tip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null
  const v = payload[0].value ?? 0
  const conf = payload[0].payload?.confidence ?? 0
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-0.5">Confidence {conf}</p>
      <p className={`font-mono font-semibold ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        avg {v >= 0 ? '+$' : '-$'}{Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function ConfidenceWidget({ h }: WidgetProps) {
  const { confidenceVsResults } = usePatterns()
  const showAxes = h >= 4

  if (confidenceVsResults.length === 0) {
    return <p className="text-zinc-500 text-sm text-center pt-6">Not enough data yet</p>
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={confidenceVsResults} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          {showAxes && (
            <XAxis dataKey="confidence" tickFormatter={(v: number) => CONF_LABEL[v] ?? String(v)}
              tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
          )}
          {showAxes && (
            <YAxis tickFormatter={(v: number) => `$${Math.round(v)}`}
              tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
          )}
          <Tooltip content={<Tip />} />
          <ReferenceLine y={0} stroke="#3f3f46" />
          <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
            {confidenceVsResults.map((entry) => (
              <Cell key={entry.confidence} fill={CONF_COLOR[entry.confidence] ?? '#a1a1aa'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
