import { useReviews } from '../../../hooks/useReviews'
import type { WidgetProps } from '../widgetRegistry'

export default function AIInsightWidget(_props: WidgetProps) {
  const { reviews, loading } = useReviews()
  const latest = reviews[0]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-4 bg-zinc-800 rounded animate-pulse w-2/3" />
      </div>
    )
  }

  if (!latest?.ai_review) {
    return (
      <p className="text-zinc-500 text-sm text-center pt-4">
        No AI reviews yet — generate one from the Review page
      </p>
    )
  }

  const text = latest.ai_review
  const weekLabel = new Date(latest.week_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      <p className="text-[10px] text-zinc-600 shrink-0">Week of {weekLabel}</p>
      <p className="text-sm text-zinc-300 leading-relaxed line-clamp-[8]">{text}</p>
    </div>
  )
}
