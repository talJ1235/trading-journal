import { GripVertical, X } from 'lucide-react'
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
  id: string
  name: string
  icon: string
  isEditing: boolean
  onRemove: (id: string) => void
  children: React.ReactNode
}

export default function WidgetWrapper({ id, name, icon, isEditing, onRemove, children }: Props) {
  const Icon = ICON_MAP[icon]

  return (
    <div
      className={`h-full flex flex-col bg-zinc-900 rounded-2xl border overflow-hidden transition-all ${
        isEditing
          ? 'border-blue-500/30 ring-1 ring-blue-500/20 cursor-grab active:cursor-grabbing'
          : 'border-zinc-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-zinc-500" />}
          <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          {isEditing && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(id) }}
                className="text-zinc-600 hover:text-red-400 transition-colors p-0.5 rounded"
                aria-label={`Remove ${name}`}
              >
                <X size={14} />
              </button>
              <div className="widget-drag-handle text-zinc-600 hover:text-zinc-400 transition-colors p-0.5 rounded cursor-grab">
                <GripVertical size={14} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 pb-3 pt-1 min-h-0">
        {children}
      </div>
    </div>
  )
}
