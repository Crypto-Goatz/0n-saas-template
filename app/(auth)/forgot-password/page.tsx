import type { Metadata } from 'next'
import { PasswordResetForm } from '@/components/auth/password-reset-form'

export const metadata: Metadata = {
  title: 'Reset Password — cr0n',
  description: 'Reset your cr0n password',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-subtle">We&apos;ll send you a reset link</p>
      </div>
      <PasswordResetForm />
    </>
  )
}
