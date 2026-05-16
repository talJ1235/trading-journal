import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FormValues } from './formTypes'
import RRCalculator from './RRCalculator'

interface Props {
  values: FormValues
  errors: Record<string, string>
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
}

const MICHA_QUESTIONS = [
  'מהו הסיגנל? (Tradytics / גרף / ווליום)',
  'מה מחיר הכניסה המדויק?',
  'מה היעד?',
  'מה הסטופ?',
  'כמה מניות / גודל פוזיציה?',
]

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-zinc-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function StepDetails({ values, errors, onChange }: Props) {
  const [showQuestions, setShowQuestions] = useState(false)

  const inputCls =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors'

  return (
    <div className="space-y-4">
      <Field label="Symbol" error={errors.symbol}>
        <input
          type="text"
          value={values.symbol}
          onChange={(e) => onChange('symbol', e.target.value.toUpperCase())}
          className={inputCls}
          placeholder="AAPL"
          autoCapitalize="characters"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <ToggleGroup
            options={[{ label: 'Stock', value: 'stock' }, { label: 'ETF', value: 'etf' }]}
            value={values.type}
            onChange={(v) => onChange('type', v)}
          />
        </Field>
        <Field label="Direction">
          <ToggleGroup
            options={[{ label: 'Long', value: 'long' }, { label: 'Short', value: 'short' }]}
            value={values.direction}
            onChange={(v) => onChange('direction', v)}
          />
        </Field>
      </div>

      <Field label="Entry Date" error={errors.entry_date}>
        <input
          type="date"
          value={values.entry_date}
          onChange={(e) => onChange('entry_date', e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry Price">
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.entry_price}
            onChange={(e) => onChange('entry_price', e.target.value)}
            className={inputCls}
            placeholder="0.00"
          />
        </Field>
        <Field label="Quantity">
          <input
            type="number"
            step="1"
            min="1"
            value={values.quantity}
            onChange={(e) => onChange('quantity', e.target.value)}
            className={inputCls}
            placeholder="100"
          />
        </Field>
      </div>

      <Field label="Signal (optional)">
        <input
          type="text"
          value={values.signal}
          onChange={(e) => onChange('signal', e.target.value)}
          className={inputCls}
          placeholder="e.g. Breakout above resistance"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Planned Target">
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.planned_target}
            onChange={(e) => onChange('planned_target', e.target.value)}
            className={inputCls}
            placeholder="0.00"
          />
        </Field>
        <Field label="Planned Stop">
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.planned_stop}
            onChange={(e) => onChange('planned_stop', e.target.value)}
            className={inputCls}
            placeholder="0.00"
          />
        </Field>
      </div>

      <RRCalculator
        direction={values.direction}
        entryPrice={values.entry_price}
        plannedTarget={values.planned_target}
        plannedStop={values.planned_stop}
        quantity={values.quantity}
      />

      {/* Collapsible micha.stocks pre-trade questions */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <button
          type="button"
          onClick={() => setShowQuestions((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400"
        >
          <span>💡 Pre-trade checks (optional)</span>
          <ChevronDown size={16} className={`transition-transform ${showQuestions ? 'rotate-180' : ''}`} />
        </button>
        {showQuestions && (
          <ul className="px-3 pb-3 space-y-1" dir="rtl">
            {MICHA_QUESTIONS.map((q, i) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-blue-400 shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
