'use client'

import type { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { ConsentProvider } from '@/components/tracking/consent-provider'
import { CookieBanner } from '@/components/tracking/cookie-banner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConsentProvider>
        {children}
        <CookieBanner />
      </ConsentProvider>
    </ToastProvider>
  )
}
