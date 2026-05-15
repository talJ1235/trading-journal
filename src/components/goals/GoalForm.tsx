import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  initialAmount?: number
  initialDate?: string
  onSubmit: (target_amount: number, target_date: string) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors'

export default function GoalForm({ initialAmount, initialDate, onSubmit, onCancel, isOpen }: Props) {
  const [amount, setAmount] = useState(initialAmount?.toString() ?? '')
  const [date, setDate] = useState(initialDate ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return }
    if (!date || date <= today) { setError('Date must be in the future'); return }
    setError(null)
    setSaving(true)
    try {
      await onSubmit(amt, date)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="pt-4 space-y-3">
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Target Amount ($)
              </label>
              <input
                type="number"
                min="1"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputCls}
                placeholder="20000"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Target Date
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : 'Save Goal'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
