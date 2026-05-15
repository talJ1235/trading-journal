import { useState } from 'react'
import { Pencil, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GoalForm from './GoalForm'
import type { Goal } from '../../types'
import type { MonthlyPerfItem } from '../../hooks/usePatterns'

interface Props {
  goal: Goal | null
  loading: boolean
  monthlyPerformance: MonthlyPerfItem[]
  onCreate: (amount: number, date: string) => Promise<void>
  onUpdate: (id: string, updates: Partial<Pick<Goal, 'target_amount' | 'target_date' | 'current_amount'>>) => Promise<void>
}

function barColor(pct: number): string {
  if (pct >= 75) return 'bg-green-500'
  if (pct >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

function estimateCompletion(goal: Goal, monthly: MonthlyPerfItem[]): string {
  const remaining = goal.target_amount - goal.current_amount
  if (remaining <= 0) return 'Goal reached! 🎉'
  if (!monthly.length) return 'Log trades to see estimate'
  const avg = monthly.reduce((s, m) => s + m.pnl, 0) / monthly.length
  if (avg <= 0) return 'Keep trading to see estimate'
  const months = Math.ceil(remaining / avg)
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function GoalCard({ goal, loading, monthlyPerformance, onCreate, onUpdate }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showUpdateValue, setShowUpdateValue] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [updatingValue, setUpdatingValue] = useState(false)

  const handleUpdateValue = async () => {
    if (!goal) return
    const val = parseFloat(newValue)
    if (isNaN(val) || val < 0) return
    setUpdatingValue(true)
    try {
      await onUpdate(goal.id, { current_amount: val })
      setShowUpdateValue(false)
      setNewValue('')
    } finally {
      setUpdatingValue(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-zinc-800 rounded-full mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">Portfolio Goal</p>
        </div>
        {!showCreate ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <Target size={28} className="text-zinc-600" />
            <p className="text-zinc-400 text-sm">No goal set yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              Set a Goal
            </button>
          </div>
        ) : (
          <GoalForm
            isOpen={showCreate}
            onSubmit={async (amt, date) => { await onCreate(amt, date); setShowCreate(false) }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </div>
    )
  }

  const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  const estimate = estimateCompletion(goal, monthlyPerformance)

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 uppercase tracking-wide">Portfolio Goal</p>
        <button
          onClick={() => { setShowEdit(!showEdit); setShowCreate(false) }}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Edit goal"
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* Edit form */}
      <GoalForm
        isOpen={showEdit}
        initialAmount={goal.target_amount}
        initialDate={goal.target_date}
        onSubmit={async (amt, date) => { await onUpdate(goal.id, { target_amount: amt, target_date: date }); setShowEdit(false) }}
        onCancel={() => setShowEdit(false)}
      />

      {/* Progress */}
      {!showEdit && (
        <>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-mono font-bold text-white">
                ${goal.current_amount.toLocaleString()}
              </span>
              <span className="text-zinc-400 font-mono">
                ${goal.target_amount.toLocaleString()} — {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-4 rounded-full ${barColor(pct)}`}
                initial={{ width: '0%' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              At current pace:{' '}
              <span className="text-zinc-400">{estimate}</span>
            </p>
          </div>

          {/* Update current value */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-400 uppercase tracking-wide">Current Portfolio Value</p>
              <button
                onClick={() => { setShowUpdateValue(!showUpdateValue); setNewValue(goal.current_amount.toString()) }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Update Value
              </button>
            </div>
            <AnimatePresence>
              {showUpdateValue && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="8400"
                    />
                    <button
                      onClick={() => void handleUpdateValue()}
                      disabled={updatingValue}
                      className="px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                    >
                      {updatingValue ? '…' : 'Save'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
