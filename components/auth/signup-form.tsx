'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Mail, Lock, User } from 'lucide-react'

export function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { error: showError } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'Name is required'
    if (!email) errs.email = 'Email is required'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'

    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('exists')) {
          setErrors({ email: 'An account with this email already exists' })
        } else {
          showError(data.error || 'Registration failed')
        }
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      showError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Jane Smith"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        icon={<User className="h-4 w-4" />}
        autoComplete="name"
        autoFocus
      />
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        icon={<Mail className="h-4 w-4" />}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Min. 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        icon={<Lock className="h-4 w-4" />}
        autoComplete="new-password"
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
        Create Account
      </Button>

      <p className="text-center text-sm text-subtle">
        Already have an account?{' '}
        <Link href="/login" className="text-cr0n-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
