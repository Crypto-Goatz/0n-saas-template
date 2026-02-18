'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Settings, User } from 'lucide-react'

interface DashboardHeaderProps {
  user: {
    fullName?: string | null
    email: string
    plan: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/30 bg-dark/80 px-6 backdrop-blur-sm">
      <div />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/40"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cr0n-cyan/30 to-cr0n-violet/30 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-white">{user.fullName || user.email}</p>
            <p className="text-xs text-subtle capitalize">{user.plan} plan</p>
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border/50 bg-surface p-1.5 shadow-xl">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-muted/50 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/settings/billing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-muted/50 hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                Billing
              </Link>
              <div className="my-1 border-t border-border/30" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-cr0n-danger hover:bg-cr0n-danger/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
