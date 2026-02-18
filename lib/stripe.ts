import Stripe from 'stripe'
import { PRICE_TO_PLAN } from './pricing'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY')
    _stripe = new Stripe(secretKey)
  }
  return _stripe
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  trialDays,
  metadata = {},
}: {
  customerId?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()

  const config: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: { metadata, ...(trialDays ? { trial_period_days: trialDays } : {}) },
  }

  if (customerId) {
    config.customer = customerId
  } else {
    config.customer_creation = 'always'
  }

  return stripe.checkout.sessions.create(config)
}

export async function createOneTimeCheckout({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  customerId?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()

  const config: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  }

  if (customerId) {
    config.customer = customerId
  } else {
    config.customer_creation = 'always'
  }

  return stripe.checkout.sessions.create(config)
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function createOrGetCustomer({
  email,
  name,
  metadata = {},
}: {
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  const stripe = getStripe()

  const existing = await stripe.customers.list({
    email: email.toLowerCase(),
    limit: 1,
  })

  if (existing.data.length > 0) {
    return existing.data[0]
  }

  return stripe.customers.create({
    email: email.toLowerCase(),
    name,
    metadata,
  })
}

export function getPlanFromPriceId(priceId: string): string {
  return PRICE_TO_PLAN[priceId] || 'free'
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await getStripe().customers.retrieve(customerId)
    if (customer.deleted) return null
    return customer as Stripe.Customer
  } catch {
    return null
  }
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await getStripe().subscriptions.retrieve(subscriptionId)
  } catch {
    return null
  }
}
