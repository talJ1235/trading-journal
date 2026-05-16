import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { handleError } from '../lib/errorHandler'
import type { Goal } from '../types'

type GoalUpdate = Partial<Pick<Goal, 'target_amount' | 'target_date' | 'current_amount'>>

export function useGoals() {
  const { user } = useAuthStore()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoal = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (dbError) throw dbError
      setGoal(data)
    } catch (err) {
      setError(handleError(err, 'Failed to load goal'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchGoal()
  }, [fetchGoal])

  const createGoal = async (target_amount: number, target_date: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated')
    const { data, error: dbError } = await supabase
      .from('goals')
      .insert({ user_id: user.id, target_amount, target_date, current_amount: 0 })
      .select()
      .single()
    if (dbError) throw dbError
    if (data) setGoal(data)
  }

  const updateGoal = async (id: string, updates: GoalUpdate): Promise<void> => {
    const { data, error: dbError } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (dbError) throw dbError
    if (data) setGoal(data)
  }

  const deleteGoal = async (id: string): Promise<void> => {
    const { error: dbError } = await supabase.from('goals').delete().eq('id', id)
    if (dbError) throw dbError
    setGoal(null)
  }

  return { goal, loading, error, fetchGoal, createGoal, updateGoal, deleteGoal }
}
