/**
 * Base AgentRunner — Shared scan/assess/execute/learn loop.
 * All 6 agents extend this class.
 */

import type {
  ScanReport, ScanFinding, AgentAction, LearningRecord,
  TrustLevel, AgentConfig, Row,
} from '../core/types'
import { TRUST_LEVELS, TRUST_PROMOTIONS } from '../core/types'

export interface AgentContext {
  agentId: string
  layerId: string
  config: AgentConfig
  currentTrust: TrustLevel
  learningRecords: LearningRecord[]
}

export abstract class AgentRunner {
  protected ctx: AgentContext

  constructor(ctx: AgentContext) {
    this.ctx = ctx
  }

  /** Phase 1: SCAN — Collect metrics and state */
  abstract scan(): Promise<ScanReport>

  /** Phase 2: ASSESS — Analyze findings and generate actions */
  abstract assess(report: ScanReport): AgentAction[]

  /** Phase 3: EXECUTE — Run approved actions */
  abstract execute(action: AgentAction): Promise<{ success: boolean; result: string }>

  /** Phase 4: LEARN — Record outcomes and update confidence */
  abstract learn(action: AgentAction, result: { success: boolean; result: string }): LearningRecord

  /** Full cycle: scan → assess → execute → learn */
  async runCycle(): Promise<{
    report: ScanReport
    actions: AgentAction[]
    executed: { action: AgentAction; result: { success: boolean; result: string }; learning: LearningRecord }[]
    skipped: AgentAction[]
  }> {
    // Phase 1: Scan
    const report = await this.scan()

    // Phase 2: Assess
    const allActions = this.assess(report)

    // Limit actions per cycle
    const capped = allActions.slice(0, this.ctx.config.maxActionsPerCycle)

    const executed: { action: AgentAction; result: { success: boolean; result: string }; learning: LearningRecord }[] = []
    const skipped: AgentAction[] = []

    for (const action of capped) {
      // Check trust level
      if (this.canAutoExecute(action)) {
        const result = await this.execute(action)
        const learning = this.learn(action, result)
        action.status = result.success ? 'executed' : 'failed'
        action.executedAt = new Date().toISOString()
        action.result = result.result
        executed.push({ action, result, learning })
      } else {
        action.status = 'pending'
        skipped.push(action)
      }
    }

    return { report, actions: capped, executed, skipped }
  }

  /** Check if the current trust level allows auto-execution */
  canAutoExecute(action: AgentAction): boolean {
    const currentIdx = TRUST_LEVELS.indexOf(this.ctx.currentTrust)
    const requiredIdx = TRUST_LEVELS.indexOf(action.trustRequired)
    return currentIdx >= requiredIdx
  }

  /** Check if the agent should be promoted */
  shouldPromote(): { promote: boolean; to?: TrustLevel; reason?: string } {
    const currentIdx = TRUST_LEVELS.indexOf(this.ctx.currentTrust)
    if (currentIdx >= TRUST_LEVELS.length - 1) {
      return { promote: false }
    }

    const nextLevel = TRUST_LEVELS[currentIdx + 1]
    const promotion = TRUST_PROMOTIONS.find(
      p => p.from === this.ctx.currentTrust && p.to === nextLevel
    )

    if (!promotion) return { promote: false }

    // Count qualifying records
    const qualifyingRecords = this.ctx.learningRecords.filter(r => {
      if (r.outcome !== 'positive') return false
      if (r.trust_level !== this.ctx.currentTrust) return false
      return true
    })

    if (qualifyingRecords.length >= promotion.threshold) {
      return { promote: true, to: nextLevel, reason: `${qualifyingRecords.length} successful actions at ${this.ctx.currentTrust} level` }
    }

    return { promote: false }
  }

  /** Check if the agent should be demoted */
  shouldDemote(): { demote: boolean; to?: TrustLevel; reason?: string } {
    const currentIdx = TRUST_LEVELS.indexOf(this.ctx.currentTrust)
    if (currentIdx <= 0) return { demote: false }

    const recentRecords = this.ctx.learningRecords.slice(-5)

    // Demotion: any action worsens metric by >10%
    const badAction = recentRecords.find(r => {
      const delta = parseFloat(r.delta_pct)
      return delta < -10
    })

    if (badAction) {
      return {
        demote: true,
        to: TRUST_LEVELS[currentIdx - 1],
        reason: `Action worsened metric by ${badAction.delta_pct}%`,
      }
    }

    // Demotion: 3 consecutive neutral actions
    const lastThree = recentRecords.slice(-3)
    if (lastThree.length >= 3 && lastThree.every(r => r.outcome === 'neutral')) {
      return {
        demote: true,
        to: TRUST_LEVELS[currentIdx - 1],
        reason: '3 consecutive neutral actions — requesting human review',
      }
    }

    return { demote: false }
  }
}
