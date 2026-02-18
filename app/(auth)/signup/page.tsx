import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up — cr0n',
  description: 'Create your cr0n account',
}

export default function SignupPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-subtle">Start building with cr0n in minutes</p>
      </div>
      <SignupForm />
    </>
  )
}
