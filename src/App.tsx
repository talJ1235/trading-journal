import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import {
  secureStore,
  secureRetrieve,
  storeFingerprint,
  isFingerprintMismatch,
  validateSession,
  logSecurityEvent,
  detectSuspiciousActivity,
} from './lib/sessionSecurity'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const TradesPage = lazy(() => import('./pages/TradesPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const PatternsPage = lazy(() => import('./pages/PatternsPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const SESSION_KEY = 'session_start'
const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000

function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 animate-pulse pt-6">
      <div className="h-8 bg-zinc-800 rounded-xl w-1/3" />
      <div className="h-32 bg-zinc-800 rounded-2xl" />
      <div className="h-24 bg-zinc-800 rounded-2xl" />
      <div className="h-24 bg-zinc-800 rounded-2xl" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const main = document.querySelector('main')
    if (main) main.scrollTop = 0
  }, [pathname])
  return null
}

function AppShell() {
  const location = useLocation()
  const { setSession } = useAuthStore()

  // Validate session and detect suspicious activity on every route change
  useEffect(() => {
    const { isSuspicious, reason } = detectSuspiciousActivity()
    if (isSuspicious) {
      void logSecurityEvent('suspicious_activity', { reason: reason ?? 'unknown' })
    }

    validateSession().then((valid) => {
      if (!valid) {
        void supabase.auth.signOut()
        setSession(null)
      }
    }).catch(() => { /* network error — stay logged in */ })
  }, [location.pathname, setSession])

  return (
    <div className="flex h-screen bg-[#0F0F0F]">
      <Navigation />
      <main className="flex-1 md:ml-60 overflow-y-auto pb-nav-safe md:pb-0">
        <ScrollToTop />
        <Suspense fallback={<PageSkeleton />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/trades" replace />} />
              <Route path="/trades" element={<ErrorBoundary><TradesPage /></ErrorBoundary>} />
              <Route path="/review" element={<ErrorBoundary><ReviewPage /></ErrorBoundary>} />
              <Route path="/patterns" element={<ErrorBoundary><PatternsPage /></ErrorBoundary>} />
              <Route path="/goals" element={<ErrorBoundary><GoalsPage /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="*" element={<Navigate to="/trades" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <PWAInstallPrompt />
    </div>
  )
}

export default function App() {
  const { setSession, setLoading } = useAuthStore()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Fingerprint integrity check
        if (isFingerprintMismatch()) {
          void supabase.auth.signOut()
          localStorage.removeItem(SESSION_KEY)
          setSession(null)
          setToast('Security check failed. Please sign in again.')
          setLoading(false)
          return
        }

        // 7-day session age check
        const startRaw = secureRetrieve(SESSION_KEY)
        const start = startRaw ? parseInt(startRaw, 10) : 0
        if (start && Date.now() - start > MAX_SESSION_AGE) {
          void supabase.auth.signOut()
          localStorage.removeItem(SESSION_KEY)
          setSession(null)
          void logSecurityEvent('session_expired')
          setToast('Session expired. Please sign in again.')
        } else {
          if (!start) secureStore(SESSION_KEY, String(Date.now()))
          setSession(session)
        }
      } else {
        setSession(null)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (!secureRetrieve(SESSION_KEY)) {
          secureStore(SESSION_KEY, String(Date.now()))
        }
        // Store browser fingerprint on login
        storeFingerprint()
        void logSecurityEvent('login')
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(SESSION_KEY)
        void logSecurityEvent('logout')
      } else if (event === 'TOKEN_REFRESHED') {
        // Silent token refresh — update store, no toast
      }
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      {/* Security / session toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-3 text-sm text-zinc-200 shadow-2xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}
