import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getAuth, checkPlanLimit } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { data: userSites } = await supabase
      .from('cr0n_user_sites')
      .select(`
        role,
        site:cr0n_sites(id, name, domain, settings, created_at)
      `)
      .eq('user_id', auth.userId)

    const sites = userSites?.map((us) => ({
      ...((Array.isArray(us.site) ? us.site[0] : us.site) || {}),
      role: us.role,
    })) || []

    return NextResponse.json({ sites })
  } catch (error) {
    console.error('List sites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, domain } = await request.json()
    if (!name) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 })
    }

    // Check plan limit
    const { allowed, current, limit } = await checkPlanLimit(auth.userId, 'sites')
    if (!allowed) {
      return NextResponse.json({
        error: `You've reached your plan limit of ${limit} site${limit === 1 ? '' : 's'}. Current: ${current}`,
      }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()

    const { data: site, error } = await supabase
      .from('cr0n_sites')
      .insert({ name, domain: domain || null })
      .select('id, name, domain')
      .single()

    if (error || !site) {
      return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
    }

    await supabase.from('cr0n_user_sites').insert({
      user_id: auth.userId,
      site_id: site.id,
      role: 'owner',
    })

    return NextResponse.json({ site })
  } catch (error) {
    console.error('Create site error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
