import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { hashPassword, generateVerifyToken, createSession, setSessionCookie, logActivity } from '@/lib/auth'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'
import { createOrGetCustomer } from '@/lib/stripe'
import { syncRegistration } from '@/lib/crm'
import { TABLES, TABLE_PREFIX } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Check if user exists
    const { data: existing } = await supabase
      .from(TABLES.users)
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Hash password
    const passwordHash = hashPassword(password)

    // Create user
    const { data: user, error: userError } = await supabase
      .from(TABLES.users)
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName || null,
      })
      .select('id, email, full_name, plan')
      .single()

    if (userError || !user) {
      console.error('User creation error:', userError)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Create default site
    const { data: site } = await supabase
      .from(TABLES.sites)
      .insert({ name: fullName ? `${fullName}'s Site` : 'My Site' })
      .select('id')
      .single()

    if (site) {
      await supabase.from(TABLES.userSites).insert({
        user_id: user.id,
        site_id: site.id,
        role: 'owner',
      })
    }

    // Create verification token
    const verifyToken = generateVerifyToken()
    const verifyExpires = new Date()
    verifyExpires.setHours(verifyExpires.getHours() + 24)

    await supabase.from(TABLES.emailVerifications).insert({
      user_id: user.id,
      token: verifyToken,
      expires_at: verifyExpires.toISOString(),
    })

    // Best-effort: Stripe customer, CRM contact, emails
    const [stripeCustomer, crmContact] = await Promise.allSettled([
      createOrGetCustomer({ email: user.email, name: fullName, metadata: { user_id: user.id } }),
      syncRegistration({ email: user.email, name: fullName, source: TABLE_PREFIX }),
    ])

    // Update user with Stripe/CRM IDs
    const updates: Record<string, string> = {}
    if (stripeCustomer.status === 'fulfilled') updates.stripe_customer_id = stripeCustomer.value.id
    if (crmContact.status === 'fulfilled' && crmContact.value) updates.crm_contact_id = crmContact.value.id

    if (Object.keys(updates).length > 0) {
      await supabase.from(TABLES.users).update(updates).eq('id', user.id)
    }

    // Send emails (non-blocking)
    sendWelcomeEmail(user.email, fullName).catch(console.error)
    sendVerificationEmail(user.email, verifyToken).catch(console.error)

    // Create session
    const sessionToken = await createSession(user.id, request)
    await setSessionCookie(sessionToken)

    // Log activity
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    await logActivity('signup', user.id, site?.id, { email: user.email }, ip)

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.full_name, plan: user.plan },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
