export interface FormValues {
  // Step 1 — Trade Details
  symbol: string
  type: 'stock' | 'etf'
  direction: 'long' | 'short'
  entry_date: string
  entry_price: string
  quantity: string
  signal: string
  planned_target: string
  planned_stop: string
  // Step 2 — Exit & Result
  still_open: boolean
  exit_date: string
  exit_price: string
  // Step 3 — Reflection
  emotion_before: number | null
  emotion_during: number | null
  emotion_after: number | null
  followed_plan: 'yes' | 'partial' | 'no' | null
  lesson: string
  notes: string
  confidence: number | null
  screenshot_url: string | null
}

export const initialFormValues: FormValues = {
  symbol: '',
  type: 'stock',
  direction: 'long',
  entry_date: new Date().toISOString().split('T')[0],
  entry_price: '',
  quantity: '',
  signal: '',
  planned_target: '',
  planned_stop: '',
  still_open: false,
  exit_date: '',
  exit_price: '',
  emotion_before: null,
  emotion_during: null,
  emotion_after: null,
  followed_plan: null,
  lesson: '',
  notes: '',
  confidence: null,
  screenshot_url: null,
}

export function validateStep1(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!values.symbol.trim()) errors.symbol = 'Symbol is required'
  if (!values.entry_date) errors.entry_date = 'Entry date is required'
  return errors
}
