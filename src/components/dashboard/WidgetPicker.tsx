import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WIDGET_REGISTRY } from './widgetRegistry'
import type { DashboardItem } from './widgetRegistry'
import {
  TrendingUp, Target, DollarSign, BarChart2, Tag, Heart,
  Flame, Calendar, Activity, Sparkles, Hash, Brain
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Target, DollarSign, BarChart2, Tag, Heart,
  Flame, Calendar, Activity, Sparkles, Hash, Brain,
}

interface Props {
  open: boolean
  layout: DashboardItem[]
  onAdd: (id: string) => void
  onClose: () => void
}

export default function WidgetPicker({ open, layout, onAdd, onClose }: Props) {
  const activeIds = new Set(layout.map((l) => l.i))

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 shrink-0">
              <span className="text-sm font-semibold text-white">Add Widgets</span>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {WIDGET_REGISTRY.map((def) => {
                const Icon = ICON_MAP[def.icon]
                const active = activeIds.has(def.id)
                return (
                  <button
                    key={def.id}
                    onClick={() => { if (!active) { onAdd(def.id); onClose() } }}
                    disabled={active}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${
                      active
                        ? 'border-zinc-800 bg-zinc-800/30 opacity-40 cursor-not-allowed'
                        : 'border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      {Icon && <Icon size={15} className="text-zinc-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{def.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{def.description}</p>
                    </div>
                    {active && <span className="text-[10px] text-zinc-600 shrink-0">Added</span>}
                  </button>
                )
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
