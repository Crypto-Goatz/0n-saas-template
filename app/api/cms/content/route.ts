import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { getPlanLimit } from '@/lib/pricing'
import {
  getSheetData,
  updateSheetRow,
  appendSheetRow,
  deleteSheetRow,
  upsertSiteConfigKey,
} from '@/lib/google/sheets'
import type { SheetName } from '@/config/cms-schema'

const VALID_SHEETS: SheetName[] = [
  'pages', 'blog_posts', 'navigation', 'site_config', 'media_log',
  'contacts', 'leads', 'pipeline', 'activities', 'tags',
]

function json(data: object, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * GET /api/cms/content?sheet=pages
 */
export async function GET(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  const sheet = req.nextUrl.searchParams.get('sheet') as SheetName | null
  if (!sheet || !VALID_SHEETS.includes(sheet)) {
    return json({ error: `Invalid sheet. Valid: ${VALID_SHEETS.join(', ')}` }, 400)
  }

  try {
    const data = await getSheetData(sheet)
    return json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}

/**
 * POST /api/cms/content
 */
export async function POST(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  const { sheet, data } = await req.json()
  if (!sheet || !VALID_SHEETS.includes(sheet)) {
    return json({ error: 'Invalid sheet' }, 400)
  }

  // Plan limit checks for content creation
  if (sheet === 'pages') {
    const existing = await getSheetData('pages')
    const limit = getPlanLimit(auth.plan, 'pages')
    if (limit > 0 && existing.length >= limit) {
      return json({ error: `Page limit reached (${limit}). Upgrade your plan for more.` }, 403)
    }
  }

  if (sheet === 'blog_posts') {
    const existing = await getSheetData('blog_posts')
    const limit = getPlanLimit(auth.plan, 'blogPosts')
    if (limit > 0 && existing.length >= limit) {
      return json({ error: `Blog post limit reached (${limit}). Upgrade your plan for more.` }, 403)
    }
  }

  if (sheet === 'contacts') {
    const existing = await getSheetData('contacts')
    const limit = getPlanLimit(auth.plan, 'contacts')
    if (limit > 0 && existing.length >= limit) {
      return json({ error: `Contact limit reached (${limit}). Upgrade your plan for more.` }, 403)
    }
  }

  try {
    if (sheet === 'site_config' && data.key) {
      await upsertSiteConfigKey(data.key, data.value || '')
    } else {
      await appendSheetRow(sheet, data)
    }
    return json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}

/**
 * PUT /api/cms/content
 */
export async function PUT(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  const { sheet, rowIndex, data } = await req.json()
  if (!sheet || !VALID_SHEETS.includes(sheet)) {
    return json({ error: 'Invalid sheet' }, 400)
  }
  if (typeof rowIndex !== 'number') {
    return json({ error: 'rowIndex required' }, 400)
  }

  try {
    await updateSheetRow(sheet, rowIndex, data)
    return json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}

/**
 * DELETE /api/cms/content?sheet=pages&rowIndex=0
 */
export async function DELETE(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  const sheet = req.nextUrl.searchParams.get('sheet') as SheetName | null
  const rowIndex = parseInt(req.nextUrl.searchParams.get('rowIndex') || '', 10)

  if (!sheet || !VALID_SHEETS.includes(sheet)) {
    return json({ error: 'Invalid sheet' }, 400)
  }
  if (isNaN(rowIndex)) {
    return json({ error: 'rowIndex required' }, 400)
  }

  try {
    await deleteSheetRow(sheet, rowIndex)
    return json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}
