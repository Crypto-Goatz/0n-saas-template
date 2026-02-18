'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Mail, ArrowLeft } from 'lucide-react'

export function PasswordResetForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { error: showError, success: showSuccess } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        showError(data.error || 'Failed to send reset email')
        return
      }

      setSent(true)
      showSuccess('Check your email for reset instructions')
    } catch {
      showError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cr0n-cyan/20">
          <Mail className="h-6 w-6 text-cr0n-cyan" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">Check your email</h3>
        <p className="mb-6 text-sm text-subtle">
          If an account with that email exists, we&apos;ve sent password reset instructions.
        </p>
        <Link href="/login" className="text-sm text-cr0n-cyan hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-subtle">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="h-4 w-4" />}
        autoComplete="email"
        autoFocus
      />

      <Button type="submit" loading={loading} className="w-full">
        Send Reset Link
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-subtle hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </form>
  )
}
