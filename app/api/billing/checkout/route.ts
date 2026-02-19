import { NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { createCheckoutSession, createOrGetCustomer } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://0n-saas-template.vercel.app'

export async function POST(request: Request) {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Get or create Stripe customer
    let customerId = auth.stripeCustomerId
    if (!customerId) {
      const customer = await createOrGetCustomer({
        email: auth.email,
        name: auth.fullName || undefined,
        metadata: { user_id: auth.userId },
      })
      customerId = customer.id
    }

    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${APP_URL}/dashboard?checkout=success`,
      cancelUrl: `${APP_URL}/dashboard/settings/billing?checkout=cancelled`,
      metadata: { user_id: auth.userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
