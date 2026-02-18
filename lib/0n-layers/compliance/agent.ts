/**
 * Layer 5: COMPLIANCE — Compliance Audit Agent.
 * Monitors consent rates, policy freshness, visitor geography.
 */

import type { ScanReport, ScanFinding, LearningRecord } from '../core/types'
import { AGENT_IDS } from '../core/constants'

export interface ComplianceMetrics {
  consentRate: number // 0-1
  optOutRate: number
  bannerDismissRate: number
  policyAgeDays: number
  geoDistribution: Record<string, number> // region → visitor count
}

/**
 * Scan compliance health.
 */
export function scanCompliance(metrics: ComplianceMetrics): ScanReport {
  const findings: ScanFinding[] = []

  if (metrics.consentRate < 0.35) {
    findings.push({
      severity: 'warning',
      message: `Consent rate ${(metrics.consentRate * 100).toFixed(1)}% is below average (35%)`,
      metric: 'consent_rate',
      currentValue: metrics.consentRate,
      threshold: 0.35,
      suggestedAction: 'Improve banner copy and placement',
    })
  }

  if (metrics.bannerDismissRate > 0.25) {
    findings.push({
      severity: 'warning',
      message: `Banner dismiss rate ${(metrics.bannerDismissRate * 100).toFixed(1)}% indicates fatigue`,
      metric: 'banner_dismiss_rate',
      currentValue: metrics.bannerDismissRate,
      threshold: 0.25,
      suggestedAction: 'Redesign banner or reduce intrusiveness',
    })
  }

  if (metrics.policyAgeDays > 90) {
    findings.push({
      severity: metrics.policyAgeDays > 365 ? 'critical' : 'warning',
      message: `Privacy policy is ${metrics.policyAgeDays} days old`,
      metric: 'policy_age',
      currentValue: metrics.policyAgeDays,
      threshold: 90,
      suggestedAction: 'Regenerate privacy policy with current business info',
    })
  }

  const overallHealth = findings.some(f => f.severity === 'critical')
    ? 'critical'
    : findings.some(f => f.severity === 'warning')
      ? 'warning'
      : 'healthy'

  return {
    agentId: AGENT_IDS.COMPLIANCE_AUDIT,
    layerId: '0n-layer-compliance',
    timestamp: new Date().toISOString(),
    findings,
    overallHealth,
  }
}

/**
 * Create a compliance learning record.
 */
export function createComplianceLearningRecord(params: {
  target: string
  metric: string
  valueBefore: number
  valueAfter: number
  actionType: string
  actionDetail: string
  daysMeasured: number
  trustLevel: string
}): LearningRecord {
  const delta = params.valueBefore !== 0
    ? ((params.valueAfter - params.valueBefore) / params.valueBefore) * 100
    : 0

  return {
    id: `cml-${Date.now()}`,
    cycle_date: new Date().toISOString(),
    target: params.target,
    metric: params.metric,
    value_before: String(params.valueBefore),
    action_type: params.actionType,
    action_detail: params.actionDetail,
    value_after: String(params.valueAfter),
    delta_pct: delta.toFixed(2),
    days_measured: String(params.daysMeasured),
    confidence: String(Math.min(0.99, Math.abs(delta) / 50)),
    trust_level: params.trustLevel,
    outcome: delta > 2 ? 'positive' : delta < -2 ? 'negative' : 'neutral',
  }
}
