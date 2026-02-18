'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { User, Mail, CheckCircle } from 'lucide-react'

interface UserData {
  userId: string
  email: string
  fullName: string | null
  plan: string
  emailVerified: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setUser(data)
        setFullName(data.fullName || '')
      })
      .catch(() => {})
  }, [])

  async function handleResendVerification() {
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      if (res.ok) {
        success('Verification email sent!')
      } else {
        const data = await res.json()
        error(data.error || 'Failed to send')
      }
    } catch {
      error('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-subtle">Manage your account settings</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User className="h-4 w-4" />}
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={user.email}
            disabled
            icon={<Mail className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Email Verification */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>Verify your email address</CardDescription>
            </div>
            {user.emailVerified ? (
              <Badge variant="emerald">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="amber">Unverified</Badge>
            )}
          </div>
        </CardHeader>
        {!user.emailVerified && (
          <CardContent>
            <p className="mb-3 text-sm text-subtle">
              Please verify your email address to access all features.
            </p>
            <Button variant="secondary" size="sm" loading={resending} onClick={handleResendVerification}>
              Resend verification email
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan</CardTitle>
              <CardDescription>Your current subscription</CardDescription>
            </div>
            <Badge variant="cyan" className="capitalize">{user.plan}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" size="sm" onClick={() => window.location.href = '/settings/billing'}>
            Manage billing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
