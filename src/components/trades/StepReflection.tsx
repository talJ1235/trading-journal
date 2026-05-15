import EmotionSelector from './EmotionSelector'
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
