import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void bg-grid px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cr0n-cyan/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-60 w-60 rounded-full bg-cr0n-violet/10 blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cr0n-cyan to-cr0n-violet">
          <span className="text-lg font-bold text-void">0</span>
        </div>
        <span className="text-2xl font-bold text-white">
          cr<span className="text-cr0n-cyan">0</span>n
        </span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-surface/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-subtle">
        &copy; {new Date().getFullYear()} cr0n. All rights reserved.
      </p>
    </div>
  )
}
