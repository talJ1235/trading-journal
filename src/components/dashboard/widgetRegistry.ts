import type { ComponentType } from 'react'

export interface WidgetProps {
  w: number
  h: number
}

export interface DashboardItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

export interface WidgetDefinition {
  id: string
  name: string
  description: string
  icon: string
  defaultW: number
  defaultH: number
  minW: number
  minH: number
  component: ComponentType<WidgetProps>
}

// Lazy imports to keep dashboard chunk self-contained
import EquityCurveWidget from './widgets/EquityCurveWidget'
import WinRateWidget from './widgets/WinRateWidget'
import NetPnlWidget from './widgets/NetPnlWidget'
import MonthlyPnlWidget from './widgets/MonthlyPnlWidget'
import TagBreakdownWidget from './widgets/TagBreakdownWidget'
import EmotionWidget from './widgets/EmotionWidget'
import WinstreakWidget from './widgets/WinstreakWidget'
import PnlCalendarWidget from './widgets/PnlCalendarWidget'
import OpenPositionsWidget from './widgets/OpenPositionsWidget'
import AIInsightWidget from './widgets/AIInsightWidget'
import TradeCountWidget from './widgets/TradeCountWidget'
import ConfidenceWidget from './widgets/ConfidenceWidget'

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  { id: 'equity-curve',    name: 'Equity Curve',          description: 'Cumulative P&L over time',            icon: 'TrendingUp',  defaultW: 8, defaultH: 4, minW: 4, minH: 3, component: EquityCurveWidget },
  { id: 'win-rate',        name: 'Win Rate',               description: 'Your trade success percentage',        icon: 'Target',      defaultW: 4, defaultH: 2, minW: 3, minH: 2, component: WinRateWidget },
  { id: 'net-pnl',         name: 'Net P&L',                description: 'Total realized profit and loss',       icon: 'DollarSign',  defaultW: 4, defaultH: 2, minW: 3, minH: 2, component: NetPnlWidget },
  { id: 'monthly-pnl',     name: 'Monthly P&L',            description: 'Bar chart of monthly performance',     icon: 'BarChart2',   defaultW: 6, defaultH: 4, minW: 4, minH: 3, component: MonthlyPnlWidget },
  { id: 'tag-breakdown',   name: 'Tag Breakdown',          description: 'Win rate by trade tag',                icon: 'Tag',         defaultW: 4, defaultH: 4, minW: 3, minH: 3, component: TagBreakdownWidget },
  { id: 'emotion',         name: 'Emotion vs Results',     description: 'How your mood affects performance',    icon: 'Heart',       defaultW: 6, defaultH: 4, minW: 4, minH: 3, component: EmotionWidget },
  { id: 'winstreak',       name: 'Win Streak',             description: 'Current and best winning streak',      icon: 'Flame',       defaultW: 4, defaultH: 2, minW: 3, minH: 2, component: WinstreakWidget },
  { id: 'pnl-calendar',    name: 'P&L Calendar',           description: 'Daily performance calendar',           icon: 'Calendar',    defaultW: 6, defaultH: 5, minW: 5, minH: 4, component: PnlCalendarWidget },
  { id: 'open-positions',  name: 'Open Positions',         description: 'Live prices for open trades',          icon: 'Activity',    defaultW: 6, defaultH: 4, minW: 4, minH: 3, component: OpenPositionsWidget },
  { id: 'ai-insight',      name: 'AI Weekly Insight',      description: 'Latest AI review summary',             icon: 'Sparkles',    defaultW: 6, defaultH: 3, minW: 4, minH: 2, component: AIInsightWidget },
  { id: 'trade-count',     name: 'Trade Count',            description: 'Total trades with breakdown',          icon: 'Hash',        defaultW: 4, defaultH: 2, minW: 3, minH: 2, component: TradeCountWidget },
  { id: 'confidence',      name: 'Confidence vs Results',  description: 'How confidence affects outcomes',      icon: 'Brain',       defaultW: 6, defaultH: 4, minW: 4, minH: 3, component: ConfidenceWidget },
]

export type GoalLayoutKey = 'consistency' | 'performance' | 'risk' | 'default'

export const DEFAULT_LAYOUTS: Record<GoalLayoutKey, DashboardItem[]> = {
  consistency: [
    { i: 'equity-curve',   x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'win-rate',       x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'winstreak',      x: 8, y: 2, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'tag-breakdown',  x: 0, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'emotion',        x: 4, y: 4, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'ai-insight',     x: 0, y: 8, w: 12, h: 3, minW: 4, minH: 2 },
  ],
  performance: [
    { i: 'equity-curve',   x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'net-pnl',        x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'win-rate',       x: 8, y: 2, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'monthly-pnl',    x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'tag-breakdown',  x: 6, y: 4, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'pnl-calendar',   x: 0, y: 8, w: 7, h: 5, minW: 5, minH: 4 },
    { i: 'confidence',     x: 7, y: 8, w: 5, h: 5, minW: 4, minH: 3 },
  ],
  risk: [
    { i: 'net-pnl',        x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'win-rate',       x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'winstreak',      x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'equity-curve',   x: 0, y: 2, w: 12, h: 4, minW: 4, minH: 3 },
    { i: 'tag-breakdown',  x: 0, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'open-positions', x: 6, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
  ],
  default: [
    { i: 'equity-curve',   x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'win-rate',       x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'net-pnl',        x: 8, y: 2, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'monthly-pnl',    x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'open-positions', x: 6, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'ai-insight',     x: 0, y: 8, w: 12, h: 3, minW: 4, minH: 2 },
  ],
}

export const WIDGET_PRIORITY = [
  'net-pnl', 'win-rate', 'winstreak', 'open-positions',
  'equity-curve', 'ai-insight', 'monthly-pnl', 'tag-breakdown',
  'emotion', 'pnl-calendar', 'confidence', 'trade-count',
]

export function goalToLayoutKey(goal: string | null): GoalLayoutKey {
  if (goal === 'consistency') return 'consistency'
  if (goal === 'analysis') return 'performance'
  if (goal === 'risk') return 'risk'
  return 'default'
}
