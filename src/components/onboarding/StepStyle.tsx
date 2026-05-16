import { motion } from 'framer-motion'

interface Props {
  value: string | null
  onChange: (v: string) => void
  onNext: () => void
  onSkip: () => void
}

const STYLES = [
  { value: 'manual', icon: '🖐️', title: 'Manual', desc: 'I enter and manage every trade myself' },
  { value: 'both', icon: '⚡', title: 'Both', desc: 'I trade manually and use some automation' },
  { value: 'swing', icon: '📈', title: 'Swing / Long-term', desc: 'I hold positions for days or weeks' },
]

export default function StepStyle({ value, onChange, onNext, onSkip }: Props) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
        How do you trade?
      </h2>
      <p className="text-zinc-400 text-center mt-2 text-sm md:text-base">
        This helps us show you the most relevant insights.
      </p>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-3 mt-8 w-full max-w-lg">
        {STYLES.map(({ value: v, icon, title, desc }, i) => {
          const isSelected = value === v
          return (
            <motion.button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              className={`flex md:flex-col items-start md:items-center gap-4 md:gap-2 p-5 rounded-2xl border text-left md:text-center transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/60 ring-1 ring-blue-500/30'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <p className="text-base font-semibold text-white">{title}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!value}
        className={`mt-8 w-full max-w-sm h-12 rounded-xl text-sm font-semibold transition-colors ${
          value
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        Continue →
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-zinc-600 hover:text-zinc-400 underline mt-4 transition-colors"
      >
        Skip setup
      </button>
    </div>
  )
}
