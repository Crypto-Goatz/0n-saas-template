/**
 * Layer 0: CORE — Shared constants across all layers.
 */

// -- Consent Modes --

export const CONSENT_MODES = ['gdpr', 'ccpa', 'essential', 'disabled'] as const
export type ConsentMode = (typeof CONSENT_MODES)[number]

// -- Event Types --

export const ESSENTIAL_EVENTS = [
  'page_view',
  'web_vital',
  'performance',
  'js_error',
  'promise_rejection',
] as const

export const CONSENT_REQUIRED_EVENTS = [
  'click',
  'scroll_depth',
  'form_view',
  'form_start',
  'form_complete',
  'form_abandon',
  'exit_intent',
  'engagement_summary',
  'attribution',
  'identify',
  'custom',
] as const

// -- Layer IDs --

export const LAYER_IDS = {
  CORE: '0n-layer-core',
  GOOGLE_BACKEND: '0n-layer-google-backend',
  PAGE_AI: '0n-layer-page-ai',
  BLOG_AI: '0n-layer-blog-ai',
  CRM: '0n-layer-crm',
  COMPLIANCE: '0n-layer-compliance',
  ORCHESTRATOR: '0n-layer-orchestrator',
} as const

// -- Agent IDs --

export const AGENT_IDS = {
  HEALTH_MONITOR: 'health-monitor-agent',
  PAGE_CONVERSION: 'page-conversion-agent',
  BLOG_TRAFFIC: 'blog-traffic-agent',
  CRM_INTELLIGENCE: 'crm-intelligence-agent',
  COMPLIANCE_AUDIT: 'compliance-audit-agent',
  META_ORCHESTRATOR: 'meta-orchestrator-agent',
} as const

// -- CRM API --

export const CRM_BASE_URL = 'https://services.leadconnectorhq.com'
export const CRM_API_VERSION = '2021-07-28'
