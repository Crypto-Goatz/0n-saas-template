import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { logActivity } from '@/lib/auth'
import { TABLES } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: verification, error } = await supabase
      .from(TABLES.emailVerifications)
      .select('id, user_id, expires_at')
      .eq('token', token)
      .single()

    if (error || !verification) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (new Date(verification.expires_at) < new Date()) {
      await supabase.from(TABLES.emailVerifications).delete().eq('id', verification.id)
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Mark email as verified
    await supabase.from(TABLES.users).update({ email_verified: true }).eq('id', verification.user_id)

    // Delete the verification token
    await supabase.from(TABLES.emailVerifications).delete().eq('id', verification.id)

    await logActivity('verify_email', verification.user_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
