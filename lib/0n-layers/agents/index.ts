/**
 * Shared Agent Infrastructure — Barrel export.
 */

// Base Runner
export { AgentRunner } from './runner'
export type { AgentContext } from './runner'

// Trust System
export {
  createTrustState, evaluateTrust,
  describeTrustLevel, getPromotionProgress,
} from './trust'
export type { TrustState } from './trust'
