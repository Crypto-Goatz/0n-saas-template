import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/50 px-8 py-16 text-center sm:px-16">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cr0n-cyan/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-cr0n-violet/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to grow on <span className="text-gradient">autopilot</span>?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-gray-400">
              Join thousands of businesses using 0n to automate their growth.
              Start free — no credit card required.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                  Get Started Free
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
