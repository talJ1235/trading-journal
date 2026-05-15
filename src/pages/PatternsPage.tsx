import { useMemo } from 'react'
import PageTransition from '../components/PageTransition'
import EquityCurve from '../components/patterns/EquityCurve'
import WinRateByTag from '../components/patterns/WinRateByTag'
import WinRateByDay from '../components/patterns/WinRateByDay'
import EmotionVsResults from '../components/patterns/EmotionVsResults'
import MonthlyPerformance from '../components/patterns/MonthlyPerformance'
import SP500Comparison from '../components/patterns/SP500Comparison'
import Insights from '../components/patterns/Insights'
import { usePatterns } from '../hooks/usePatterns'
import { useTradesStore } from '../store/tradesStore'

function getMonday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function PatternsPage() {
  const patterns = usePatterns()
  const { trades } = useTradesStore()

  const { weekStart, weekEnd, weekTrades } = useMemo(() => {
    const monday = getMonday(new Date())
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    const weekStart = toDateStr(monday)
    const weekEnd = toDateStr(sunday)
    const weekTrades = trades.filter(
      (t) => t.entry_date >= weekStart && t.entry_date <= weekEnd
    )
    return { weekStart, weekEnd, weekTrades }
  }, [trades])

  return (
    <PageTransition>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24 md:pb-8">
        <EquityCurve data={patterns.equityCurve} />
        <WinRateByTag data={patterns.winRateByTag} />
        <WinRateByDay data={patterns.winRateByDay} />
        <EmotionVsResults data={patterns.avgPnlByEmotion} />
        <MonthlyPerformance data={patterns.monthlyPerformance} />
        <SP500Comparison
          weekStart={weekStart}
          weekEnd={weekEnd}
          weekTrades={weekTrades}
        />
        <Insights patterns={patterns} trades={trades} />
      </div>
    </PageTransition>
  )
}
