import { motion } from 'framer-motion'
import EmotionSelector from './EmotionSelector'
import ScreenshotUpload from './ScreenshotUpload'
import type { FormValues } from './formTypes'

interface Props {
  values: FormValues
  onChange: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
}

const PLAN_OPTIONS: { label: string; value: 'yes' | 'partial' | 'no'; color: string }[] = [
  { label: 'Yes', value: 'yes', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Partial', value: 'partial', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'No', value: 'no', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
]

const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very', sub: 'Low' },
  { value: 2, label: 'Low', sub: '' },
  { value: 3, label: 'OK', sub: '' },
  { value: 4, label: 'High', sub: '' },
  { value: 5, label: 'Very', sub: 'High' },
] as const

function confidenceColor(v: number): string {
  if (v <= 2) return 'bg-red-500/20 border-red-500/50 text-red-400'
  if (v === 3) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
  return 'bg-green-500/20 border-green-500/50 text-green-400'
}

export default function StepReflection({ values, onChange }: Props) {
  const textareaCls =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors resize-none'

  return (
    <div className="space-y-5">
      <EmotionSelector
        label="Emotion Before"
        value={values.emotion_before}
        onChange={(v) => onChange('emotion_before', v)}
      />
      <EmotionSelector
        label="Emotion During"
        value={values.emotion_during}
        onChange={(v) => onChange('emotion_during', v)}
      />
      <EmotionSelector
        label="Emotion After"
        value={values.emotion_after}
        onChange={(v) => onChange('emotion_after', v)}
      />

      {/* Confidence selector */}
      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5 block">
          Confidence Level
        </label>
        <p className="text-xs text-zinc-600 mb-2">How confident were you in this trade?</p>
        <div className="flex gap-2">
          {CONFIDENCE_LEVELS.map(({ value: v, label, sub }) => {
            const isSelected = values.confidence === v
            return (
              <motion.button
                key={v}
                type="button"
                onClick={() => onChange('confidence', isSelected ? null : v)}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: isSelected ? 1.08 : 1 }}
                transition={{ duration: 0.15 }}
                className={`flex-1 h-12 rounded-xl font-bold text-base border transition-colors flex flex-col items-center justify-center leading-none ${
                  isSelected
                    ? confidenceColor(v)
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <span className="text-sm font-bold">{v}</span>
                <span className="text-[9px] leading-tight opacity-70">{sub ? `${label}\n${sub}` : label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">
          Followed Plan?
        </label>
        <div className="flex gap-2">
          {PLAN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('followed_plan', opt.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                values.followed_plan === opt.value
                  ? `${opt.color} border-current`
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
          Lesson Learned (optional)
        </label>
        <textarea
          rows={3}
          value={values.lesson}
          onChange={(e) => onChange('lesson', e.target.value)}
          className={textareaCls}
          placeholder="What did this trade teach you?"
        />
      </div>

      <ScreenshotUpload
        value={values.screenshot_url}
        onChange={(path) => onChange('screenshot_url', path)}
      />

      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
          Notes (optional)
        </label>
        <textarea
          rows={2}
          value={values.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          className={textareaCls}
          placeholder="Any additional notes…"
        />
      </div>
    </div>
  )
}
