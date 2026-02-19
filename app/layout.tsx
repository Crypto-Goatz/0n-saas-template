import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || '0n'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://0n-saas-template.vercel.app'

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — The Autonomous Growth Engine`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Autonomous conversion optimization and search experience engine. CRO + SXO combined into one self-learning system.',
  keywords: ['CRO', 'SXO', 'conversion optimization', 'SEO', 'AI optimization', 'growth engine'],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} — The Autonomous Growth Engine`,
    description: 'CRO + SXO combined. One self-learning engine that optimizes everything automatically.',
    url: APP_URL,
    siteName: APP_NAME,
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — The Autonomous Growth Engine`,
    description: 'Autonomous conversion + search experience optimization.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-void font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
