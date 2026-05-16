import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore, DEFAULT_SETTINGS } from '../store/settingsStore'
import { sanitizeObject } from '../lib/sanitize'
import { handleError } from '../lib/errorHandler'
import type { UserSettings } from '../store/settingsStore'

// Columns safe to insert for a new user (excludes onboarding/goal fields that need SQL migration)
const NEW_USER_DEFAULTS = {
  currency: DEFAULT_SETTINGS.currency,
  week_start: DEFAULT_SETTINGS.week_start,
  show_micha_questions: DEFAULT_SETTINGS.show_micha_questions,
  default_asset_type: DEFAULT_SETTINGS.default_asset_type,
  default_position_size: DEFAULT_SETTINGS.default_position_size,
}

export function useSettings() {
  const { user } = useAuthStore()
  const { setSettings, setOnboardingCompleted } = useSettingsStore()
  const [, setLoading] = useState(true)
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
          trading_goal: data.trading_goal ?? null,
          trading_style: data.trading_style ?? null,
          onboarding_completed: data.onboarding_completed ?? false,
        })
        setOnboardingCompleted(data.onboarding_completed ?? false)
      } else {
        await supabase
          .from('user_settings')
          .insert({ user_id: user.id, ...NEW_USER_DEFAULTS })
        setSettings(DEFAULT_SETTINGS)
        setOnboardingCompleted(false)
      }
    } catch (err) {
      setError(handleError(err, 'Failed to load settings'))
      setOnboardingCompleted(false)
    } finally {
      setLoading(false)
    }
  }, [user, setSettings, setOnboardingCompleted])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates: Partial<UserSettings>): Promise<void> => {
    if (!user) throw new Error('Not authenticated')
    const clean = sanitizeObject(updates as Record<string, unknown>) as Partial<UserSettings>
    const { error: dbError } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...clean }, { onConflict: 'user_id' })
    if (dbError) throw dbError
    const current = useSettingsStore.getState().settings
    setSettings({ ...current, ...clean })
    if (clean.onboarding_completed !== undefined) {
      setOnboardingCompleted(clean.onboarding_completed)
    }
  }

  return { error, updateSettings }
}
