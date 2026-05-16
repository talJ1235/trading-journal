import { motion } from 'framer-motion'

interface Props {
  firstName: string
  onStart: () => void
}

export default function StepWelcome({ firstName, onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center w-full"
    >
      <h1 className="text-3xl md:text-5xl font-bold text-white">
        Welcome, {firstName} 👋
      </h1>
      <p className="text-zinc-400 mt-4 text-base md:text-lg max-w-md">
        Let's set up your trading journal in under 60 seconds.
      </p>
      <p className="text-zinc-500 mt-2 text-sm max-w-sm">
        We'll personalize your dashboard based on how you trade.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 w-full max-w-sm h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold transition-colors"
      >
        Get Started →
      </button>

      <p className="text-xs text-zinc-600 mt-3">
        Your data is private and never shared.
      </p>
    </motion.div>
  )
}
