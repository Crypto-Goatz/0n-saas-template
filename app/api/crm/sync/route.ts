import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { getSheetData } from '@/lib/google/sheets'
import { CRM_FIELD_MAP } from '@/config/cms-schema'

const CRM_BASE_URL = 'https://services.leadconnectorhq.com'
const CRM_API_VERSION = '2021-07-28'

function json(data: object, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * POST /api/crm/sync
 * Sync contacts between Sheets CRM and RocketClients CRM
 */
export async function POST(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  try {
    const { direction, pit, locationId } = await req.json()

    if (!pit || !locationId) {
      return json({ error: 'CRM PIT and Location ID required' }, 400)
    }

    const headers = {
      Authorization: `Bearer ${pit}`,
      Version: CRM_API_VERSION,
      'Content-Type': 'application/json',
    }

    if (direction === 'sheets_to_crm') {
      const contacts = await getSheetData('contacts')
      let synced = 0
      const errors: { email: string; error: string }[] = []

      for (const contact of contacts) {
        if (!contact.email) continue

        const crmPayload: Record<string, unknown> = { locationId }
        for (const [sheetCol, crmField] of Object.entries(CRM_FIELD_MAP)) {
          if (contact[sheetCol]) {
            if (sheetCol === 'tags') {
              crmPayload[crmField] = contact[sheetCol].split(',').map((t: string) => t.trim())
            } else {
              crmPayload[crmField] = contact[sheetCol]
            }
          }
        }

        try {
          const res = await fetch(`${CRM_BASE_URL}/contacts/upsert`, {
            method: 'POST',
            headers,
            body: JSON.stringify(crmPayload),
          })

          if (res.ok) {
            synced++
          } else {
            const errText = await res.text()
            errors.push({ email: contact.email, error: errText })
          }
        } catch (err) {
          errors.push({
            email: contact.email,
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }

      return json({ direction, contacts_synced: synced, errors })
    }

    if (direction === 'crm_to_sheets') {
      // Fetch contacts from CRM
      const res = await fetch(`${CRM_BASE_URL}/contacts/?locationId=${locationId}&limit=100`, {
        headers,
      })

      if (!res.ok) {
        return json({ error: `CRM API error: ${res.status}` }, 500)
      }

      const data = await res.json()
      const crmContacts = data.contacts || []

      // Return contacts mapped to sheet format for client to write
      const mapped = crmContacts.map((c: Record<string, unknown>, i: number) => ({
        id: String(i + 1),
        first_name: c.firstName || '',
        last_name: c.lastName || '',
        email: c.email || '',
        phone: c.phone || '',
        company: c.companyName || '',
        tags: Array.isArray(c.tags) ? c.tags.join(',') : '',
        source: c.source || 'crm_sync',
        created_at: c.dateAdded || new Date().toISOString(),
      }))

      return json({ direction, contacts: mapped, count: mapped.length })
    }

    return json({ error: 'direction must be sheets_to_crm or crm_to_sheets' }, 400)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}
