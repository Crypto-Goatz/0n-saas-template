'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { error: showError } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    if (!email) return setErrors({ email: 'Email is required' })
    if (!password) return setErrors({ password: 'Password is required' })

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('credentials')) {
          setErrors({ password: 'Invalid email or password' })
        } else {
          showError(data.error || 'Login failed')
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
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        icon={<Mail className="h-4 w-4" />}
        autoComplete="email"
        autoFocus
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        icon={<Lock className="h-4 w-4" />}
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-subtle hover:text-cr0n-cyan transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>

      <p className="text-center text-sm text-subtle">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-cr0n-cyan hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
