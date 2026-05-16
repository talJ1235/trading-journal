import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore, DEFAULT_SETTINGS } from '../store/settingsStore'
import type { UserSettings } from '../store/settingsStore'

export function useSettings() {
  const { user } = useAuthStore()
  const { setSettings } = useSettingsStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (dbError) throw dbError
      if (data) {
        setSettings({
          currency: data.currency ?? DEFAULT_SETTINGS.currency,
          week_start: data.week_start ?? DEFAULT_SETTINGS.week_start,
          show_micha_questions: data.show_micha_questions ?? DEFAULT_SETTINGS.show_micha_questions,
          default_asset_type: data.default_asset_type ?? DEFAULT_SETTINGS.default_asset_type,
          default_position_size: data.default_position_size ?? DEFAULT_SETTINGS.default_position_size,
        })
      } else {
        await supabase
          .from('user_settings')
          .insert({ user_id: user.id, ...DEFAULT_SETTINGS })
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [user, setSettings])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates: Partial<UserSettings>): Promise<void> => {
    if (!user) throw new Error('Not authenticated')
    const { error: dbError } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
    if (dbError) throw dbError
    const current = useSettingsStore.getState().settings
    setSettings({ ...current, ...updates })
  }

  return { loading, error, updateSettings }
}
