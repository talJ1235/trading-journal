import { motion } from 'framer-motion'
import { RefreshCw, Sparkles } from 'lucide-react'
import type { WeeklyReview } from '../../types'

interface Props {
  review: WeeklyReview | null
  generating: boolean
  error: string | null
  tradeCount: number
  onGenerate: () => void
}

interface Section {
  title: string
  content: string
}

function parseReview(text: string): Section[] {
  // Split on lines like "1. OVERVIEW", "2. WHAT WORKED", etc.
  const parts = text.split(/\n(?=\d+\.\s+[A-Z])/g)
  const sections: Section[] = []

  for (const part of parts) {
    const newline = part.indexOf('\n')
    if (newline === -1) {
      const match = part.match(/^\d+\.\s+(.+)/)
      if (match) sections.push({ title: match[1].replace(/\*/g, '').trim(), content: '' })
      continue
    }
    const headerLine = part.slice(0, newline).trim()
    const content = part.slice(newline + 1).trim()
    const match = headerLine.match(/^\d+\.\s+(.+)/)
    const title = match ? match[1].replace(/\*/g, '').trim() : headerLine
    sections.push({ title, content })
  }

  return sections.length > 0 ? sections : [{ title: '', content: text.trim() }]
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function ReviewCard({ review, generating, error, tradeCount, onGenerate }: Props) {
  if (generating) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">Analyzing your trades…</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-5/6" />
          <div className="h-3 bg-zinc-800 rounded w-2/3 mt-4" />
          <div className="h-3 bg-zinc-800 rounded w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-4">
        <p className="text-red-400 text-sm mb-3">Could not generate review. {error}</p>
        <button
          onClick={onGenerate}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4 flex flex-col items-center text-center gap-3">
        <Sparkles size={28} className="text-zinc-600" />
        <div>
          <p className="text-zinc-300 font-medium text-sm">No review yet for this week</p>
          {tradeCount === 0 && (
            <p className="text-zinc-500 text-xs mt-1">Add trades first to generate a review</p>
          )}
        </div>
        <button
          onClick={onGenerate}
          disabled={tradeCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          <Sparkles size={14} /> Generate AI Review
        </button>
      </div>
    )
  }

  const sections = parseReview(review.ai_review ?? '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-xs text-zinc-500">Generated on {formatTimestamp(review.generated_at)}</span>
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-medium transition-colors"
        >
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i}>
            {s.title && (
              <p className="text-xs text-blue-400 uppercase tracking-wide mb-1.5 font-semibold">
                {s.title}
              </p>
            )}
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {s.content}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
