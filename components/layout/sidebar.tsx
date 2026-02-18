'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Globe,
  Settings,
  CreditCard,
  Shield,
  ChevronLeft,
  Menu,
  X,
  FileText,
  Image,
  Sparkles,
  Users,
  Kanban,
  Scale,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sites', href: '/dashboard/sites', icon: Globe },
]

const contentItems = [
  { label: 'Content', href: '/content', icon: FileText },
  { label: 'Media', href: '/media', icon: Image },
  { label: 'AI Writer', href: '/content?tab=generate', icon: Sparkles },
]

const crmItems = [
  { label: 'Contacts', href: '/crm', icon: Users },
  { label: 'Pipeline', href: '/crm?tab=pipeline', icon: Kanban },
]

const settingsItems = [
  { label: 'General', href: '/settings', icon: Settings },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
  { label: 'Security', href: '/settings/security', icon: Shield },
  { label: 'Compliance', href: '/settings/compliance', icon: Scale },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function NavLink({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) {
    const active = pathname === href
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active
            ? 'bg-cr0n-cyan/10 text-cr0n-cyan'
            : 'text-gray-400 hover:bg-muted/40 hover:text-white',
          collapsed && 'justify-center px-2',
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-4.5 w-4.5 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    )
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-3 py-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cr0n-cyan to-cr0n-violet">
          <span className="text-sm font-bold text-void">0</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white">
            cr<span className="text-cr0n-cyan">0</span>n
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        <p className={cn('mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-subtle', collapsed && 'sr-only')}>
          Main
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <div className="my-4 border-t border-border/30" />

        <p className={cn('mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-subtle', collapsed && 'sr-only')}>
          Content
        </p>
        {contentItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <div className="my-4 border-t border-border/30" />

        <p className={cn('mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-subtle', collapsed && 'sr-only')}>
          CRM
        </p>
        {crmItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <div className="my-4 border-t border-border/30" />

        <p className={cn('mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-subtle', collapsed && 'sr-only')}>
          Settings
        </p>
        {settingsItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden border-t border-border/30 p-2 lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl p-2 text-subtle hover:bg-muted/40 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-xl border border-border/50 bg-surface p-2 text-gray-400 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border/30 bg-dark/95 backdrop-blur-xl transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for desktop */}
      <div className={cn('hidden lg:block shrink-0 transition-all duration-300', collapsed ? 'w-16' : 'w-60')} />
    </>
  )
}
