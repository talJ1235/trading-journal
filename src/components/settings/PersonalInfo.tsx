import { useAuthStore } from '../../store/authStore'

export default function PersonalInfo() {
  const { user } = useAuthStore()

  const name = (user?.user_metadata?.full_name as string | undefined) ?? '—'
  const email = user?.email ?? '—'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = (() => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0]! + parts[1][0]!).toUpperCase()
    return name.slice(0, 2).toUpperCase() || 'TJ'
  })()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Personal Info</h2>
        <p className="text-sm text-zinc-500">Profile information from your account provider.</p>
      </div>

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{name}</p>
          <p className="text-sm text-zinc-400 truncate">{email}</p>
          <p className="text-xs text-zinc-600 mt-0.5">Managed by your sign-in provider</p>
        </div>
      </div>
    </div>
  )
}
