import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseIBKRCsv } from '../../lib/ibkrParser'
import type { IBKRRow, IBKRDepositRow } from '../../lib/ibkrParser'
import { checkDepositExists } from '../../hooks/useDeposits'
import { getAutoTag } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { TAG_CONFIG } from '../../lib/constants'
import type { TradeTag } from '../../types'

interface Props {
  onSuccess: () => Promise<void>
  onClose: () => void
}

type Screen = 'upload' | 'preview' | 'result'

interface TagCount { tag: TradeTag; count: number }

interface ResultData {
  imported: number
  depositsImported: number
  depositsDuplicate: number
  tagCounts: TagCount[]
  tradeError?: string
  depositError?: string
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function TradeTable({
  rows, selected, onToggleAll, onToggleRow,
}: {
  rows: IBKRRow[]
  selected: Set<number>
  onToggleAll: () => void
  onToggleRow: (i: number) => void
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 text-xs text-zinc-400">
        <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={onToggleAll} className="accent-blue-500" />
        <span>{selected.size} of {rows.length} selected</span>
      </div>
      <div className="overflow-auto max-h-52">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900 text-zinc-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left w-8" />
              <th className="px-2 py-2 text-left">Symbol</th>
              <th className="px-2 py-2 text-left">Dir</th>
              <th className="px-2 py-2 text-left">Date</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Price</th>
              <th className="px-2 py-2 text-right">P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onToggleRow(i)}
                className={`border-t border-zinc-800 cursor-pointer transition-colors ${selected.has(i) ? 'bg-zinc-800/30' : 'opacity-40'}`}
              >
                <td className="px-4 py-2">
                  <input type="checkbox" checked={selected.has(i)} onChange={() => onToggleRow(i)} onClick={(e) => e.stopPropagation()} className="accent-blue-500" />
                </td>
                <td className="px-2 py-2 font-medium text-white">{row.symbol}</td>
                <td className={`px-2 py-2 ${row.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                  {row.direction === 'long' ? 'L' : 'S'}
                </td>
                <td className="px-2 py-2 text-zinc-400">{row.entry_date}</td>
                <td className="px-2 py-2 text-right text-zinc-300">{row.quantity}</td>
                <td className="px-2 py-2 text-right text-zinc-300">${row.entry_price.toFixed(2)}</td>
                <td className={`px-2 py-2 text-right font-mono ${row.pnl == null ? 'text-zinc-500' : row.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {row.pnl == null ? '—' : `${row.pnl > 0 ? '+' : ''}$${fmt(row.pnl)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function DepositTable({ deposits }: { deposits: IBKRDepositRow[] }) {
  return (
    <div className="overflow-auto max-h-52">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-zinc-900 text-zinc-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((d, i) => (
            <tr key={i} className="border-t border-zinc-800">
              <td className="px-4 py-2 text-zinc-400">{d.date}</td>
              <td className={`px-4 py-2 text-right font-mono font-semibold ${d.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {d.amount >= 0 ? '+' : '-'}${fmt(d.amount)}
              </td>
              <td className="px-4 py-2 text-zinc-500 max-w-[140px] truncate">{d.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CsvImport({ onSuccess, onClose }: Props) {
  useEffect(() => {
    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [])

  const { user } = useAuthStore()
  const [screen, setScreen] = useState<Screen>('upload')
  const [rows, setRows] = useState<IBKRRow[]>([])
  const [deposits, setDeposits] = useState<IBKRDepositRow[]>([])
  const [skipped, setSkipped] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importDeposits, setImportDeposits] = useState(true)
  const [activeTab, setActiveTab] = useState<'trades' | 'deposits'>('trades')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') return
      const parsed = parseIBKRCsv(text)
      setRows(parsed.rows)
      setDeposits(parsed.deposits)
      setSkipped(parsed.skipped)
      setSelected(new Set(parsed.rows.map((_, i) => i)))
      setActiveTab('trades')
      setScreen('preview')
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const toggleAll = () =>
    setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)))

  const toggleRow = (i: number) =>
    setSelected((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleImport = async () => {
    if (!user) return
    setImporting(true)

    let imported = 0
    let depositsImported = 0
    let depositsDuplicate = 0
    let tradeError: string | undefined
    let depositError: string | undefined
    const tagMap = new Map<TradeTag, number>()

    // 1. Import selected trades
    const toInsert = rows
      .filter((_, i) => selected.has(i))
      .map((row) => {
        const tag = getAutoTag({ signal: null, planned_target: null, planned_stop: null, followed_plan: null, pnl: row.pnl, emotion_after: null })
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1)
        return {
          user_id: user.id, symbol: row.symbol, type: row.type,
          direction: row.direction, entry_date: row.entry_date,
          exit_date: null, entry_price: row.entry_price, exit_price: null,
          quantity: row.quantity, pnl: row.pnl, tag,
          signal: null, planned_target: null, planned_stop: null,
          emotion_before: null, emotion_during: null, emotion_after: null,
          followed_plan: null, lesson: null, notes: null,
        }
      })

    try {
      if (toInsert.length > 0) {
        const invalidTypes = toInsert.filter((t) => t.type !== 'stock' && t.type !== 'etf')
        if (invalidTypes.length > 0) {
          console.warn('[CsvImport] dropping rows with invalid type:', invalidTypes)
        }
        const validInsert = toInsert.filter((t) => t.type === 'stock' || t.type === 'etf')
        console.log('[CsvImport] inserting', validInsert.length, 'trades, sample:', JSON.stringify(validInsert[0], null, 2))
        const { error } = await supabase.from('trades').insert(validInsert)
        if (error) {
          console.error('[CsvImport] Supabase error:', error)
          throw error
        }
        imported = validInsert.length
      }
    } catch (err) {
      const e = err as { message?: string; details?: string; hint?: string; code?: string }
      const parts = [e.message, e.details, e.hint].filter(Boolean)
      tradeError = parts.join(' — ') || 'Failed to import trades'
    }

    // 2. Import deposits (if checkbox checked)
    if (importDeposits && deposits.length > 0) {
      for (const dep of deposits) {
        try {
          const isDupe = await checkDepositExists(user.id, dep.date, dep.amount)
          if (isDupe) { depositsDuplicate++; continue }
          const { error } = await supabase.from('deposits').insert({
            user_id: user.id, amount: dep.amount,
            date: dep.date, notes: dep.notes || null,
          })
          if (error) throw error
          depositsImported++
        } catch (err) {
          depositError = err instanceof Error ? err.message : 'Failed to import some deposits'
          break
        }
      }
    }

    const tagCounts: TagCount[] = Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count }))
    setResult({ imported, depositsImported, depositsDuplicate, tagCounts, tradeError, depositError })
    setScreen('result')

    try { await onSuccess() } catch { /* best-effort refresh */ }

    const hasError = !!tradeError || !!depositError
    if (!hasError) setTimeout(onClose, 2500)

    setImporting(false)
  }

  const reset = () => {
    setScreen('upload'); setRows([]); setDeposits([]); setSkipped(0)
    setSelected(new Set()); setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2 }}
        className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-white font-semibold text-sm">Import IBKR CSV</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── UPLOAD ── */}
          {screen === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                  dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/30'
                }`}
              >
                <Upload size={32} className="text-zinc-400" />
                <div className="text-center">
                  <p className="text-white text-sm font-medium">Drop your IBKR CSV here</p>
                  <p className="text-zinc-500 text-xs mt-1">or click to browse</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <p className="text-zinc-500 text-xs text-center mt-3">
                Export from IBKR: Reports → Tax → Transaction History
              </p>
            </motion.div>
          )}

          {/* ── PREVIEW ── */}
          {screen === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
              {skipped > 0 && (
                <div className="mx-4 mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-yellow-400 text-xs">
                  {skipped} row{skipped !== 1 ? 's' : ''} skipped (adjustments, dividends, or invalid data)
                </div>
              )}

              {rows.length === 0 && deposits.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-zinc-400 text-sm">No valid trades or deposits found.</p>
                  <p className="text-zinc-500 text-xs mt-1">Export Transaction History from IBKR Reports.</p>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="flex border-b border-zinc-800">
                    <button
                      onClick={() => setActiveTab('trades')}
                      className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                        activeTab === 'trades' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Trades ({rows.length})
                    </button>
                    {deposits.length > 0 && (
                      <button
                        onClick={() => setActiveTab('deposits')}
                        className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                          activeTab === 'deposits' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Deposits ({deposits.length})
                      </button>
                    )}
                  </div>

                  {activeTab === 'trades' && rows.length > 0 && (
                    <TradeTable rows={rows} selected={selected} onToggleAll={toggleAll} onToggleRow={toggleRow} />
                  )}
                  {activeTab === 'trades' && rows.length === 0 && (
                    <p className="text-zinc-500 text-sm text-center py-8">No trades found in this file.</p>
                  )}
                  {activeTab === 'deposits' && <DepositTable deposits={deposits} />}

                  {/* Deposit checkbox */}
                  {deposits.length > 0 && (
                    <label className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={importDeposits}
                        onChange={(e) => setImportDeposits(e.target.checked)}
                        className="accent-blue-500"
                      />
                      Import deposits ({deposits.length} found)
                    </label>
                  )}
                </>
              )}

              {/* Footer */}
              <div className="flex gap-3 p-4 border-t border-zinc-800">
                <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => void handleImport()}
                  disabled={importing || (selected.size === 0 && (!importDeposits || deposits.length === 0))}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {importing
                    ? 'Importing…'
                    : `Import ${selected.size} trade${selected.size !== 1 ? 's' : ''}${importDeposits && deposits.length > 0 ? ` + ${deposits.length} deposit${deposits.length !== 1 ? 's' : ''}` : ''}`
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {screen === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 flex flex-col items-center gap-4 text-center"
            >
              {result.tradeError && result.imported === 0 ? (
                // Full failure
                <>
                  <AlertCircle size={40} className="text-red-400" />
                  <div>
                    <p className="text-white font-semibold">Import failed</p>
                    <p className="text-zinc-400 text-sm mt-1">{result.tradeError}</p>
                  </div>
                  <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">
                    Try Again
                  </button>
                </>
              ) : (
                // Full or partial success
                <>
                  <CheckCircle size={40} className={result.tradeError || result.depositError ? 'text-yellow-400' : 'text-green-400'} />
                  <div className="space-y-1.5 w-full">
                    <p className="text-white font-semibold">
                      {result.tradeError || result.depositError ? 'Import Complete (with warnings)' : 'Import Complete'}
                    </p>
                    <p className="text-zinc-300 text-sm">{result.imported} trade{result.imported !== 1 ? 's' : ''} imported</p>
                    {importDeposits && (
                      <p className="text-green-400 text-sm">{result.depositsImported} deposit{result.depositsImported !== 1 ? 's' : ''} imported</p>
                    )}
                    {result.depositsDuplicate > 0 && (
                      <p className="text-zinc-500 text-sm">{result.depositsDuplicate} duplicate{result.depositsDuplicate !== 1 ? 's' : ''} skipped</p>
                    )}
                    {result.tradeError && (
                      <p className="text-red-400 text-xs mt-1">⚠ {result.tradeError}</p>
                    )}
                    {result.depositError && (
                      <p className="text-yellow-400 text-xs">{result.depositError}</p>
                    )}
                  </div>
                  {result.tagCounts.length > 0 && (
                    <div className="w-full">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Trades tagged as</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {result.tagCounts.map(({ tag, count }) => (
                          <span key={tag} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${TAG_CONFIG[tag].bg} ${TAG_CONFIG[tag].text}`}>
                            {count} {TAG_CONFIG[tag].label.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(result.tradeError || result.depositError) && (
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">
                      Close
                    </button>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
