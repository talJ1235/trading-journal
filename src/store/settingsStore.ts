import { create } from 'zustand'

export type Currency = 'USD' | 'ILS' | 'EUR'

const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', ILS: '₪', EUR: '€' }

export interface UserSettings {
  currency: Currency
  week_start: 'monday' | 'sunday'
  show_micha_questions: boolean
  default_asset_type: 'stock' | 'etf'
  default_position_size: number | null
}

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  week_start: 'monday',
  show_micha_questions: true,
  default_asset_type: 'stock',
  default_position_size: null,
}

export function formatCurrency(amount: number, currency: Currency | string): string {
  const sym = CURRENCY_SYMBOLS[currency as Currency] ?? '$'
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount >= 0 ? `${sym}${abs}` : `-${sym}${abs}`
}

export function formatPnlCurrency(amount: number | null | undefined, currency: Currency | string): string {
  if (amount == null) return '—'
  const sym = CURRENCY_SYMBOLS[currency as Currency] ?? '$'
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount >= 0 ? `+${sym}${abs}` : `-${sym}${abs}`
}

interface SettingsState {
  settings: UserSettings
  setSettings: (s: UserSettings) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => set({ settings }),
}))
