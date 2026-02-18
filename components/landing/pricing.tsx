'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLANS, type PlanId, getYearlyMonthlyEquivalent, getYearlySavings } from '@/lib/pricing'
import { Check, X } from 'lucide-react'

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const planEntries = Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cr0n-cyan">Pricing</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent <span className="text-gradient">pricing</span>
          </h2>
          <p className="text-gray-400">Start free. Scale as you grow.</p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={yearly ? 'text-subtle' : 'text-white font-medium'}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative h-7 w-12 rounded-full bg-muted transition-colors"
              aria-label="Toggle yearly pricing"
            >
              <div
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-cr0n-cyan transition-transform ${
                  yearly ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={yearly ? 'text-white font-medium' : 'text-subtle'}>
              Yearly
              <Badge variant="emerald" className="ml-2">Save 17%</Badge>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {planEntries.map(([key, plan]) => {
            const isPopular = plan.highlighted
            const displayPrice = yearly ? getYearlyMonthlyEquivalent(plan) : plan.monthlyPrice
            const savings = yearly ? getYearlySavings(plan) : 0

            return (
              <Card
                key={key}
                className={isPopular ? 'border-cr0n-cyan/40 shadow-xl shadow-cyan-500/10 scale-[1.02]' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {'badge' in plan && plan.badge && <Badge variant="cyan">{plan.badge}</Badge>}
                  </div>
                  <p className="text-xs text-subtle">{plan.tagline}</p>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-white">${displayPrice}</span>
                    {displayPrice > 0 && <span className="text-sm text-subtle">/month</span>}
                    {yearly && savings > 0 && (
                      <p className="mt-1 text-xs text-cr0n-success">Save ${savings}/year</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-cr0n-cyan" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        )}
                        <span className={feature.included ? 'text-gray-300' : 'text-muted'}>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button
                      variant={isPopular ? 'primary' : 'secondary'}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
