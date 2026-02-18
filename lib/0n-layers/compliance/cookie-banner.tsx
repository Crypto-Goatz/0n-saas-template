'use client'

import { useConsent } from './consent-provider'
import { Button } from '@/components/ui/button'
import { Shield, X } from 'lucide-react'

export function CookieBanner() {
  const { showBanner, mode, acceptAll, denyAll, acceptEssential, dismissBanner } = useConsent()

  if (!showBanner) return null

  const isGDPR = mode === 'gdpr'
  const isCCPA = mode === 'ccpa'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-[slideUp_0.3s_ease-out]">
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div className="relative rounded-2xl border border-border/50 bg-dark/95 p-5 shadow-2xl backdrop-blur-xl">
          <button
            onClick={dismissBanner}
            className="absolute right-3 top-3 rounded-lg p-1 text-subtle hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cr0n-cyan/10">
                <Shield className="h-5 w-5 text-cr0n-cyan" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">We value your privacy</p>
                <p className="mt-0.5 text-xs text-subtle">
                  {isGDPR
                    ? 'We use cookies and similar technologies to enhance your experience. You can choose which categories to allow.'
                    : isCCPA
                      ? 'We collect information to improve our services. You can opt out of the sale or sharing of your personal information.'
                      : 'We use essential cookies to keep our site working. No tracking without your permission.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isGDPR && (
                <>
                  <Button size="sm" variant="ghost" onClick={denyAll}>Decline</Button>
                  <Button size="sm" variant="secondary" onClick={acceptEssential}>Essential Only</Button>
                  <Button size="sm" onClick={acceptAll}>Accept All</Button>
                </>
              )}
              {isCCPA && (
                <>
                  <Button size="sm" variant="ghost" onClick={denyAll}>Do Not Sell</Button>
                  <Button size="sm" onClick={acceptAll}>OK</Button>
                </>
              )}
              {!isGDPR && !isCCPA && (
                <Button size="sm" onClick={acceptEssential}>Got it</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
