/**
 * Layer 6: ORCHESTRATOR — Route dispatcher.
 * Delegates requests by ?sheet= param to the owning layer.
 */

import { LAYER_IDS } from '../core/constants'

/** Map sheet names to their owning layer */
const SHEET_OWNER: Record<string, string> = {
  // Page AI
  pages: LAYER_IDS.PAGE_AI,
  navigation: LAYER_IDS.PAGE_AI,
  page_experiments: LAYER_IDS.PAGE_AI,
  page_ai_learnings: LAYER_IDS.PAGE_AI,

  // Blog AI
  blog_posts: LAYER_IDS.BLOG_AI,
  content_calendar: LAYER_IDS.BLOG_AI,
  blog_ai_learnings: LAYER_IDS.BLOG_AI,

  // CRM
  contacts: LAYER_IDS.CRM,
  leads: LAYER_IDS.CRM,
  pipeline: LAYER_IDS.CRM,
  activities: LAYER_IDS.CRM,
  tags: LAYER_IDS.CRM,
  crm_ai_learnings: LAYER_IDS.CRM,

  // Compliance
  compliance_ai_learnings: LAYER_IDS.COMPLIANCE,

  // Orchestrator
  site_config: LAYER_IDS.ORCHESTRATOR,
  media_log: LAYER_IDS.ORCHESTRATOR,
  '0n_events': LAYER_IDS.ORCHESTRATOR,
  orchestrator_learnings: LAYER_IDS.ORCHESTRATOR,
}

/** Get the owning layer for a sheet name */
export function getSheetOwner(sheetName: string): string | undefined {
  return SHEET_OWNER[sheetName]
}

/** Check if a sheet is accessible to the given installed layers */
export function isSheetAccessible(sheetName: string, installedLayerIds: string[]): boolean {
  const owner = SHEET_OWNER[sheetName]
  if (!owner) return false
  return installedLayerIds.includes(owner)
}

/** Get all sheets accessible to the given installed layers */
export function getAccessibleSheets(installedLayerIds: string[]): string[] {
  return Object.entries(SHEET_OWNER)
    .filter(([, owner]) => installedLayerIds.includes(owner))
    .map(([sheet]) => sheet)
}

/** Map generate type to owning layer */
const GENERATE_OWNER: Record<string, string> = {
  page: LAYER_IDS.PAGE_AI,
  seo: LAYER_IDS.PAGE_AI,
  blog: LAYER_IDS.BLOG_AI,
}

/** Get the owning layer for a generate type */
export function getGenerateOwner(type: string): string | undefined {
  return GENERATE_OWNER[type]
}
