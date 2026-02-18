'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { PLANS, type PlanId } from '@/lib/pricing'
import { Check, Zap, X } from 'lucide-react'

interface UserData {
  plan: string
  stripeCustomerId: string | null
}

export default function BillingPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const { error } = useToast()

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {})
  }, [])

  async function handleManageBilling() {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        error(data.error || 'Failed to open billing portal')
      }
    } catch {
      error('Something went wrong')
    } finally {
      setBillingLoading(false)
    }
  }

  async function handleCheckout(priceId: string) {
    setCheckoutLoading(priceId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        error(data.error || 'Failed to start checkout')
      }
    } catch {
      error('Something went wrong')
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (!user) return null

  const planEntries = Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-subtle">Manage your subscription and billing</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are on the <span className="capitalize text-white">{user.plan}</span> plan</CardDescription>
            </div>
            <Badge variant="cyan" className="capitalize">{user.plan}</Badge>
          </div>
        </CardHeader>
        {user.stripeCustomerId && (
          <CardFooter>
            <Button variant="secondary" size="sm" loading={billingLoading} onClick={handleManageBilling}>
              Manage billing
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {planEntries.map(([key, plan]) => {
          const isCurrent = user.plan === key
          const isPopular = plan.highlighted
          return (
            <Card
              key={key}
              className={isPopular ? 'border-cr0n-cyan/30 shadow-lg shadow-cyan-500/5' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {'badge' in plan && plan.badge && <Badge variant="cyan">{plan.badge}</Badge>}
                </div>
                <p className="text-xs text-subtle">{plan.tagline}</p>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">${plan.monthlyPrice}</span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-subtle">/month</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
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
                {isCurrent ? (
                  <Button variant="secondary" size="sm" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : plan.stripePriceId ? (
                  <Button
                    variant={isPopular ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full"
                    loading={checkoutLoading === plan.stripePriceId}
                    onClick={() => handleCheckout(plan.stripePriceId!)}
                    icon={<Zap className="h-4 w-4" />}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled={plan.monthlyPrice === 0} className="w-full">
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
