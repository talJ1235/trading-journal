import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
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

  return (
    <div className="flex h-screen bg-[#0F0F0F]">
      <Navigation />
      {/* md:ml-60 = sidebar width; pb-nav-safe = 60px mobile nav + iOS safe area */}
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
  const [showExpiredToast, setShowExpiredToast] = useState(false)

  useEffect(() => {
    if (!showExpiredToast) return
    const t = setTimeout(() => setShowExpiredToast(false), 5000)
    return () => clearTimeout(t)
  }, [showExpiredToast])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const start = parseInt(localStorage.getItem(SESSION_KEY) ?? '0', 10)
        if (start && Date.now() - start > MAX_SESSION_AGE) {
          void supabase.auth.signOut()
          localStorage.removeItem(SESSION_KEY)
          setSession(null)
          setShowExpiredToast(true)
        } else {
          if (!start) localStorage.setItem(SESSION_KEY, String(Date.now()))
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
        if (!localStorage.getItem(SESSION_KEY)) {
          localStorage.setItem(SESSION_KEY, String(Date.now()))
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(SESSION_KEY)
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

      {/* Session expired toast */}
      <AnimatePresence>
        {showExpiredToast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-3 text-sm text-zinc-200 shadow-2xl whitespace-nowrap"
          >
            Session expired. Please sign in again.
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}
