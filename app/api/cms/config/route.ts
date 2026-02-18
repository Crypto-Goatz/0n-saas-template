import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { getSiteConfig, upsertSiteConfigKey } from '@/lib/google/sheets'

function json(data: object, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * GET /api/cms/config
 */
export async function GET(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  try {
    const config = await getSiteConfig()
    return json({ config })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}

/**
 * PUT /api/cms/config
 * Body: { key: string, value: string } or { updates: { key: value, ... } }
 */
export async function PUT(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  try {
    const body = await req.json()

    if (body.updates && typeof body.updates === 'object') {
      for (const [key, value] of Object.entries(body.updates)) {
        await upsertSiteConfigKey(key, String(value))
      }
      return json({ success: true, updated: Object.keys(body.updates).length })
    }

    if (body.key) {
      await upsertSiteConfigKey(body.key, body.value || '')
      return json({ success: true })
    }

    return json({ error: 'Provide { key, value } or { updates: { ... } }' }, 400)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}
