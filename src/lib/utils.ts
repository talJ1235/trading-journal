import type { TradeTag } from '../types'

interface TagInput {
  signal?: string | null
  planned_target?: number | null
  planned_stop?: number | null
  followed_plan?: 'yes' | 'partial' | 'no' | null
  pnl?: number | null
  emotion_after?: number | null
}

/** Priority: surgical → planned → news_play → emotional_exit → impulse */
export function getAutoTag(trade: TagInput): TradeTag {
  const { signal, planned_target, planned_stop, followed_plan, pnl, emotion_after } = trade

  if (signal && followed_plan === 'yes' && pnl != null && pnl > 0) return 'surgical'
  if (signal && planned_target != null && planned_stop != null) return 'planned'
  if (signal && /news|earnings/i.test(signal)) return 'news_play'
  if (followed_plan === 'no' && emotion_after != null && emotion_after <= 2) return 'emotional_exit'
  return 'impulse'
}

export function calcPnl(
  direction: 'long' | 'short',
  entryPrice: string,
  exitPrice: string,
  quantity: string
): number | null {
  const entry = parseFloat(entryPrice)
  const exit = parseFloat(exitPrice)
  const qty = parseFloat(quantity)
  if (isNaN(entry) || isNaN(exit) || isNaN(qty) || qty <= 0) return null
  return direction === 'long' ? (exit - entry) * qty : (entry - exit) * qty
}

export function formatPnl(pnl: number | null | undefined): string {
  if (pnl == null) return '—'
  const abs = Math.abs(pnl).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return pnl >= 0 ? `+$${abs}` : `-$${abs}`
}

export function formatPct(
  pnl: number | null | undefined,
  entryPrice: number | null | undefined,
  quantity: number | null | undefined
): string {
  if (pnl == null || !entryPrice || !quantity || entryPrice <= 0 || quantity <= 0) return ''
  const cost = entryPrice * quantity
  const pct = (pnl / cost) * 100
  return pct >= 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`
}

export function emotionEmoji(value: number | null | undefined): string {
  if (value == null) return '—'
  const map: Record<number, string> = { 1: '😰', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' }
  return map[value] ?? '—'
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
