import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-prompt-dismissed'
const INSTALLED_KEY = 'pwa-installed'
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function isDismissed(): boolean {
  const stored = localStorage.getItem(DISMISS_KEY)
  if (!stored) return false
  return Date.now() - parseInt(stored, 10) < DISMISS_TTL
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(INSTALLED_KEY) || isDismissed()) return

    let timer: ReturnType<typeof setTimeout>

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      timer = setTimeout(() => setVisible(true), 30_000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, '1')
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Mobile: slide up from bottom */}
          <motion.div
            className="md:hidden fixed bottom-[72px] left-3 right-3 z-50 bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-2xl"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Download size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Install Trading Journal</p>
                <p className="text-xs text-zinc-400 mt-0.5">Add to home screen for quick access</p>
              </div>
              <button onClick={dismiss} className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={dismiss}
                className="flex-1 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium transition-colors"
              >
                Not now
              </button>
              <button
                onClick={() => void install()}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
              >
                Install
              </button>
            </div>
          </motion.div>

          {/* Desktop: top-right banner */}
          <motion.div
            className="hidden md:flex fixed top-4 right-4 z-50 bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-2xl items-center gap-3 max-w-xs"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Download size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Install app</p>
              <p className="text-xs text-zinc-400">Quick access from desktop</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => void install()}
                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
              >
                Install
              </button>
              <button onClick={dismiss} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
