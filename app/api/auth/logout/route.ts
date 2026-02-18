import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession, clearSessionCookie, logActivity } from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('cr0n_session')?.value

    if (token) {
      await deleteSession(token)
    }

    await clearSessionCookie()
    await logActivity('logout')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  }
}
