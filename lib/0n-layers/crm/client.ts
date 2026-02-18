/**
 * Layer 4: CRM — Contact management and CRM API client.
 */

import { CRM_BASE_URL, CRM_API_VERSION } from '../core/constants'

function getCredentials() {
  const apiKey = process.env.CRM_API_KEY
  const locationId = process.env.CRM_LOCATION_ID
  return { apiKey, locationId }
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Version: CRM_API_VERSION,
  }
}

export interface CRMContact {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

export async function upsertContact(params: {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  tags?: string[]
  source?: string
}): Promise<CRMContact | null> {
  const { apiKey, locationId } = getCredentials()
  if (!apiKey || !locationId) {
    console.log('[CRM] Not configured, skipping contact sync')
    return null
  }

  try {
    const res = await fetch(`${CRM_BASE_URL}/contacts/upsert`, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({
        locationId,
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone,
        tags: params.tags || [],
        source: params.source || 'website',
      }),
    })

    if (!res.ok) {
      console.error('[CRM] Upsert error:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    return data.contact || null
  } catch (err) {
    console.error('[CRM] Upsert exception:', err)
    return null
  }
}

export async function addTags(contactId: string, tags: string[]): Promise<void> {
  const { apiKey } = getCredentials()
  if (!apiKey) return

  try {
    await fetch(`${CRM_BASE_URL}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: headers(apiKey),
      body: JSON.stringify({ tags }),
    })
  } catch (err) {
    console.error('[CRM] Add tags error:', err)
  }
}

export async function syncRegistration(data: {
  email: string
  name?: string
  source?: string
}): Promise<CRMContact | null> {
  const [firstName, ...rest] = (data.name || '').split(' ')

  return upsertContact({
    email: data.email,
    firstName: firstName || undefined,
    lastName: rest.join(' ') || undefined,
    tags: ['registered', data.source || 'website'],
    source: data.source || 'website',
  })
}
