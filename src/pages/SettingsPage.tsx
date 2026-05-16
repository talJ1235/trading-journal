import { useState } from 'react'
import { User, SlidersHorizontal, BarChart2, Shield, Activity, Download, AlertTriangle } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import PersonalInfo from '../components/settings/PersonalInfo'
import AccountSettings from '../components/settings/AccountSettings'
import TradingPreferences from '../components/settings/TradingPreferences'
import PasswordSecurity from '../components/settings/PasswordSecurity'
import SecurityActivity from '../components/settings/SecurityActivity'
import DataExport from '../components/settings/DataExport'
import DangerZone from '../components/settings/DangerZone'

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'account', label: 'Account', icon: SlidersHorizontal },
  { id: 'trading', label: 'Trading', icon: BarChart2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'activity', label: 'Security Activity', icon: Activity },
  { id: 'data', label: 'Data & Export', icon: Download },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export default function SettingsPage() {
  const { error, updateSettings } = useSettings()
  const [active, setActive] = useState<SectionId>('personal')

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-48 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  active === id
                    ? 'bg-blue-500/20 text-blue-400'
                    : id === 'danger'
                    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-red-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon
                  size={16}
                  className={id === 'danger' && active !== id ? 'text-red-500/60' : ''}
                />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab strip — mobile */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex-shrink-0 border ${
                  active === id
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : id === 'danger'
                    ? 'bg-zinc-900 text-red-400/70 border-zinc-800 hover:border-red-500/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel — all sections always mounted, hidden via CSS */}
        <div className="flex-1 min-w-0 bg-zinc-900 rounded-2xl border border-zinc-800">
          <div className="p-5">
            <div className={active === 'personal' ? 'block' : 'hidden'}>
              <PersonalInfo />
            </div>
            <div className={active === 'account' ? 'block' : 'hidden'}>
              <AccountSettings onUpdate={updateSettings} />
            </div>
            <div className={active === 'trading' ? 'block' : 'hidden'}>
              <TradingPreferences onUpdate={updateSettings} />
            </div>
            <div className={active === 'security' ? 'block' : 'hidden'}>
              <PasswordSecurity />
            </div>
            <div className={active === 'activity' ? 'block' : 'hidden'}>
              <SecurityActivity />
            </div>
            <div className={active === 'data' ? 'block' : 'hidden'}>
              <DataExport />
            </div>
            <div className={active === 'danger' ? 'block' : 'hidden'}>
              <DangerZone />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
