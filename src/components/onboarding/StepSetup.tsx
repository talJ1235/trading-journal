import type { Currency } from '../../store/settingsStore'

interface Props {
  currency: Currency
  weekStart: 'sunday' | 'monday'
  broker: 'ibkr' | 'other'
  onCurrency: (v: Currency) => void
  onWeekStart: (v: 'sunday' | 'monday') => void
  onBroker: (v: 'ibkr' | 'other') => void
  onNext: () => void
  onSkip: () => void
}

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
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-zinc-800 last:border-0 gap-3">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </div>
  )
}

export default function StepSetup({ currency, weekStart, broker, onCurrency, onWeekStart, onBroker, onNext, onSkip }: Props) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
        Almost there — a few quick settings
      </h2>
      <p className="text-zinc-400 text-center mt-2 text-sm md:text-base">
        You can change these anytime in Settings.
      </p>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-2 mt-6 w-full max-w-lg">
        <SettingRow label="Display currency">
          <ToggleGroup<Currency>
            options={[
              { label: '$ USD', value: 'USD' },
              { label: '₪ ILS', value: 'ILS' },
              { label: '€ EUR', value: 'EUR' },
            ]}
            value={currency}
            onChange={onCurrency}
          />
        </SettingRow>

        <SettingRow label="Week starts on">
          <ToggleGroup<'sunday' | 'monday'>
            options={[
              { label: 'Sunday', value: 'sunday' },
              { label: 'Monday', value: 'monday' },
            ]}
            value={weekStart}
            onChange={onWeekStart}
          />
        </SettingRow>

        <SettingRow label="Your broker">
          <ToggleGroup<'ibkr' | 'other'>
            options={[
              { label: 'IBKR', value: 'ibkr' },
              { label: 'Other', value: 'other' },
            ]}
            value={broker}
            onChange={onBroker}
          />
        </SettingRow>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-6 w-full max-w-lg h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
      >
        Set Up My Journal →
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-zinc-600 hover:text-zinc-400 underline mt-4 transition-colors"
      >
        Skip setup
      </button>
    </div>
  )
}
