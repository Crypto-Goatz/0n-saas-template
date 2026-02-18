/**
 * Progressive Trust System — Manages agent trust levels.
 *
 * Level 0: Observe Only   — agent scans + learns, no recommendations
 * Level 1: Recommend      — surfaces suggestions, human approves
 * Level 2: Auto-Low       — auto-execute meta desc, internal links, tags
 * Level 3: Auto-Medium    — auto-execute content refreshes, lead scoring, consent switches
 * Level 4: Auto-Full      — auto-execute new content, page rewrites (requires explicit unlock)
 */

import type { TrustLevel, LearningRecord } from '../core/types'
import { TRUST_LEVELS, TRUST_PROMOTIONS } from '../core/types'

export interface TrustState {
  agentId: string
  level: TrustLevel
  promotionHistory: { from: TrustLevel; to: TrustLevel; date: string; reason: string }[]
  successCount: number
  failureCount: number
  neutralCount: number
  lastEvaluated: string
}

/**
 * Create initial trust state for a new agent.
 */
export function createTrustState(agentId: string): TrustState {
  return {
    agentId,
    level: 'observe',
    promotionHistory: [],
    successCount: 0,
    failureCount: 0,
    neutralCount: 0,
    lastEvaluated: new Date().toISOString(),
  }
}

/**
 * Evaluate trust level based on learning records.
 */
export function evaluateTrust(
  state: TrustState,
  records: LearningRecord[]
): { newState: TrustState; changed: boolean; message?: string } {
  const newState = { ...state, lastEvaluated: new Date().toISOString() }

  // Count outcomes
  const successCount = records.filter(r => r.outcome === 'positive').length
  const failureCount = records.filter(r => r.outcome === 'negative').length
  const neutralCount = records.filter(r => r.outcome === 'neutral').length

  newState.successCount = successCount
  newState.failureCount = failureCount
  newState.neutralCount = neutralCount

  // Check demotion first (more urgent)
  const recentRecords = records.slice(-5)
  const badAction = recentRecords.find(r => parseFloat(r.delta_pct) < -10)
  if (badAction) {
    const currentIdx = TRUST_LEVELS.indexOf(newState.level)
    if (currentIdx > 0) {
      const prevLevel = newState.level
      newState.level = TRUST_LEVELS[currentIdx - 1]
      newState.promotionHistory.push({
        from: prevLevel,
        to: newState.level,
        date: new Date().toISOString(),
        reason: `Demotion: action worsened metric by ${badAction.delta_pct}%`,
      })
      return { newState, changed: true, message: `Demoted from ${prevLevel} to ${newState.level}` }
    }
  }

  // Check promotion
  const currentIdx = TRUST_LEVELS.indexOf(newState.level)
  if (currentIdx < TRUST_LEVELS.length - 1) {
    const nextLevel = TRUST_LEVELS[currentIdx + 1]
    const promotion = TRUST_PROMOTIONS.find(p => p.from === newState.level && p.to === nextLevel)

    if (promotion) {
      const atCurrentLevel = records.filter(
        r => r.trust_level === newState.level && r.outcome === 'positive'
      )

      if (atCurrentLevel.length >= promotion.threshold) {
        const prevLevel = newState.level
        newState.level = nextLevel
        newState.promotionHistory.push({
          from: prevLevel,
          to: nextLevel,
          date: new Date().toISOString(),
          reason: `Promotion: ${atCurrentLevel.length} successful actions (threshold: ${promotion.threshold})`,
        })
        return { newState, changed: true, message: `Promoted from ${prevLevel} to ${nextLevel}` }
      }
    }
  }

  return { newState, changed: false }
}

/**
 * Get human-readable trust level description.
 */
export function describeTrustLevel(level: TrustLevel): { label: string; description: string } {
  switch (level) {
    case 'observe':
      return { label: 'Observe Only', description: 'Agent scans and learns. No recommendations yet.' }
    case 'recommend':
      return { label: 'Recommend', description: 'Agent surfaces suggestions. Human approves all actions.' }
    case 'auto-low':
      return { label: 'Auto (Low Risk)', description: 'Auto-executes: meta descriptions, internal links, tags.' }
    case 'auto-medium':
      return { label: 'Auto (Medium Risk)', description: 'Auto-executes: content refreshes, lead scoring, consent switches.' }
    case 'auto-full':
      return { label: 'Auto (Full)', description: 'Auto-executes: new content, page rewrites. Requires explicit unlock.' }
  }
}

/**
 * Get progress toward next trust level.
 */
export function getPromotionProgress(
  state: TrustState,
  records: LearningRecord[]
): { current: TrustLevel; next: TrustLevel | null; progress: number; threshold: number } {
  const currentIdx = TRUST_LEVELS.indexOf(state.level)
  if (currentIdx >= TRUST_LEVELS.length - 1) {
    return { current: state.level, next: null, progress: 0, threshold: 0 }
  }

  const nextLevel = TRUST_LEVELS[currentIdx + 1]
  const promotion = TRUST_PROMOTIONS.find(p => p.from === state.level && p.to === nextLevel)

  if (!promotion) {
    return { current: state.level, next: nextLevel, progress: 0, threshold: 0 }
  }

  const qualifyingCount = records.filter(
    r => r.trust_level === state.level && r.outcome === 'positive'
  ).length

  return {
    current: state.level,
    next: nextLevel,
    progress: qualifyingCount,
    threshold: promotion.threshold,
  }
}
