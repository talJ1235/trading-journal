import { NavLink, useNavigate } from 'react-router-dom'
import { ClipboardList, BarChart2, TrendingUp, Target, LogOut, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/trades', icon: ClipboardList, label: 'Trades', prefetch: () => import('../pages/TradesPage') },
  { to: '/review', icon: BarChart2, label: 'Review', prefetch: () => import('../pages/ReviewPage') },
  { to: '/patterns', icon: TrendingUp, label: 'Patterns', prefetch: () => import('../pages/PatternsPage') },
  { to: '/goals', icon: Target, label: 'Goals', prefetch: () => import('../pages/GoalsPage') },
  { to: '/settings', icon: Settings, label: 'Settings', prefetch: () => import('../pages/SettingsPage') },
]

function UserAvatar({ url, initials }: { url?: string; initials: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt="Profile"
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-white">{initials}</span>
    </div>
  )
}

export default function Navigation() {
  const navigate = useNavigate()
  const { user, setSession } = useAuthStore()

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = (() => {
    const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0]! + parts[1][0]!).toUpperCase()
    return name.slice(0, 2).toUpperCase() || 'TJ'
  })()
  const email = user?.email ?? ''

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-[#1A1A1A] border-r border-[#2A2A2A] z-40">
        {/* User profile header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center gap-3">
          <UserAvatar url={avatarUrl} initials={initials} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">Trading Journal</p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">{email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, prefetch }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={prefetch}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-desktop"
                      className="absolute inset-0 bg-blue-500/20 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2A2A2A] space-y-1">
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation — 5 nav items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] z-40" aria-label="Main navigation">
        <div className="flex h-[60px]">
          {navItems.map(({ to, icon: Icon, label, prefetch }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={prefetch}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 gap-1 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-mobile"
                      className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-400 rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        {/* Fills the iOS safe area below the nav bar */}
        <div className="pb-safe bg-[#1A1A1A]" />
      </nav>
    </>
  )
}
