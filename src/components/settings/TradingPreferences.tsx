import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

interface Props {
  onUpdate: (updates: {
    default_asset_type?: 'stock' | 'etf'
    default_position_size?: number | null
    show_micha_questions?: boolean
  }) => Promise<void>
}

export default function TradingPreferences({ onUpdate }: Props) {
  const { settings } = useSettingsStore()
  const [posSize, setPosSize] = useState(settings.default_position_size?.toString() ?? '')
  const [saving, setSaving] = useState<string | null>(null)

  const handleAssetType = async (val: 'stock' | 'etf') => {
    setSaving('asset')
    try { await onUpdate({ default_asset_type: val }) } finally { setSaving(null) }
  }

  const handleMicha = async (val: boolean) => {
    setSaving('micha')
    try { await onUpdate({ show_micha_questions: val }) } finally { setSaving(null) }
  }

  const handlePosSizeBlur = async () => {
    const n = posSize.trim() === '' ? null : parseFloat(posSize)
    if (n !== null && isNaN(n)) return
    setSaving('posSize')
    try { await onUpdate({ default_position_size: n }) } finally { setSaving(null) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Trading Preferences</h2>
        <p className="text-sm text-zinc-500">Defaults used when logging a new trade.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-400 uppercase tracking-wide mb-2">
            Default Asset Type
          </label>
          <div className="flex gap-2">
            {(['stock', 'etf'] as const).map((t) => (
              <button
                key={t}
                onClick={() => void handleAssetType(t)}
                disabled={saving === 'asset'}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border uppercase ${
                  settings.default_asset_type === t
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 uppercase tracking-wide mb-2">
            Default Position Size (shares)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={posSize}
            onChange={(e) => setPosSize(e.target.value)}
            onBlur={() => void handlePosSizeBlur()}
            placeholder="e.g. 100"
            className="w-40 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Psychology Questions</p>
            <p className="text-xs text-zinc-500 mt-0.5">Show emotion &amp; plan-following fields when logging</p>
          </div>
          <button
            onClick={() => void handleMicha(!settings.show_micha_questions)}
            disabled={saving === 'micha'}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.show_micha_questions ? 'bg-blue-500' : 'bg-zinc-700'
            }`}
            aria-label="Toggle psychology questions"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.show_micha_questions ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
