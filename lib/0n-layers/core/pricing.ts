/**
 * Layer 0: CORE — Plan definitions and limit enforcement.
 */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Get started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceId: null,
    stripeYearlyPriceId: null,
    highlighted: false,
    cta: 'Get Started',
    limits: { sites: 1 },
    features: [
      { name: '1 Site', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Community support', included: true },
      { name: 'Custom domains', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing businesses',
    monthlyPrice: 49,
    yearlyPrice: 490,
    stripePriceId: null,
    stripeYearlyPriceId: null,
    highlighted: true,
    badge: 'MOST POPULAR',
    cta: 'Start Free Trial',
    limits: { sites: 5 },
    features: [
      { name: '5 Sites', included: true },
      { name: 'Full analytics dashboard', included: true },
      { name: 'Custom domains', included: true },
      { name: 'Priority support', included: true },
      { name: 'API access', included: true },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For teams at scale',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    stripePriceId: null,
    stripeYearlyPriceId: null,
    highlighted: false,
    cta: 'Start Free Trial',
    limits: { sites: -1 },
    features: [
      { name: 'Unlimited Sites', included: true },
      { name: 'Everything in Pro', included: true },
      { name: 'White-label option', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Custom integrations', included: true },
    ],
  },
} as const

export const PLAN_LIMITS = {
  sites: { free: 1, pro: 5, enterprise: -1 },
  pages: { free: 5, pro: 50, enterprise: -1 },
  blogPosts: { free: 10, pro: 100, enterprise: -1 },
  mediaStorage: { free: 100, pro: 5000, enterprise: 50000 },
  contacts: { free: 100, pro: 5000, enterprise: -1 },
  aiGenerations: { free: 10, pro: 500, enterprise: -1 },
} as const

export const PRICE_TO_PLAN: Record<string, string> = {}

export type PlanId = keyof typeof PLANS

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] || PLANS.free
}

export function getPlanLimit(planId: string, resource: keyof typeof PLAN_LIMITS): number {
  const plan = planId as keyof typeof PLAN_LIMITS.sites
  return PLAN_LIMITS[resource][plan] ?? PLAN_LIMITS[resource].free
}

export function getYearlySavings(plan: (typeof PLANS)[PlanId]): number {
  if (plan.monthlyPrice === 0) return 0
  return plan.monthlyPrice * 12 - plan.yearlyPrice
}

export function getYearlyMonthlyEquivalent(plan: (typeof PLANS)[PlanId]): number {
  if (plan.yearlyPrice === 0) return 0
  return Math.round(plan.yearlyPrice / 12)
}
