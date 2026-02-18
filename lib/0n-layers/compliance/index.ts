/**
 * Layer 5: COMPLIANCE — Barrel export.
 * Cookie consent, privacy policies, data sanitization, consent-gated tracking.
 */

// Policies
export { generatePrivacyPolicy, generateCookiePolicy, generateTermsOfService } from './policies'

// Tracking
export { sanitizeData, classifyEvent, shouldTrack } from './tracking'

// Consent Provider
export { ConsentProvider, useConsent } from './consent-provider'
export type { ConsentCategory, ConsentStatus, ConsentMode } from './consent-provider'

// Cookie Banner
export { CookieBanner } from './cookie-banner'

// Agent
export { scanCompliance, createComplianceLearningRecord } from './agent'
export type { ComplianceMetrics } from './agent'

// Manifest
export { manifest } from './manifest'
