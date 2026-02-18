'use client'

import { useState, type FormEvent } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Lock, Shield } from 'lucide-react'

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { success, error: showError } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const errs: Record<string, string> = {}
    if (!currentPassword) errs.currentPassword = 'Current password is required'
    if (!newPassword) errs.newPassword = 'New password is required'
    else if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters'
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('incorrect')) {
          setErrors({ currentPassword: 'Current password is incorrect' })
        } else {
          showError(data.error || 'Failed to change password')
        }
        return
      }

      success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="mt-1 text-sm text-subtle">Manage your password and security settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cr0n-violet/10">
              <Shield className="h-5 w-5 text-cr0n-violet" />
            </div>
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
