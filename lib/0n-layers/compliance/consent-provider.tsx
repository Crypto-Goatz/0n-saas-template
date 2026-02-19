'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { ConsentMode } from '../core/constants'

export type ConsentCategory = 'essential' | 'analytics' | 'marketing' | 'personalization'
export type ConsentStatus = 'pending' | 'granted' | 'denied' | 'essential-only'

interface ConsentState {
  mode: ConsentMode
  status: ConsentStatus
  categories: Record<ConsentCategory, boolean>
  showBanner: boolean
  setMode: (mode: ConsentMode) => void
  acceptAll: () => void
  denyAll: () => void
  acceptEssential: () => void
  hasConsent: (category: ConsentCategory) => boolean
  dismissBanner: () => void
}

const ConsentContext = createContext<ConsentState | null>(null)

const COOKIE_KEY = '0n_consent'
const STORAGE_KEY = '0n_consent_prefs'

export function ConsentProvider({ children, defaultMode = 'essential' }: { children: ReactNode; defaultMode?: ConsentMode }) {
  const [mode, setModeState] = useState<ConsentMode>(defaultMode)
  const [status, setStatus] = useState<ConsentStatus>('pending')
  const [categories, setCategories] = useState<Record<ConsentCategory, boolean>>({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false,
  })
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setStatus(parsed.status || 'pending')
        setCategories(parsed.categories || { essential: true, analytics: false, marketing: false, personalization: false })
        if (parsed.mode) setModeState(parsed.mode)
      } else if (mode === 'disabled') {
        setStatus('granted')
        setCategories({ essential: true, analytics: true, marketing: true, personalization: true })
      } else if (mode === 'essential') {
        setStatus('essential-only')
        setCategories({ essential: true, analytics: false, marketing: false, personalization: false })
      } else {
        const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
        if (mode === 'ccpa' && !gpc) {
          setStatus('granted')
          setCategories({ essential: true, analytics: true, marketing: true, personalization: true })
        } else {
          setShowBanner(true)
        }
      }
    } catch {}
  }, [mode])

  function persist(newStatus: ConsentStatus, newCategories: Record<ConsentCategory, boolean>) {
    setStatus(newStatus)
    setCategories(newCategories)
    setShowBanner(false)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: newStatus, categories: newCategories, mode }))
      document.cookie = `${COOKIE_KEY}=${newStatus}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    } catch {}
  }

  function acceptAll() {
    persist('granted', { essential: true, analytics: true, marketing: true, personalization: true })
  }

  function denyAll() {
    persist('denied', { essential: true, analytics: false, marketing: false, personalization: false })
  }

  function acceptEssential() {
    persist('essential-only', { essential: true, analytics: false, marketing: false, personalization: false })
  }

  function setMode(newMode: ConsentMode) {
    setModeState(newMode)
  }

  function hasConsent(category: ConsentCategory): boolean {
    if (category === 'essential') return true
    return categories[category] === true
  }

  function dismissBanner() {
    setShowBanner(false)
  }

  return (
    <ConsentContext.Provider value={{
      mode, status, categories, showBanner,
      setMode, acceptAll, denyAll, acceptEssential, hasConsent, dismissBanner,
    }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider')
  return ctx
}

// Re-export ConsentMode for consumers
export type { ConsentMode }
