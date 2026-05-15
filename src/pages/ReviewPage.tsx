import { useState, useMemo } from 'react'
import PageTransition from '../components/PageTransition'
import WeekSelector from '../components/review/WeekSelector'
import ReviewCard from '../components/review/ReviewCard'
import WeekStats from '../components/review/WeekStats'
import { useReviews } from '../hooks/useReviews'
import { useTradesStore } from '../store/tradesStore'

function getMonday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function ReviewPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { trades } = useTradesStore()
  const { reviews, generating, error, generateAndSaveReview } = useReviews()

  const { weekStart, weekEnd, weekStartDate, weekEndDate } = useMemo(() => {
    const currentMonday = getMonday(new Date())
    const weekStartDate = addDays(currentMonday, weekOffset * 7)
    const weekEndDate = addDays(weekStartDate, 6)
    return {
      weekStartDate,
      weekEndDate,
      weekStart: toDateStr(weekStartDate),
      weekEnd: toDateStr(weekEndDate),
    }
  }, [weekOffset])

  const weekTrades = useMemo(
    () => trades.filter((t) => t.entry_date >= weekStart && t.entry_date <= weekEnd),
    [trades, weekStart, weekEnd]
  )

  const currentReview = useMemo(
    () => reviews.find((r) => r.week_start === weekStart) ?? null,
    [reviews, weekStart]
  )

  const handleGenerate = async () => {
    try {
      await generateAndSaveReview(weekStart, weekEnd)
    } catch {
      // error shown via useReviews error state
    }
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <WeekSelector
          weekStart={weekStartDate}
          weekEnd={weekEndDate}
          tradeCount={weekTrades.length}
          onPrev={() => setWeekOffset((o) => o - 1)}
          onNext={() => setWeekOffset((o) => Math.min(o + 1, 0))}
          isCurrentWeek={weekOffset === 0}
        />

        <ReviewCard
          review={currentReview}
          generating={generating}
          error={error}
          tradeCount={weekTrades.length}
          onGenerate={() => void handleGenerate()}
        />

        <WeekStats trades={weekTrades} />
      </div>
    </PageTransition>
  )
}
