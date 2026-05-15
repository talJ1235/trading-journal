import type { TradeTag } from '../types'

export interface TagConfig {
  bg: string    // 'bg-blue-500/20'  — translucent badge background
  text: string  // 'text-blue-400'   — badge text
  solid: string // 'bg-blue-500'     — solid fill for progress bars
  hex: string   // '#3B82F6'         — hex for Recharts
  label: string // 'Planned'         — display label
}

export const TAG_CONFIG: Record<TradeTag, TagConfig> = {
  planned:        { bg: 'bg-blue-500/20',   text: 'text-blue-400',   solid: 'bg-blue-500',   hex: '#3B82F6', label: 'Planned' },
  surgical:       { bg: 'bg-green-500/20',  text: 'text-green-400',  solid: 'bg-green-500',  hex: '#22C55E', label: 'Surgical' },
  impulse:        { bg: 'bg-yellow-500/20', text: 'text-yellow-400', solid: 'bg-yellow-500', hex: '#EAB308', label: 'Impulse' },
  emotional_exit: { bg: 'bg-red-500/20',    text: 'text-red-400',    solid: 'bg-red-500',    hex: '#EF4444', label: 'Emotional Exit' },
  news_play:      { bg: 'bg-purple-500/20', text: 'text-purple-400', solid: 'bg-purple-500', hex: '#A855F7', label: 'News Play' },
}

export const TAG_ORDER: TradeTag[] = [
  'planned',
  'surgical',
  'impulse',
  'emotional_exit',
  'news_play',
]

export const EMOTION_EMOJI: Record<number, string> = {
  1: '😰',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😄',
}
