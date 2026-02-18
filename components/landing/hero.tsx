import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cr0n-cyan/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-cr0n-violet/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge variant="cyan" className="mb-6 animate-[fade-in_0.5s_ease-out]">
            <Zap className="mr-1 h-3 w-3" />
            Now in Public Beta
          </Badge>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl animate-[slide-up_0.5s_ease-out]">
            The Autonomous{' '}
            <span className="text-gradient">Growth Engine</span>
          </h1>

          {/* Subline */}
          <p className="mb-8 text-lg text-gray-400 sm:text-xl animate-[slide-up_0.6s_ease-out]">
            CRO + SXO combined into one self-learning system.
            <br className="hidden sm:block" />
            Optimize conversions, search experience, and revenue — automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-[slide-up_0.7s_ease-out]">
            <Link href="/signup">
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Get Started Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">
                See How it Works
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 animate-[fade-in_1s_ease-out]">
            {[
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '3x', label: 'Faster Optimization' },
              { value: '24/7', label: 'Autonomous Operation' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="text-xs text-subtle sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
