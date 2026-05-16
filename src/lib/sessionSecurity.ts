import { supabase } from './supabase'

// ─── Hashing ──────────────────────────────────────────────────────────────────
function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash >>> 0
}

export function simpleHash(str: string): string {
  return djb2(str).toString(36)
}

// ─── Tamper-evident localStorage ─────────────────────────────────────────────
const INTEGRITY_SALT = 'trading-journal-integrity'

export function secureStore(key: string, value: string): void {
  const checksum = simpleHash(value + key + INTEGRITY_SALT)
  try {
    localStorage.setItem(key, JSON.stringify({ value, checksum }))
  } catch {
    // localStorage blocked or full — fail silently
  }
}

export function secureRetrieve(key: string): string | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: string; checksum?: string }
    if (typeof parsed.value !== 'string' || typeof parsed.checksum !== 'string') {
      return null
    }
    const expected = simpleHash(parsed.value + key + INTEGRITY_SALT)
    if (parsed.checksum !== expected) {
      localStorage.removeItem(key) // tampered — purge
      return null
    }
    return parsed.value
  } catch {
    return null
  }
}

// ─── Session validation ───────────────────────────────────────────────────────
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
let lastSessionCheck = 0

export async function validateSession(): Promise<boolean> {
  const now = Date.now()
  if (now - lastSessionCheck < SESSION_CHECK_INTERVAL) return true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) lastSessionCheck = now
    return session !== null
  } catch {
    return true // network error → don't sign out
  }
}

// ─── Browser fingerprint ──────────────────────────────────────────────────────
export function getBrowserFingerprint(): string {
  const components = [
    navigator.userAgent,
    `${window.screen.width}x${window.screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
  ].join('|')
  return simpleHash(components)
}

const FP_KEY = '_fp'

export function storeFingerprint(): void {
  sessionStorage.setItem(FP_KEY, getBrowserFingerprint())
}

/** Returns true if fingerprint is present and doesn't match. */
export function isFingerprintMismatch(): boolean {
  const stored = sessionStorage.getItem(FP_KEY)
  if (!stored) return false // no fingerprint stored → new tab, skip check
  return stored !== getBrowserFingerprint()
}

// ─── Suspicious activity detection ───────────────────────────────────────────
const NAV_KEY = '_nav'

export function detectSuspiciousActivity(): { isSuspicious: boolean; reason: string | null } {
  try {
    const raw = sessionStorage.getItem(NAV_KEY)
    const data = raw
      ? (JSON.parse(raw) as { count: number; since: number })
      : { count: 0, since: Date.now() }

    const now = Date.now()
    if (now - data.since > 10_000) {
      sessionStorage.setItem(NAV_KEY, JSON.stringify({ count: 1, since: now }))
    } else {
      data.count++
      sessionStorage.setItem(NAV_KEY, JSON.stringify(data))
      if (data.count > 20) {
        return { isSuspicious: true, reason: 'Rapid navigation detected' }
      }
    }
  } catch {
    // sessionStorage blocked
  }
  return { isSuspicious: false, reason: null }
}

// ─── Security event logging ───────────────────────────────────────────────────
export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'session_expired'
  | 'suspicious_activity'

export async function logSecurityEvent(
  event: SecurityEventType,
  metadata?: Record<string, string>
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('security_logs').insert({
      user_id: session.user.id,
      event,
      metadata: metadata ?? {},
      user_agent: navigator.userAgent.slice(0, 200),
    })
  } catch {
    // Log failure is non-critical — never throw
  }
}
