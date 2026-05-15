import { createClient } from '@supabase/supabase-js'
import type { Trade, Goal, Deposit, WeeklyReview } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in values.'
  )
}

// Full Database type satisfying Supabase v2 GenericSchema constraint
export interface Database {
  public: {
    Tables: {
      trades: {
        Row: Trade
        Insert: Omit<Trade, 'id' | 'created_at'>
        Update: Partial<Omit<Trade, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'created_at'>
        Update: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      deposits: {
        Row: Deposit
        Insert: Omit<Deposit, 'id' | 'created_at'>
        Update: Partial<Omit<Deposit, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      weekly_reviews: {
        Row: WeeklyReview
        Insert: Omit<WeeklyReview, 'id' | 'generated_at'>
        Update: Partial<Omit<WeeklyReview, 'id' | 'user_id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// The Database generic is kept for documentation; the raw client avoids
// supabase-js v2 conditional-type issues with custom Database shapes.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
