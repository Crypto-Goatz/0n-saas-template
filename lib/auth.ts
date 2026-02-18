import crypto from 'crypto'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from './supabase'
import { PLAN_LIMITS, getPlanLimit } from './pricing'

const PREFIX = 'cr0n'
const COOKIE_NAME = `${PREFIX}_session`
const SESSION_DAYS = 30

export interface AuthContext {
  userId: string
  email: string
  fullName: string | null
  plan: string
  emailVerified: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  crmContactId: string | null
}

export interface SiteAccess {
  siteId: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
}

export { PLAN_LIMITS } from './pricing'

// ── Password Hashing (PBKDF2) ──────────────────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

// ── Token Generation ────────────────────────────────────────

export function generateSessionToken(): string {
  return `${PREFIX}_${crypto.randomUUID()}`
}

export function generateResetToken(): string {
  return `${PREFIX}_reset_${crypto.randomUUID()}`
}

export function generateVerifyToken(): string {
  return `${PREFIX}_verify_${crypto.randomUUID()}`
}

// ── Session Management ──────────────────────────────────────

export async function createSession(userId: string, request?: Request): Promise<string> {
  const supabase = getSupabaseAdmin()
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS)

  const ip = request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const ua = request?.headers.get('user-agent') || null

  await supabase.from(`${PREFIX}_sessions`).insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    ip_address: ip,
    user_agent: ua,
  })

  return token
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase.from(`${PREFIX}_sessions`).delete().eq('token', token)
}

// ── Auth Context ────────────────────────────────────────────

export async function getAuth(): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(COOKIE_NAME)?.value
    if (!sessionToken) return null

    const supabase = getSupabaseAdmin()
    const { data: session, error } = await supabase
      .from(`${PREFIX}_sessions`)
      .select(`
        id,
        expires_at,
        user:${PREFIX}_users(
          id, email, full_name, plan, email_verified, status,
          stripe_customer_id, stripe_subscription_id, crm_contact_id
        )
      `)
      .eq('token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !session) return null

    const user = Array.isArray(session.user) ? session.user[0] : session.user
    if (!user || user.status !== 'active') return null

    return {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      plan: user.plan || 'free',
      emailVerified: user.email_verified,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
      crmContactId: user.crm_contact_id,
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return null
  }
}

// ── Site Access ─────────────────────────────────────────────

export async function verifySiteAccess(userId: string, siteId: string): Promise<SiteAccess | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(`${PREFIX}_user_sites`)
      .select('site_id, role')
      .eq('user_id', userId)
      .eq('site_id', siteId)
      .single()

    if (error || !data) return null
    return { siteId: data.site_id, role: data.role }
  } catch {
    return null
  }
}

export async function getUserSites(userId: string): Promise<string[]> {
  try {
    const { data } = await getSupabaseAdmin()
      .from(`${PREFIX}_user_sites`)
      .select('site_id')
      .eq('user_id', userId)

    return data?.map((s) => s.site_id) || []
  } catch {
    return []
  }
}

export async function checkPlanLimit(
  userId: string,
  resource: keyof typeof PLAN_LIMITS,
): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from(`${PREFIX}_users`)
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = user?.plan || 'free'
  const limit = getPlanLimit(plan, resource)
  if (limit === -1) return { allowed: true, current: 0, limit: -1, plan }

  let current = 0
  if (resource === 'sites') {
    const { count } = await supabase
      .from(`${PREFIX}_user_sites`)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'owner')
    current = count || 0
  }

  return { allowed: current < limit, current, limit, plan }
}

// ── Activity Logging ────────────────────────────────────────

export async function logActivity(
  action: string,
  userId?: string,
  siteId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
): Promise<void> {
  try {
    await getSupabaseAdmin().from(`${PREFIX}_activity_log`).insert({
      action,
      user_id: userId || null,
      site_id: siteId || null,
      details: details || {},
      ip_address: ipAddress || null,
    })
  } catch (err) {
    console.error('Activity log error:', err)
  }
}
