import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { hashPassword, generateResetToken, logActivity } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { TABLES } from '@/lib/constants'

// POST: Request a password reset
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: user } = await supabase
      .from(TABLES.users)
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = generateResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await supabase.from(TABLES.passwordResets).insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    await sendPasswordResetEmail(user.email, token)
    await logActivity('request_password_reset', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Execute the password reset
export async function PUT(request: Request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: reset, error } = await supabase
      .from(TABLES.passwordResets)
      .select('id, user_id, expires_at, used')
      .eq('token', token)
      .single()

    if (error || !reset || reset.used) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    const passwordHash = hashPassword(password)

    // Update password
    await supabase.from(TABLES.users).update({ password_hash: passwordHash }).eq('id', reset.user_id)

    // Mark token as used
    await supabase.from(TABLES.passwordResets).update({ used: true }).eq('id', reset.id)

    // Invalidate all existing sessions
    await supabase.from(TABLES.sessions).delete().eq('user_id', reset.user_id)

    await logActivity('reset_password', reset.user_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password execute error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
