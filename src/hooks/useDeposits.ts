import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Deposit } from '../types'

export function useDeposits() {
  const { user } = useAuthStore()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDeposits = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (dbError) throw dbError
      setDeposits(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchDeposits()
  }, [fetchDeposits])

  const addDeposit = async (amount: number, date: string, notes: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated')
    const { data, error: dbError } = await supabase
      .from('deposits')
      .insert({ user_id: user.id, amount, date, notes: notes.trim() || null })
      .select()
      .single()
    if (dbError) throw dbError
    if (data) {
      setDeposits((prev) =>
        [data, ...prev].sort(
          (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
        )
      )
    }
  }

  const deleteDeposit = async (id: string): Promise<void> => {
    const { error: dbError } = await supabase.from('deposits').delete().eq('id', id)
    if (dbError) throw dbError
    setDeposits((prev) => prev.filter((d) => d.id !== id))
  }

  return { deposits, loading, error, addDeposit, deleteDeposit }
}
