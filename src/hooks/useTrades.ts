import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useTradesStore } from '../store/tradesStore'
import { getAutoTag } from '../lib/utils'
import { sanitize, sanitizeMaybe } from '../lib/sanitize'
import { handleError } from '../lib/errorHandler'
import type { Trade } from '../types'

export type TradeInput = Omit<Trade, 'id' | 'created_at' | 'user_id' | 'tag'>

export function useTrades() {
  const { user } = useAuthStore()
  const { setTrades, setLoading, setError, addTrade: storeAdd, updateTrade: storeUpdate, removeTrade: storeRemove } =
    useTradesStore()

  const fetchTrades = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setTrades(data ?? [])
    } catch (err) {
      setError(handleError(err, 'Failed to load trades'))
    } finally {
      setLoading(false)
    }
  }, [user, setTrades, setLoading, setError])

  useEffect(() => {
    void fetchTrades()
  }, [fetchTrades])

  const sanitizeInput = (input: Partial<TradeInput>): Partial<TradeInput> => ({
    ...input,
    symbol: input.symbol != null ? sanitize(input.symbol, 10) : input.symbol,
    notes: sanitizeMaybe(input.notes, 500) as string | null | undefined,
    lesson: sanitizeMaybe(input.lesson, 500) as string | null | undefined,
    signal: sanitizeMaybe(input.signal, 200) as string | null | undefined,
  })

  const addTrade = async (input: TradeInput): Promise<Trade> => {
    if (!user) throw new Error('Not authenticated')
    const clean = sanitizeInput(input) as TradeInput
    const tag = getAutoTag(clean)
    const { data, error } = await supabase
      .from('trades')
      .insert({ ...clean, user_id: user.id, tag })
      .select()
      .single()
    if (error) throw error
    if (!data) throw new Error('Insert returned no data')
    storeAdd(data)
    return data
  }

  const updateTrade = async (id: string, updates: Partial<TradeInput>): Promise<Trade> => {
    const clean = sanitizeInput(updates)
    const tag = getAutoTag(clean)
    const { data, error } = await supabase
      .from('trades')
      .update({ ...clean, tag })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    if (!data) throw new Error('Update returned no data')
    storeUpdate(id, data)
    return data
  }

  const deleteTrade = async (id: string): Promise<void> => {
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) throw error
    storeRemove(id)
  }

  return { fetchTrades, addTrade, updateTrade, deleteTrade }
}
