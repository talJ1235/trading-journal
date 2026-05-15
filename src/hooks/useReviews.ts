import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useTradesStore } from '../store/tradesStore'
import { generateWeeklyReview } from '../lib/gemini'
import type { WeeklyStats } from '../lib/gemini'
import type { WeeklyReview, Trade } from '../types'

export function calcWeekStats(
  trades: Trade[],
  weekStart: string,
  weekEnd: string
): WeeklyStats {
  const closed = trades.filter((t) => t.pnl != null)
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0)
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const avgWin = wins.length
    ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length
    : 0
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length)
    : 0

  const tagBreakdown: Record<string, number> = {}
  for (const t of trades) {
    const tag = t.tag ?? 'untagged'
    tagBreakdown[tag] = (tagBreakdown[tag] ?? 0) + 1
  }

  return {
    weekStart,
    weekEnd,
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    totalPnl,
    winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
    avgWin,
    avgLoss,
    tagBreakdown,
    followedPlanCount: trades.filter((t) => t.followed_plan === 'yes').length,
    impulseCount: tagBreakdown['impulse'] ?? 0,
  }
}

export function useReviews() {
  const { user } = useAuthStore()
  const { trades } = useTradesStore()
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
      if (dbError) throw dbError
      setReviews(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchReviews()
  }, [fetchReviews])

  const generateAndSaveReview = async (weekStart: string, weekEnd: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated')
    setGenerating(true)
    setError(null)
    try {
      const weekTrades = trades.filter(
        (t) => t.entry_date >= weekStart && t.entry_date <= weekEnd
      )
      const stats = calcWeekStats(weekTrades, weekStart, weekEnd)
      const aiReview = await generateWeeklyReview(weekTrades, stats)

      // Remove any existing review for this week before inserting
      await supabase
        .from('weekly_reviews')
        .delete()
        .eq('user_id', user.id)
        .eq('week_start', weekStart)

      const { data, error: insertError } = await supabase
        .from('weekly_reviews')
        .insert({
          user_id: user.id,
          week_start: weekStart,
          week_end: weekEnd,
          ai_review: aiReview,
        })
        .select()
        .single()
      if (insertError) throw insertError
      if (data) {
        setReviews((prev) => [data, ...prev.filter((r) => r.week_start !== weekStart)])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate review'
      setError(msg)
      throw err
    } finally {
      setGenerating(false)
    }
  }

  const deleteReview = async (id: string): Promise<void> => {
    const { error: dbError } = await supabase.from('weekly_reviews').delete().eq('id', id)
    if (dbError) throw dbError
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  return { reviews, loading, generating, error, fetchReviews, generateAndSaveReview, deleteReview }
}
