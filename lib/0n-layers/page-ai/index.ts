/**
 * Layer 2: PAGE AI — Barrel export.
 * Page content CRUD, AI generation, SEO metadata, conversion optimization.
 */

// Generator
export { generatePageContent, generateSEO, improvePageContent } from './generator'
export type { SEOSuggestions } from './generator'

// Analytics
export { getPageMetrics, calculatePageHealth } from './analytics'
export type { PageMetrics } from './analytics'

// Optimizer
export { generateVariantIds, selectWinner, variantToRow } from './optimizer'
export type { PageVariant } from './optimizer'

// Agent
export { scanPages, createLearningRecord } from './agent'

// Manifest
export { manifest } from './manifest'
