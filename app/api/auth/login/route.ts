import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyPassword, createSession, setSessionCookie, logActivity } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: user, error } = await supabase
      .from('cr0n_users')
      .select('id, email, password_hash, full_name, plan, status, email_verified, stripe_customer_id')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is suspended' }, { status: 403 })
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Clean up old sessions for this user (keep max 5)
    const { data: sessions } = await supabase
      .from('cr0n_sessions')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (sessions && sessions.length >= 5) {
      const toDelete = sessions.slice(4).map((s) => s.id)
      await supabase.from('cr0n_sessions').delete().in('id', toDelete)
    }

    // Create session
    const sessionToken = await createSession(user.id, request)
    await setSessionCookie(sessionToken)

    // Update last login
    await supabase.from('cr0n_users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

    // Log activity
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    await logActivity('login', user.id, undefined, { email: user.email }, ip)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        plan: user.plan,
        emailVerified: user.email_verified,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
