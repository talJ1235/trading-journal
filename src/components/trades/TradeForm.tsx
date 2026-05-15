import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { z } from 'zod'
import { calcPnl } from '../../lib/utils'
import type { TradeInput } from '../../hooks/useTrades'
import type { TradeTag } from '../../types'
import { initialFormValues, validateStep1 } from './formTypes'
import type { FormValues } from './formTypes'
import TagBadge from './TagBadge'
import StepDetails from './StepDetails'
import StepExit from './StepExit'
import StepReflection from './StepReflection'

const symbolSchema = z.string().min(1).max(10)

interface Props {
  onAdd: (input: TradeInput) => Promise<{ tag?: TradeTag | null }>
  onSuccess: () => void
}

const STEP_TITLES = ['Trade Details', 'Exit & Result', 'Reflection']

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
}

function buildTradeInput(values: FormValues): TradeInput {
  const ep = parseFloat(values.entry_price)
  const qty = parseFloat(values.quantity)
  const pt = parseFloat(values.planned_target)
  const ps = parseFloat(values.planned_stop)
  const xp = parseFloat(values.exit_price)
  const pnl = values.still_open
    ? null
    : calcPnl(values.direction, values.entry_price, values.exit_price, values.quantity)

  return {
    symbol: values.symbol.trim().toUpperCase(),
    type: values.type,
    direction: values.direction,
    entry_date: values.entry_date,
    exit_date: values.still_open ? null : values.exit_date || null,
    entry_price: isNaN(ep) ? null : ep,
    exit_price: values.still_open || isNaN(xp) ? null : xp,
    quantity: isNaN(qty) ? null : Math.round(qty),
    signal: values.signal.trim() || null,
    planned_target: isNaN(pt) ? null : pt,
    planned_stop: isNaN(ps) ? null : ps,
    emotion_before: values.emotion_before,
    emotion_during: values.emotion_during,
    emotion_after: values.emotion_after,
    followed_plan: values.followed_plan,
    lesson: values.lesson.trim() || null,
    notes: values.notes.trim() || null,
    pnl,
  }
}

export default function TradeForm({ onAdd, onSuccess }: Props) {
  const [[step, direction], setStepDir] = useState<[number, number]>([1, 0])
  const [values, setValues] = useState<FormValues>(initialFormValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savedTag, setSavedTag] = useState<TradeTag | null>(null)

  const handleChange = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const goNext = () => {
    if (step === 1) {
      const errs = validateStep1(values)
      const symErr = symbolSchema.safeParse(values.symbol.trim()).success ? '' : 'Invalid symbol'
      if (symErr) errs.symbol = symErr
      if (Object.values(errs).some(Boolean)) { setErrors(errs); return }
    }
    setErrors({})
    setStepDir([step + 1, 1])
  }

  const goBack = () => setStepDir([step - 1, -1])

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const input = buildTradeInput(values)
      const trade = await onAdd(input)
      setSavedTag(trade.tag ?? null)
      setTimeout(() => {
        setSavedTag(null)
        setValues(initialFormValues)
        setStepDir([1, 0])
        onSuccess()
      }, 2200)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save trade')
    } finally {
      setSubmitting(false)
    }
  }

  if (savedTag !== null || (submitting && step === 3)) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check size={32} className="text-green-400" />
        </div>
        <p className="text-white font-semibold text-lg">Trade saved!</p>
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <span>Tagged as:</span>
          <TagBadge tag={savedTag} size="md" />
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Step {step} of 3</span>
          <span>{STEP_TITLES[step - 1]}</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full">
          <motion.div
            className="h-1 bg-blue-500 rounded-full"
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Animated step content */}
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {step === 1 && <StepDetails values={values} errors={errors} onChange={handleChange} />}
            {step === 2 && <StepExit values={values} onChange={handleChange} />}
            {step === 3 && <StepReflection values={values} onChange={handleChange} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {submitError && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {submitting ? 'Saving…' : 'Save Trade'}
          </button>
        )}
      </div>
    </div>
  )
}
