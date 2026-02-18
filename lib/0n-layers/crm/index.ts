/**
 * Layer 4: CRM — Barrel export.
 * Contact/lead management, pipeline tracking, CRM sync, lead scoring.
 */

// Client
export { upsertContact, addTags, syncRegistration } from './client'
export type { CRMContact } from './client'

// Sync
export { syncSheetsToCRM, syncCRMToSheets } from './sync'

// Lead Scorer
export { scoreLead, detectStalledLeads } from './lead-scorer'
export type { LeadScore } from './lead-scorer'

// Agent
export { scanCRM, createCRMLearningRecord } from './agent'

// Manifest
export { manifest } from './manifest'
