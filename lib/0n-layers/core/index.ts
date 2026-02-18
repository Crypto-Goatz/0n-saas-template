/**
 * Layer 0: CORE — Barrel export.
 * The vocabulary every layer speaks.
 */

// Schema
export { CMS_SCHEMA, CRM_FIELD_MAP, CMS_TABS } from './schema'
export type { SheetName } from './schema'

// Types
export type {
  PageRow, BlogPostRow, ContactRow, LeadRow,
  SidebarItem, AgentObjective, AgentConfig, LayerManifest,
  TrustLevel, TrustPromotion, LearningRecord,
  ScanReport, ScanFinding, AgentAction,
  InstallationResult, Row, WizardStepProps,
} from './types'
export { TRUST_LEVELS, TRUST_PROMOTIONS } from './types'

// Fallback Data
export { FALLBACK_DATA } from './fallback'

// Pricing
export { PLANS, PLAN_LIMITS, PRICE_TO_PLAN, getPlan, getPlanLimit, getYearlySavings, getYearlyMonthlyEquivalent } from './pricing'
export type { PlanId } from './pricing'

// Constants
export {
  CONSENT_MODES, ESSENTIAL_EVENTS, CONSENT_REQUIRED_EVENTS,
  LAYER_IDS, AGENT_IDS, CRM_BASE_URL, CRM_API_VERSION,
} from './constants'
export type { ConsentMode } from './constants'
