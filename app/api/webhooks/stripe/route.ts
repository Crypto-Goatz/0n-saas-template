import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getPlanFromPriceId } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (subscriptionId) {
        const sub = await getStripe().subscriptions.retrieve(subscriptionId)
        const subscription = sub as unknown as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceId ? getPlanFromPriceId(priceId) : 'free'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = (subscription as any).current_period_end as number | undefined

        await supabase
          .from(TABLES.users)
          .update({
            plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            ...(periodEnd ? { current_period_end: new Date(periodEnd * 1000).toISOString() } : {}),
          })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const priceId = subscription.items.data[0]?.price?.id
      const plan = subscription.status === 'active' && priceId
        ? getPlanFromPriceId(priceId)
        : 'free'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end as number | undefined

      await supabase
        .from(TABLES.users)
        .update({
          plan,
          stripe_subscription_id: subscription.id,
          ...(periodEnd ? { current_period_end: new Date(periodEnd * 1000).toISOString() } : {}),
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from(TABLES.users)
        .update({
          plan: 'free',
          stripe_subscription_id: null,
          current_period_end: null,
        })
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
