import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In — cr0n',
  description: 'Sign in to your cr0n account',
}

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-subtle">Sign in to continue to your dashboard</p>
      </div>
      <LoginForm />
    </>
  )
}
