import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function PasswordSecurity() {
  const { user } = useAuthStore()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isGoogleUser = user?.app_metadata?.provider === 'google'

  const handleResetPassword = async () => {
    if (!user?.email) return
    setSending(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/auth/callback',
      })
      if (authError) throw authError
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Password &amp; Security</h2>
        <p className="text-sm text-zinc-500">Manage how you sign in to your account.</p>
      </div>

      {isGoogleUser ? (
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400">
            You sign in with <span className="text-white font-medium">Google</span>. Password management is handled by your Google account.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            We'll send a password reset link to <span className="text-white">{user?.email}</span>.
          </p>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          )}
          {sent ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 text-green-400 text-sm">
              Password reset email sent. Check your inbox.
            </div>
          ) : (
            <button
              onClick={() => void handleResetPassword()}
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send Reset Email'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
