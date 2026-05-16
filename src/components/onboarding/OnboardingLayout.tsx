import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

interface Props {
  currentStep: number
  totalSteps: number
  onBack: () => void
  children: React.ReactNode
}

export default function OnboardingLayout({ currentStep, totalSteps, onBack, children }: Props) {
  const progressPct = (currentStep / totalSteps) * 100
  const showNav = currentStep > 0

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 w-full shrink-0">
        <motion.div
          className="h-1 bg-blue-500 origin-left"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Top nav row */}
      {showNav && (
        <div className="flex items-center justify-between px-4 pt-4 md:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <span className="text-xs text-zinc-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-2xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}
