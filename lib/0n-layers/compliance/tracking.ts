/**
 * Layer 5: COMPLIANCE — Data sanitization, event classification, consent gating.
 */

import { ESSENTIAL_EVENTS } from '../core/constants'

/**
 * Sanitize event data to remove PII.
 */
export function sanitizeData(event: {
  type: string
  data: Record<string, unknown>
}): Record<string, unknown> {
  if (event.type === 'click') {
    const { text, href, ...rest } = event.data || {}
    return { ...rest, textLength: typeof text === 'string' ? text.length : 0 }
  }

  if (event.type.startsWith('form_') || event.type.startsWith('field_')) {
    const { formId, fieldId, ...rest } = event.data || {}
    return { ...rest, hasFormId: !!formId, hasFieldId: !!fieldId }
  }

  if (event.type === 'copy') {
    const { preview, ...rest } = event.data || {}
    return { ...rest, hadContent: !!preview }
  }

  if (event.type === 'attribution') {
    const { referrer, ...rest } = event.data || {}
    return { ...rest, hadReferrer: !!referrer }
  }

  return event.data || {}
}

/**
 * Classify an event as essential or consent-required.
 */
export function classifyEvent(type: string): 'essential' | 'consent-required' {
  return (ESSENTIAL_EVENTS as readonly string[]).includes(type) ? 'essential' : 'consent-required'
}

/**
 * Determine if an event should be tracked based on consent status.
 */
export function shouldTrack(
  eventType: string,
  consentStatus: 'pending' | 'granted' | 'denied' | 'essential-only'
): boolean {
  if ((ESSENTIAL_EVENTS as readonly string[]).includes(eventType)) return true
  return consentStatus === 'granted'
}
