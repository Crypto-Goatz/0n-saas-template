'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/loading'
import { Lock, CheckCircle } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const { error: showError, success: showSuccess } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Invalid link</h1>
        <p className="mb-6 text-sm text-subtle">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="text-sm text-cr0n-cyan hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cr0n-success/20">
          <CheckCircle className="h-6 w-6 text-cr0n-success" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Password updated</h1>
        <p className="mb-6 text-sm text-subtle">
          Your password has been reset. You can now sign in.
        </p>
        <Link href="/login" className="text-sm text-cr0n-cyan hover:underline">
          Go to sign in
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const errs: Record<string, string> = {}
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        showError(data.error || 'Failed to reset password')
        return
      }

      setDone(true)
      showSuccess('Password updated successfully')
    } catch {
      showError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="mt-1 text-sm text-subtle">Enter your new password below</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          name="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          autoFocus
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} className="w-full">
          Reset Password
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
