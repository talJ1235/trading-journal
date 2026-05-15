import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import DepositForm from './DepositForm'
import { formatDate } from '../../lib/utils'
import type { Deposit } from '../../types'

interface Props {
  deposits: Deposit[]
  loading: boolean
  onAdd: (amount: number, date: string, notes: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function DepositList({ deposits, loading, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)

  const now = new Date()
  const yearStr = now.getFullYear().toString()
  const monthStr = now.toISOString().slice(0, 7) // "YYYY-MM"

  const total = deposits.reduce((s, d) => s + d.amount, 0)
  const thisYear = deposits.filter((d) => d.date.startsWith(yearStr)).reduce((s, d) => s + d.amount, 0)
  const thisMonth = deposits.filter((d) => d.date.startsWith(monthStr)).reduce((s, d) => s + d.amount, 0)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this deposit?')) return
    await onDelete(id)
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-zinc-400 uppercase tracking-wide">Deposits</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <Plus size={13} /> Add Deposit
        </button>
      </div>

      {/* Inline add form */}
      <DepositForm
        isOpen={showForm}
        onSubmit={async (amt, date, notes) => { await onAdd(amt, date, notes); setShowForm(false) }}
        onCancel={() => setShowForm(false)}
      />

      {/* Summary mini-cards */}
      {deposits.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
          {[
            { label: 'Total', value: total },
            { label: 'This Year', value: thisYear },
            { label: 'This Month', value: thisMonth },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-800/60 rounded-xl p-2.5 text-center">
              <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
              <p className="text-sm font-mono font-bold text-green-400">${fmt(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b border-zinc-800">
              <div className="h-3 bg-zinc-800 rounded w-1/3" />
              <div className="h-3 bg-zinc-800 rounded w-1/5" />
            </div>
          ))}
        </div>
      ) : deposits.length === 0 && !showForm ? (
        <p className="text-zinc-500 text-sm text-center py-6">No deposits recorded yet</p>
      ) : (
        <div>
          {deposits.map((d, i) => (
            <div
              key={d.id}
              className={`flex items-center justify-between py-3 ${
                i < deposits.length - 1 ? 'border-b border-zinc-800' : ''
              }`}
            >
              <div>
                <p className="text-sm text-zinc-300">{formatDate(d.date)}</p>
                {d.notes && <p className="text-xs text-zinc-500 mt-0.5">{d.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-semibold text-green-400">
                  +${fmt(d.amount)}
                </span>
                <button
                  onClick={() => void handleDelete(d.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                  aria-label="Delete deposit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
