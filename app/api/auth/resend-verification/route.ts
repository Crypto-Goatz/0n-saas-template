import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getAuth, generateVerifyToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { TABLES } from '@/lib/constants'

export async function POST() {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Delete existing tokens
    await supabase.from(TABLES.emailVerifications).delete().eq('user_id', auth.userId)

    // Create new token
    const token = generateVerifyToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await supabase.from(TABLES.emailVerifications).insert({
      user_id: auth.userId,
      token,
      expires_at: expiresAt.toISOString(),
    })

    await sendVerificationEmail(auth.email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
