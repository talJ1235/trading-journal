import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isOpen: boolean
  onSubmit: (amount: number, date: string, notes: string) => Promise<void>
  onCancel: () => void
}

const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors'

export default function DepositForm({ isOpen, onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setAmount(''); setDate(today); setNotes(''); setError(null) }

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return }
    if (!date) { setError('Select a date'); return }
    setError(null)
    setSaving(true)
    try {
      await onSubmit(amt, date, notes)
      reset()
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
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputCls}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputCls}
                placeholder="Monthly contribution…"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { reset(); onCancel() }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : 'Save Deposit'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
