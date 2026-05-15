import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/trades" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      navigate('/trades')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-400">TJ</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trading Journal</h1>
          <p className="text-zinc-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] space-y-4"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors mt-2"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
