import { calcPnl, formatPnl } from '../../lib/utils'
import type { FormValues } from './formTypes'

interface Props {
  values: FormValues
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
}

export default function StepExit({ values, onChange }: Props) {
  const livePnl = values.still_open
    ? null
    : calcPnl(values.direction, values.entry_price, values.exit_price, values.quantity)

  const pnlColor =
    livePnl == null ? 'text-zinc-400' : livePnl > 0 ? 'text-green-500' : 'text-red-500'

  const inputCls =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-40'

  return (
    <div className="space-y-4">
      {/* Still open toggle */}
      <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3 border border-zinc-700/50">
        <div>
          <p className="text-sm font-medium text-white">Trade still open</p>
          <p className="text-xs text-zinc-500">Hide exit fields — log close later</p>
        </div>
        <button
          type="button"
          onClick={() => onChange('still_open', !values.still_open)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            values.still_open ? 'bg-blue-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              values.still_open ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
            Exit Date
          </label>
          <input
            type="date"
            value={values.exit_date}
            onChange={(e) => onChange('exit_date', e.target.value)}
            disabled={values.still_open}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
            Exit Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.exit_price}
            onChange={(e) => onChange('exit_price', e.target.value)}
            disabled={values.still_open}
            className={inputCls}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Live P&L display */}
      <div className="bg-zinc-800/50 rounded-xl px-4 py-4 border border-zinc-700/50 text-center">
        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Calculated P&amp;L</p>
        <p className={`text-3xl font-bold font-mono ${pnlColor}`}>
          {values.still_open ? 'Open' : formatPnl(livePnl)}
        </p>
        {!values.still_open && values.entry_price && values.exit_price && values.quantity && (
          <p className="text-xs text-zinc-500 mt-1">
            ({values.direction === 'long' ? 'Long' : 'Short'}: {values.quantity} × $
            {values.entry_price} → ${values.exit_price})
          </p>
        )}
      </div>
    </div>
  )
}
