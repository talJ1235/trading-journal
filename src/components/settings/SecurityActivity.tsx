import { useState, useEffect } from 'react'
import { Shield, CheckCircle, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { handleError } from '../../lib/errorHandler'

interface SecurityLog {
  id: string
  event: string
  metadata: Record<string, string> | null
  user_agent: string | null
  created_at: string
}

const EVENT_LABELS: Record<string, string> = {
  login: 'Signed in',
  logout: 'Signed out',
  failed_login: 'Failed login attempt',
  session_expired: 'Session expired',
  suspicious_activity: 'Suspicious activity detected',
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function shortAgent(ua: string | null): string {
  if (!ua) return 'Unknown device'
  if (/iPhone|iPad/.test(ua)) return 'iOS device'
  if (/Android/.test(ua)) return 'Android device'
  if (/Mac/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows PC'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Unknown device'
}

const SECURITY_STATUS = [
  { label: 'Session timeout', value: '7 days' },
  { label: 'Rate limiting', value: 'Active (5 attempts → 15 min, 10 → 1 hr, 15 → 24 hr)' },
  { label: 'Data encryption', value: 'Supabase RLS + TLS' },
  { label: 'HTTPS', value: 'Enforced via Vercel' },
  { label: 'Input sanitization', value: 'HTML/SQL/XSS stripping active' },
  { label: 'CSP headers', value: 'Strict policy enforced' },
]

export default function SecurityActivity() {
  const { user } = useAuthStore()
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [signedOutAll, setSignedOutAll] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('security_logs')
      .select('id, event, metadata, user_agent, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error: dbError }) => {
        if (dbError) setLogs([]) // silently degrade — table may not exist yet
        else setLogs((data as SecurityLog[]) ?? [])
        setLoading(false)
      })
  }, [user])

  const handleSignOutAll = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      setSignedOutAll(true)
    } catch (err) {
      setError(handleError(err, 'Sign out failed'))
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Security Activity</h2>
        <p className="text-sm text-zinc-500">Recent account events and security configuration.</p>
      </div>

      {/* Security status */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4 space-y-2.5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-green-400" />
          <p className="text-xs text-zinc-400 uppercase tracking-wide">Security Status</p>
        </div>
        {SECURITY_STATUS.map(({ label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <CheckCircle size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-xs text-white font-medium">{label}:</span>{' '}
              <span className="text-xs text-zinc-400">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">Recent Activity</p>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-xs mb-3">
            {error}
          </div>
        )}
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-zinc-500">No activity recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">
                    {EVENT_LABELS[log.event] ?? log.event}
                  </p>
                  <p className="text-xs text-zinc-500">{fmtDate(log.created_at)}</p>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{shortAgent(log.user_agent)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign out all devices */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-sm text-white font-medium mb-1">Sign Out of All Devices</p>
        <p className="text-xs text-zinc-500 mb-3">
          Revokes all active sessions. You will need to sign in again on every device.
        </p>
        {signedOutAll ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-green-400 text-sm">
            Signed out of all devices successfully.
          </div>
        ) : (
          <button
            onClick={() => void handleSignOutAll()}
            disabled={signingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
          >
            <LogOut size={14} />
            {signingOut ? 'Signing out…' : 'Sign out everywhere'}
          </button>
        )}
      </div>
    </div>
  )
}
