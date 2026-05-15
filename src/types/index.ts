export interface Trade {
  id: string
  user_id: string
  symbol: string
  type: 'stock' | 'etf'
  direction: 'long' | 'short'
  entry_date: string
  exit_date?: string | null
  entry_price?: number | null
  exit_price?: number | null
  quantity?: number | null
  signal?: string | null
  planned_target?: number | null
  planned_stop?: number | null
  emotion_before?: number | null
  emotion_during?: number | null
  emotion_after?: number | null
  followed_plan?: 'yes' | 'partial' | 'no' | null
  lesson?: string | null
  tag?: 'planned' | 'impulse' | 'emotional_exit' | 'surgical' | 'news_play' | null
  pnl?: number | null
  notes?: string | null
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  target_amount: number
  target_date: string
  current_amount: number
  created_at: string
}

export interface Deposit {
  id: string
  user_id: string
  amount: number
  date: string
  notes?: string | null
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  week_end: string
  ai_review?: string | null
  market_context?: string | null
  generated_at: string
}

export type TradeTag = NonNullable<Trade['tag']>
export type TradeDirection = Trade['direction']
export type TradeType = Trade['type']
export type FollowedPlan = NonNullable<Trade['followed_plan']>
