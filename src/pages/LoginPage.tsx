import { useState, useEffect, useCallback } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { simpleHash, secureStore, secureRetrieve, logSecurityEvent } from '../lib/sessionSecurity'
import LoadingScreen from '../components/LoadingScreen'

// ─── Progressive rate limiter (per-email) ────────────────────────────────────
const LOCK_TIERS = [
  { attempts: 5,  duration: 15 * 60 * 1000 },        // 15 minutes
  { attempts: 10, duration: 60 * 60 * 1000 },         // 1 hour
  { attempts: 15, duration: 24 * 60 * 60 * 1000 },    // 24 hours
]

interface FailRecord { count: number; lockedUntil: number }

function emailKey(email: string): string {
  return `lf_${simpleHash(email.toLowerCase().trim())}`
}

function getRecord(email: string): FailRecord {
  if (!email.trim()) return { count: 0, lockedUntil: 0 }
  const raw = secureRetrieve(emailKey(email))
  if (!raw) return { count: 0, lockedUntil: 0 }
  try { return JSON.parse(raw) as FailRecord }
  catch { return { count: 0, lockedUntil: 0 } }
}

function isLocked(rec: FailRecord): boolean { return Date.now() < (rec.lockedUntil ?? 0) }
function lockSecs(rec: FailRecord): number { return Math.max(0, Math.ceil((rec.lockedUntil - Date.now()) / 1000)) }

function recordFail(email: string): FailRecord {
  const rec = getRecord(email)
  const count = rec.count + 1
  const tier = [...LOCK_TIERS].reverse().find((t) => count >= t.attempts)
  const lockedUntil = tier ? Date.now() + tier.duration : 0
  const newRec = { count, lockedUntil }
  secureStore(emailKey(email), JSON.stringify(newRec))
  return newRec
}

function clearFails(email: string): void { localStorage.removeItem(emailKey(email)) }

function attemptsRemaining(count: number): number {
  const nextTier = LOCK_TIERS.find((t) => t.attempts > count)
  return nextTier ? nextTier.attempts - count : 0
}

function fmtSecs(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ─── Google SVG logo ─────────────────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))

  const [locked, setLocked] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)

  // Recompute lock status whenever email changes
  useEffect(() => {
    const rec = getRecord(email)
    const lock = isLocked(rec)
    setLocked(lock)
    setCountdown(lock ? lockSecs(rec) : 0)
    setRemaining((!lock && rec.count > 0) ? attemptsRemaining(rec.count) : null)
  }, [email])

  // Countdown tick when locked
  useEffect(() => {
    if (!locked) return
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { setLocked(false); setRemaining(null); clearInterval(t); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [locked])

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (authError) {
      setError('Sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const rec = getRecord(email)
    if (isLocked(rec)) {
      setLocked(true)
      setCountdown(lockSecs(rec))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      clearFails(email)
      void logSecurityEvent('login')
      navigate('/trades')
    } catch {
      const newRec = recordFail(email)
      void logSecurityEvent('failed_login', { email_hash: emailKey(email) })
      if (isLocked(newRec)) {
        setLocked(true)
        setCountdown(lockSecs(newRec))
        setRemaining(null)
      } else {
        setRemaining(attemptsRemaining(newRec.count))
        setError('Incorrect email or password.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [email, password, navigate])

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/trades" replace />

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors'

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-400">TJ</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trading Journal</h1>
          <p className="text-zinc-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] space-y-4">
          {/* Lockout banner */}
          {locked ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2.5 text-yellow-400 text-sm text-center">
              Too many attempts. Try again in{' '}
              <span className="font-mono font-bold">{fmtSecs(countdown)}</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          ) : null}

          {/* Google button */}
          <button
            onClick={() => void handleGoogle()}
            disabled={googleLoading || locked}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm font-medium transition-colors"
          >
            <GoogleLogo />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="text-xs text-zinc-500 uppercase tracking-wide">or</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>

          {/* Email / password form */}
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={locked}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={locked}
                className={inputCls}
                placeholder="••••••••"
              />
              {remaining !== null && remaining <= 3 && (
                <p className="text-xs text-yellow-400 mt-1.5">
                  {remaining} attempt{remaining !== 1 ? 's' : ''} remaining before lockout
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || locked}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
