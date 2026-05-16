import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface Props {
  firstName: string
  goal: string | null
  completing: boolean
  completeError: string | null
  onLog: () => void
  onImport: () => void
}

const GOAL_TIPS: Record<string, string> = {
  consistency: '💡 Tip: Log every trade with a signal. Trades with a plan have 40% better outcomes.',
  analysis: '💡 Tip: After 10 trades, your Patterns page will show your strongest setups.',
  risk: '💡 Tip: Always set a Stop Loss in each trade. You can track adherence in Patterns.',
  learning: '💡 Tip: Use the Weekly Review to get AI feedback on your trades every Sunday.',
}

export default function StepReady({ firstName, goal, completing, completeError, onLog, onImport }: Props) {
  const tip = goal ? GOAL_TIPS[goal] : null

  return (
    <div className="flex flex-col items-center text-center w-full">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center"
      >
        <CheckCircle size={40} className="text-green-400" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mt-6"
      >
        You're all set, {firstName}!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-zinc-400 mt-3 max-w-sm text-sm md:text-base"
      >
        Your journal is ready. Start by logging your first trade or importing from IBKR.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 mt-8 w-full max-w-sm"
      >
        <button
          type="button"
          onClick={onLog}
          disabled={completing}
          className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {completing ? 'Saving…' : 'Log My First Trade →'}
        </button>

        <button
          type="button"
          onClick={onImport}
          disabled={completing}
          className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm font-semibold transition-colors"
        >
          Import from IBKR
        </button>

        {completeError && (
          <p className="text-red-400 text-xs text-center">{completeError}</p>
        )}
      </motion.div>

      {tip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-6 max-w-sm text-left"
        >
          <p className="text-xs text-zinc-400">{tip}</p>
        </motion.div>
      )}
    </div>
  )
}
