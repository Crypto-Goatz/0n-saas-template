/**
 * Layer 4: CRM — Bi-directional sync between Sheets and CRM.
 */

import { CRM_BASE_URL, CRM_API_VERSION } from '../core/constants'
import { CRM_FIELD_MAP } from '../core/schema'
import { getSheetData } from '../google-backend/sheets'
import type { Row } from '../core/types'

/**
 * Sync contacts from Sheets to CRM.
 */
export async function syncSheetsToCRM(params: {
  pit: string
  locationId: string
}): Promise<{ synced: number; errors: { email: string; error: string }[] }> {
  const headers = {
    Authorization: `Bearer ${params.pit}`,
    Version: CRM_API_VERSION,
    'Content-Type': 'application/json',
  }

  const contacts = await getSheetData('contacts')
  let synced = 0
  const errors: { email: string; error: string }[] = []

  for (const contact of contacts) {
    if (!contact.email) continue

    const crmPayload: Record<string, unknown> = { locationId: params.locationId }
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
        errors.push({ email: contact.email, error: await res.text() })
      }
    } catch (err) {
      errors.push({
        email: contact.email,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return { synced, errors }
}

/**
 * Sync contacts from CRM to Sheets format.
 */
export async function syncCRMToSheets(params: {
  pit: string
  locationId: string
}): Promise<{ contacts: Row[]; count: number }> {
  const headers = {
    Authorization: `Bearer ${params.pit}`,
    Version: CRM_API_VERSION,
    'Content-Type': 'application/json',
  }

  const res = await fetch(
    `${CRM_BASE_URL}/contacts/?locationId=${params.locationId}&limit=100`,
    { headers }
  )

  if (!res.ok) {
    throw new Error(`CRM API error: ${res.status}`)
  }

  const data = await res.json()
  const crmContacts = data.contacts || []

  const mapped = crmContacts.map((c: Record<string, unknown>, i: number) => ({
    id: String(i + 1),
    first_name: (c.firstName as string) || '',
    last_name: (c.lastName as string) || '',
    email: (c.email as string) || '',
    phone: (c.phone as string) || '',
    company: (c.companyName as string) || '',
    tags: Array.isArray(c.tags) ? c.tags.join(',') : '',
    source: (c.source as string) || 'crm_sync',
    created_at: (c.dateAdded as string) || new Date().toISOString(),
  }))

  return { contacts: mapped, count: mapped.length }
}
