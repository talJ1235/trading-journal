import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingScreen from './LoadingScreen'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuthStore()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
