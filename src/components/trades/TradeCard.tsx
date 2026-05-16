import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trash2, X } from 'lucide-react'
import type { Trade } from '../../types'
import { formatPct, emotionEmoji, formatDate } from '../../lib/utils'
import { useSettingsStore, formatPnlCurrency } from '../../store/settingsStore'
import { supabase } from '../../lib/supabase'
import TagBadge from './TagBadge'

interface Props {
  trade: Trade
  onDelete: (id: string) => Promise<void>
}

function FollowedPlanBadge({ value }: { value: Trade['followed_plan'] }) {
  if (!value) return null
  const styles = {
    yes: 'text-green-400',
    partial: 'text-yellow-400',
    no: 'text-red-400',
  }
  const labels = { yes: '✓ Followed plan', partial: '~ Partial', no: '✗ Broke plan' }
  return <span className={`text-xs font-medium ${styles[value]}`}>{labels[value]}</span>
}

function ConfidenceBadge({ value }: { value: number | null | undefined }) {
  if (!value) return null
  const cfg =
    value <= 2
      ? { icon: '🔴', label: 'Low confidence', color: 'text-red-400' }
      : value === 3
      ? { icon: '🟡', label: 'Neutral', color: 'text-yellow-400' }
      : { icon: '🟢', label: 'High confidence', color: 'text-green-400' }
  return (
    <span className={`text-xs font-medium ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

export default function TradeCard({ trade, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { settings } = useSettingsStore()

  useEffect(() => {
    if (!expanded || !trade.screenshot_url || screenshotUrl) return
    supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(trade.screenshot_url, 3600)
      .then(({ data }) => { if (data?.signedUrl) setScreenshotUrl(data.signedUrl) })
  }, [expanded, trade.screenshot_url, screenshotUrl])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, closeLightbox])

  const pnlPositive = trade.pnl != null && trade.pnl > 0
  const pnlColor = trade.pnl == null ? 'text-zinc-400' : pnlPositive ? 'text-green-500' : 'text-red-500'
  const isOpen = !trade.exit_date

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this trade?')) return
    setDeleting(true)
    try {
      await onDelete(trade.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div
      className="bg-zinc-900 rounded-xl border border-zinc-800 mb-2 overflow-hidden cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Collapsed row */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          {/* Left — symbol + tag */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-base">{trade.symbol}</span>
              {isOpen && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Open
                </span>
              )}
              <TagBadge tag={trade.tag} />
            </div>
            <span className="text-xs text-zinc-500">
              {formatDate(trade.entry_date)}
              {trade.exit_date ? ` → ${formatDate(trade.exit_date)}` : ''}
            </span>
          </div>

          {/* Right — P&L + expand icon */}
          <div className="flex items-start gap-2 ml-2 flex-shrink-0">
            <div className="text-right">
              <p className={`font-bold font-mono text-sm ${pnlColor}`}>
                {formatPnlCurrency(trade.pnl, settings.currency)}
              </p>
              <p className={`text-xs font-mono ${pnlColor}`}>
                {formatPct(trade.pnl, trade.entry_price, trade.quantity)}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-zinc-500 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Bottom row — emotions + followed plan */}
        <div className="flex items-center gap-3 mt-2">
          {(trade.emotion_before || trade.emotion_during || trade.emotion_after) && (
            <span className="text-sm">
              {emotionEmoji(trade.emotion_before)} → {emotionEmoji(trade.emotion_during)} → {emotionEmoji(trade.emotion_after)}
            </span>
          )}
          <FollowedPlanBadge value={trade.followed_plan} />
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-zinc-800 space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-xs">
                <div>
                  <span className="text-zinc-500 uppercase tracking-wide">Direction</span>
                  <p className="text-white capitalize">{trade.direction}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-wide">Qty</span>
                  <p className="text-white">{trade.quantity ?? '—'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-wide">Entry</span>
                  <p className="text-white font-mono">{trade.entry_price != null ? `$${trade.entry_price}` : '—'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-wide">Exit</span>
                  <p className="text-white font-mono">{trade.exit_price != null ? `$${trade.exit_price}` : '—'}</p>
                </div>
              </div>

              {trade.signal && (
                <div className="text-xs">
                  <span className="text-zinc-500 uppercase tracking-wide">Signal</span>
                  <p className="text-zinc-300 mt-0.5">{trade.signal}</p>
                </div>
              )}
              {trade.lesson && (
                <div className="text-xs">
                  <span className="text-zinc-500 uppercase tracking-wide">Lesson</span>
                  <p className="text-zinc-300 mt-0.5">{trade.lesson}</p>
                </div>
              )}
              {trade.notes && (
                <div className="text-xs">
                  <span className="text-zinc-500 uppercase tracking-wide">Notes</span>
                  <p className="text-zinc-300 mt-0.5">{trade.notes}</p>
                </div>
              )}

              {(trade.confidence != null || trade.risk_reward_ratio != null) && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {trade.risk_reward_ratio != null && (
                    <span className="text-zinc-400">
                      R:R{' '}
                      <span className="font-mono text-white">1:{trade.risk_reward_ratio.toFixed(2)}</span>
                    </span>
                  )}
                  <ConfidenceBadge value={trade.confidence} />
                </div>
              )}

              {trade.screenshot_url && screenshotUrl && (
                <div
                  className="rounded-xl overflow-hidden border border-zinc-700 cursor-pointer mt-1"
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(true) }}
                >
                  <img src={screenshotUrl} alt="Chart screenshot" className="w-full object-cover max-h-40" />
                </div>
              )}

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors mt-1"
              >
                <Trash2 size={13} />
                {deleting ? 'Deleting…' : 'Delete trade'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      {lightboxOpen && screenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X size={28} />
          </button>
          <img
            src={screenshotUrl}
            alt="Chart screenshot"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
