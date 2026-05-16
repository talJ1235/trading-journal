import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import type { Currency } from '../../store/settingsStore'

interface Props {
  onUpdate: (updates: { currency?: Currency; week_start?: 'monday' | 'sunday' }) => Promise<void>
}

export default function AccountSettings({ onUpdate }: Props) {
  const { settings } = useSettingsStore()
  const [saving, setSaving] = useState<string | null>(null)

  const handleCurrency = async (val: Currency) => {
    setSaving('currency')
    try { await onUpdate({ currency: val }) } finally { setSaving(null) }
  }

  const handleWeekStart = async (val: 'monday' | 'sunday') => {
    setSaving('week_start')
    try { await onUpdate({ week_start: val }) } finally { setSaving(null) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Account Settings</h2>
        <p className="text-sm text-zinc-500">Currency display and calendar preferences.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-400 uppercase tracking-wide mb-2">
            Currency
          </label>
          <div className="flex gap-2">
            {(['USD', 'ILS', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => void handleCurrency(c)}
                disabled={saving === 'currency'}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  settings.currency === c
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 uppercase tracking-wide mb-2">
            Week Starts On
          </label>
          <div className="flex gap-2">
            {([['monday', 'Monday'], ['sunday', 'Sunday']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => void handleWeekStart(val)}
                disabled={saving === 'week_start'}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  settings.week_start === val
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
