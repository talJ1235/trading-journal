import { useState } from 'react'
import { Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { Trade } from '../../types'

function tradesToCsv(trades: Trade[]): string {
  const headers = [
    'id', 'symbol', 'type', 'direction', 'entry_date', 'exit_date',
    'entry_price', 'exit_price', 'quantity', 'pnl', 'tag',
    'signal', 'followed_plan', 'emotion_before', 'emotion_during', 'emotion_after',
    'planned_target', 'planned_stop', 'lesson', 'notes', 'created_at',
  ]
  const escape = (v: unknown) => {
    if (v == null) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const rows = trades.map((t) =>
    headers.map((h) => escape(t[h as keyof Trade])).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export default function DataExport() {
  const { user } = useAuthStore()
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!user) return
    setExporting(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
      if (dbError) throw dbError

      const csv = tradesToCsv(data ?? [])
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Data &amp; Export</h2>
        <p className="text-sm text-zinc-500">Download a copy of your trading data.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <p className="text-sm text-white font-medium mb-1">Export Trades as CSV</p>
        <p className="text-xs text-zinc-500 mb-3">
          All your trade records including P&amp;L, emotions, tags, and notes.
        </p>
        <button
          onClick={() => void handleExport()}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          <Download size={14} />
          {exporting ? 'Exporting…' : 'Download CSV'}
        </button>
      </div>
    </div>
  )
}
