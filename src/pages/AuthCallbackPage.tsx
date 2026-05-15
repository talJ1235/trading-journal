import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingScreen from '../components/LoadingScreen'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const url = window.location.href
    const code = new URL(url).searchParams.get('code')

    if (code) {
      supabase.auth
        .exchangeCodeForSession(url)
        .then(({ error }) => {
          if (error) {
            navigate('/login?error=' + encodeURIComponent(error.message), { replace: true })
          } else {
            navigate('/trades', { replace: true })
          }
        })
    } else {
      // No code — fall back to checking existing session (e.g. implicit flow hash)
      supabase.auth.getSession().then(({ data: { session } }) => {
        navigate(session ? '/trades' : '/login', { replace: true })
      })
    }
  }, [navigate])

  return <LoadingScreen />
}
