import { create } from 'zustand'
import type { Trade } from '../types'

interface TradesState {
  trades: Trade[]
  loading: boolean
  error: string | null
  setTrades: (trades: Trade[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addTrade: (trade: Trade) => void
  updateTrade: (id: string, updates: Partial<Trade>) => void
  removeTrade: (id: string) => void
}

export const useTradesStore = create<TradesState>((set) => ({
  trades: [],
  loading: false,
  error: null,
  setTrades: (trades) => set({ trades }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  updateTrade: (id, updates) =>
    set((state) => ({
      trades: state.trades.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTrade: (id) =>
    set((state) => ({ trades: state.trades.filter((t) => t.id !== id) })),
}))
