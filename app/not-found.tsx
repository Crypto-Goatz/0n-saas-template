import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void bg-grid px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cr0n-cyan/5 blur-3xl" />
      </div>

      <div className="relative text-center">
        <p className="mb-4 font-mono text-7xl font-bold text-cr0n-cyan/20 sm:text-9xl">404</p>
        <h1 className="mb-2 text-2xl font-bold text-white">Page not found</h1>
        <p className="mb-8 text-sm text-subtle">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
