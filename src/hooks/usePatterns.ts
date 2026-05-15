import { useMemo } from 'react'
import { useTradesStore } from '../store/tradesStore'
import { EMOTION_EMOJI } from '../lib/constants'
import type { Trade, TradeTag } from '../types'

export interface EquityCurvePoint { date: string; cumPnl: number }
export interface WinRateByTagItem { tag: TradeTag; wins: number; total: number; winRate: number }
export interface WinRateByDayItem { day: string; wins: number; total: number; winRate: number }
export interface EmotionAvgItem { emotion: number; label: string; avgPnl: number; count: number }
export interface SymbolStat { symbol: string; totalPnl: number; trades: number }
export interface MonthlyPerfItem { month: string; sortKey: string; pnl: number; trades: number; winRate: number }

export interface PatternStats {
  equityCurve: EquityCurvePoint[]
  winRateByTag: WinRateByTagItem[]
  winRateByDay: WinRateByDayItem[]
  avgPnlByEmotion: EmotionAvgItem[]
  bestSymbol: SymbolStat | null
  worstSymbol: SymbolStat | null
  monthlyPerformance: MonthlyPerfItem[]
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_IDX_TO_NAME = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function computePatterns(trades: Trade[]): PatternStats {
  // ── Equity curve (aggregated by date) ──
  const dateMap = new Map<string, number>()
  for (const t of trades) {
    if (t.pnl == null) continue
    dateMap.set(t.entry_date, (dateMap.get(t.entry_date) ?? 0) + t.pnl)
  }
  let cum = 0
  const equityCurve: EquityCurvePoint[] = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => { cum += pnl; return { date, cumPnl: parseFloat(cum.toFixed(2)) } })

  // ── Win rate by tag ──
  const tagMap = new Map<string, { wins: number; total: number }>()
  for (const t of trades) {
    if (!t.tag) continue
    const e = tagMap.get(t.tag) ?? { wins: 0, total: 0 }
    e.total++
    if (t.pnl != null && t.pnl > 0) e.wins++
    tagMap.set(t.tag, e)
  }
  const winRateByTag: WinRateByTagItem[] = Array.from(tagMap.entries())
    .map(([tag, { wins, total }]) => ({ tag: tag as TradeTag, wins, total, winRate: total ? (wins / total) * 100 : 0 }))
    .sort((a, b) => b.winRate - a.winRate)

  // ── Win rate by weekday ──
  const dayMap = new Map<string, { wins: number; total: number }>()
  for (const d of WEEKDAYS) dayMap.set(d, { wins: 0, total: 0 })
  for (const t of trades) {
    const day = DAY_IDX_TO_NAME[new Date(t.entry_date + 'T12:00:00').getDay()]
    if (!WEEKDAYS.includes(day)) continue
    const e = dayMap.get(day)!
    e.total++
    if (t.pnl != null && t.pnl > 0) e.wins++
  }
  const winRateByDay: WinRateByDayItem[] = WEEKDAYS.map((day) => {
    const { wins, total } = dayMap.get(day)!
    return { day, wins, total, winRate: total ? (wins / total) * 100 : 0 }
  })

  // ── Avg P&L by emotion_before (min 2 trades) ──
  const emotionMap = new Map<number, { sum: number; count: number }>()
  for (const t of trades) {
    if (t.emotion_before == null || t.pnl == null) continue
    const e = emotionMap.get(t.emotion_before) ?? { sum: 0, count: 0 }
    e.sum += t.pnl; e.count++
    emotionMap.set(t.emotion_before, e)
  }
  const avgPnlByEmotion: EmotionAvgItem[] = Array.from(emotionMap.entries())
    .filter(([, { count }]) => count >= 2)
    .sort(([a], [b]) => a - b)
    .map(([emotion, { sum, count }]) => ({
      emotion, label: EMOTION_EMOJI[emotion] ?? '?', avgPnl: sum / count, count,
    }))

  // ── Best / worst symbol (by total P&L, closed trades only) ──
  const symMap = new Map<string, { totalPnl: number; trades: number }>()
  for (const t of trades) {
    if (t.pnl == null) continue
    const e = symMap.get(t.symbol) ?? { totalPnl: 0, trades: 0 }
    e.totalPnl += t.pnl; e.trades++
    symMap.set(t.symbol, e)
  }
  const symArr = Array.from(symMap.entries())
    .map(([symbol, s]) => ({ symbol, ...s }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
  const bestSymbol = symArr[0] ?? null
  const worstSymbol = symArr.length > 1 ? symArr[symArr.length - 1] : null

  // ── Monthly performance ──
  const monthMap = new Map<string, { pnl: number; wins: number; total: number }>()
  for (const t of trades) {
    const key = t.entry_date.slice(0, 7) // "YYYY-MM"
    const e = monthMap.get(key) ?? { pnl: 0, wins: 0, total: 0 }
    e.pnl += t.pnl ?? 0; e.total++
    if (t.pnl != null && t.pnl > 0) e.wins++
    monthMap.set(key, e)
  }
  const monthlyPerformance: MonthlyPerfItem[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { pnl, wins, total }]) => {
      const d = new Date(key + '-02T00:00:00')
      const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      return { month, sortKey: key, pnl: parseFloat(pnl.toFixed(2)), trades: total, winRate: total ? (wins / total) * 100 : 0 }
    })

  return { equityCurve, winRateByTag, winRateByDay, avgPnlByEmotion, bestSymbol, worstSymbol, monthlyPerformance }
}

export function usePatterns(): PatternStats {
  const { trades } = useTradesStore()
  return useMemo(() => computePatterns(trades), [trades])
}
