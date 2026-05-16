import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { useSettings } from '../hooks/useSettings'
import type { Currency } from '../store/settingsStore'
import OnboardingLayout from '../components/onboarding/OnboardingLayout'
import StepWelcome from '../components/onboarding/StepWelcome'
import StepGoal from '../components/onboarding/StepGoal'
import StepStyle from '../components/onboarding/StepStyle'
import StepSetup from '../components/onboarding/StepSetup'
import StepReady from '../components/onboarding/StepReady'

const TOTAL_STEPS = 4

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export default function OnboardingPage() {
  const { user } = useAuthStore()
  const { onboardingCompleted } = useSettingsStore()
  const { updateSettings } = useSettings()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [goal, setGoal] = useState<string | null>(null)
  const [style, setStyle] = useState<string | null>(null)
  const [currency, setCurrency] = useState<Currency>('USD')
  const [weekStart, setWeekStart] = useState<'sunday' | 'monday'>('monday')
  const [broker, setBroker] = useState<'ibkr' | 'other'>('ibkr')
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  // If already completed, redirect to app
  if (onboardingCompleted === true) {
    return <Navigate to="/trades" replace />
  }

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Trader'

  const goToStep = (next: number, dir: number) => {
    setDirection(dir)
    setStep(next)
  }

  const goNext = () => goToStep(step + 1, 1)
  const goBack = () => goToStep(step - 1, -1)
  const skipToReady = () => goToStep(TOTAL_STEPS, 1)

  const handleComplete = async () => {
    setCompleting(true)
    setCompleteError(null)
    try {
      await updateSettings({
        onboarding_completed: true,
        trading_goal: goal,
        trading_style: style,
        currency,
        week_start: weekStart,
      })
      navigate('/trades', { replace: true })
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : 'Failed to save settings')
      setCompleting(false)
    }
  }

  return (
    <OnboardingLayout currentStep={step} totalSteps={TOTAL_STEPS} onBack={goBack}>
      <div className="w-full overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {step === 0 && (
              <StepWelcome firstName={firstName} onStart={goNext} />
            )}
            {step === 1 && (
              <StepGoal value={goal} onChange={setGoal} onNext={goNext} onSkip={skipToReady} />
            )}
            {step === 2 && (
              <StepStyle value={style} onChange={setStyle} onNext={goNext} onSkip={skipToReady} />
            )}
            {step === 3 && (
              <StepSetup
                currency={currency}
                weekStart={weekStart}
                broker={broker}
                onCurrency={setCurrency}
                onWeekStart={setWeekStart}
                onBroker={setBroker}
                onNext={goNext}
                onSkip={skipToReady}
              />
            )}
            {step === 4 && (
              <StepReady
                firstName={firstName}
                goal={goal}
                completing={completing}
                completeError={completeError}
                onLog={handleComplete}
                onImport={handleComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  )
}
