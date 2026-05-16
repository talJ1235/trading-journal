import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { WIDGET_REGISTRY, DEFAULT_LAYOUTS, goalToLayoutKey } from '../components/dashboard/widgetRegistry'
import type { DashboardItem } from '../components/dashboard/widgetRegistry'

export function useDashboardLayout() {
  const { user } = useAuthStore()
  const { settings } = useSettingsStore()
  const [layout, setLayout] = useState<DashboardItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!user) return
    const fallback = () => {
      const key = goalToLayoutKey(settings.trading_goal)
      setLayout(DEFAULT_LAYOUTS[key])
      setLoaded(true)
    }
    void supabase
      .from('user_settings')
      .select('dashboard_layout')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const saved = data?.dashboard_layout
        if (Array.isArray(saved) && saved.length > 0) {
          setLayout(saved as DashboardItem[])
          setLoaded(true)
        } else {
          fallback()
        }
      }, () => fallback())
  }, [user?.id, settings.trading_goal]) // eslint-disable-line react-hooks/exhaustive-deps

  const persistLayout = useCallback(
    (items: DashboardItem[]) => {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        if (!user) return
        await supabase
          .from('user_settings')
          .upsert({ user_id: user.id, dashboard_layout: items }, { onConflict: 'user_id' })
      }, 1000)
    },
    [user]
  )

  const updateLayout = useCallback(
    (items: DashboardItem[]) => {
      setLayout(items)
      persistLayout(items)
    },
    [persistLayout]
  )

  const addWidget = useCallback(
    (widgetId: string) => {
      if (layout.some((l) => l.i === widgetId)) return
      const def = WIDGET_REGISTRY.find((d) => d.id === widgetId)
      if (!def) return
      const next: DashboardItem = {
        i: widgetId, x: 0, y: 99999,
        w: def.defaultW, h: def.defaultH,
        minW: def.minW, minH: def.minH,
      }
      updateLayout([...layout, next])
    },
    [layout, updateLayout]
  )

  const removeWidget = useCallback(
    (widgetId: string) => {
      updateLayout(layout.filter((l) => l.i !== widgetId))
    },
    [layout, updateLayout]
  )

  const resetLayout = useCallback(() => {
    const key = goalToLayoutKey(settings.trading_goal)
    updateLayout(DEFAULT_LAYOUTS[key])
  }, [settings.trading_goal, updateLayout])

  return { layout, updateLayout, addWidget, removeWidget, resetLayout, loaded }
}
