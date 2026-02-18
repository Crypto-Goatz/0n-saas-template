'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from '@/components/ui/loading'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [resending, setResending] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => setStatus(res.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [token])

  async function handleResend() {
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      if (res.ok) {
        showSuccess('Verification email sent!')
      } else {
        const data = await res.json()
        showError(data.error || 'Failed to resend')
      }
    } catch {
      showError('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Spinner size="lg" />
        <p className="text-sm text-subtle">Verifying your email...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cr0n-success/20">
          <CheckCircle className="h-6 w-6 text-cr0n-success" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Email verified</h1>
        <p className="mb-6 text-sm text-subtle">
          Your email has been verified. You&apos;re all set!
        </p>
        <Link href="/dashboard" className="text-sm text-cr0n-cyan hover:underline">
          Go to dashboard
        </Link>
      </div>
    )
  }

  if (status === 'no-token') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cr0n-cyan/20">
          <Mail className="h-6 w-6 text-cr0n-cyan" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Verify your email</h1>
        <p className="mb-6 text-sm text-subtle">
          Check your inbox for a verification link. If you didn&apos;t receive it, click below to resend.
        </p>
        <Button variant="secondary" loading={resending} onClick={handleResend}>
          Resend verification email
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cr0n-danger/20">
        <XCircle className="h-6 w-6 text-cr0n-danger" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">Verification failed</h1>
      <p className="mb-6 text-sm text-subtle">
        This link is invalid or has expired.
      </p>
      <Button variant="secondary" loading={resending} onClick={handleResend}>
        Resend verification email
      </Button>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
