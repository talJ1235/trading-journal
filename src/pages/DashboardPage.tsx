import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Pencil, Check, RotateCcw, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import DashboardGrid from '../components/dashboard/DashboardGrid'
import WidgetPicker from '../components/dashboard/WidgetPicker'
import type { DashboardItem } from '../components/dashboard/widgetRegistry'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { layout, updateLayout, addWidget, removeWidget, resetLayout, loaded } = useDashboardLayout()
  const [isEditing, setIsEditing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'Trader'

  const handleLayoutChange = (items: DashboardItem[]) => {
    updateLayout(items)
  }

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 space-y-3 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-32 bg-zinc-800 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 min-h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-zinc-500" />
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">
              {isEditing ? 'Customize Dashboard' : `Good morning, ${firstName}`}
            </h1>
            {!isEditing && (
              <p className="text-xs text-zinc-500">Your trading overview</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <button
                onClick={() => { resetLayout(); setIsEditing(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            </>
          )}
          <button
            onClick={() => setIsEditing((e) => !e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              isEditing
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {isEditing ? <><Check size={13} /> Done</> : <><Pencil size={13} /> Edit</>}
          </button>
        </div>
      </div>

      {isEditing && (
        <p className="text-xs text-zinc-500 mb-4 flex items-center gap-1">
          <span className="text-blue-400">✦</span> Drag to reorder, resize from corners, or remove widgets
        </p>
      )}

      {layout.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <LayoutDashboard size={40} className="text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No widgets yet</p>
          <p className="text-zinc-600 text-sm mt-1 mb-4">Add widgets to build your dashboard</p>
          <button
            onClick={() => { setIsEditing(true); setPickerOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Widgets
          </button>
        </div>
      ) : (
        <DashboardGrid
          layout={layout}
          isEditing={isEditing}
          onLayoutChange={handleLayoutChange}
          onRemove={removeWidget}
        />
      )}

      <WidgetPicker
        open={pickerOpen}
        layout={layout}
        onAdd={addWidget}
        onClose={() => setPickerOpen(false)}
      />
    </motion.div>
  )
}
