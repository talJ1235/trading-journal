import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function DangerZone() {
  const { user } = useAuthStore()
  const [requested, setRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  const handleRequest = async () => {
    if (!user) return
    setRequesting(true)
    setError(null)
    try {
      const { error: dbError } = await supabase
        .from('deletion_requests')
        .insert({ user_id: user.id })
      if (dbError) throw dbError
      setRequested(true)
      setConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-zinc-500">Irreversible actions. Proceed with caution.</p>
      </div>

      <div className="border border-red-500/20 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">Request Account Deletion</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your account and all data will be permanently deleted within 30 days. This cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}

        {requested ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-300 text-sm">
            Deletion request submitted. We'll process it within 30 days.
          </div>
        ) : !confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            Request Deletion
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-400">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => void handleRequest()}
                disabled={requesting}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {requesting ? 'Submitting…' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
