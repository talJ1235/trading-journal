import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const TradesPage = lazy(() => import('./pages/TradesPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const PatternsPage = lazy(() => import('./pages/PatternsPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))

function AppShell() {
  return (
    <div className="flex h-screen bg-[#0F0F0F]">
      <Navigation />
      {/* md:ml-60 = sidebar width; pb-nav-safe = 60px mobile nav + iOS safe area */}
      <main className="flex-1 md:ml-60 overflow-y-auto pb-nav-safe md:pb-0">
        <Routes>
          <Route path="/" element={<Navigate to="/trades" replace />} />
          <Route path="/trades" element={<ErrorBoundary><TradesPage /></ErrorBoundary>} />
          <Route path="/review" element={<ErrorBoundary><ReviewPage /></ErrorBoundary>} />
          <Route path="/patterns" element={<ErrorBoundary><PatternsPage /></ErrorBoundary>} />
          <Route path="/goals" element={<ErrorBoundary><GoalsPage /></ErrorBoundary>} />
          <Route path="*" element={<Navigate to="/trades" replace />} />
        </Routes>
      </main>
      <PWAInstallPrompt />
    </div>
  )
}

export default function App() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    </BrowserRouter>
  )
}
