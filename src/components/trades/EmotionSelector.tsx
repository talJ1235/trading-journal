const EMOTIONS = [
  { value: 1, emoji: '😰' },
  { value: 2, emoji: '😟' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😄' },
] as const

interface Props {
  label: string
  value: number | null
  onChange: (value: number) => void
}

export default function EmotionSelector({ label, value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">{label}</label>
      <div className="flex gap-2">
        {EMOTIONS.map(({ value: v, emoji }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`w-11 h-11 text-xl rounded-full transition-all flex items-center justify-center ${
              value === v
                ? 'ring-2 ring-blue-500 bg-blue-500/20'
                : 'hover:bg-zinc-700 bg-zinc-800'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
