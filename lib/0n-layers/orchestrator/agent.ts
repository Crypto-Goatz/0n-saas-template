/**
 * Layer 6: ORCHESTRATOR — Meta-Orchestrator Agent.
 * Coordinates all sub-agents, resolves cross-layer priorities.
 */

import type { ScanReport, ScanFinding, LearningRecord } from '../core/types'
import { AGENT_IDS } from '../core/constants'
import { detectCrossLayerIssues } from './health'

/**
 * Run meta-orchestrator scan across all sub-agent reports.
 */
export function metaScan(subReports: ScanReport[]): ScanReport {
  const findings: ScanFinding[] = []

  // Aggregate sub-agent health
  const criticalLayers = subReports.filter(r => r.overallHealth === 'critical')
  const warningLayers = subReports.filter(r => r.overallHealth === 'warning')

  if (criticalLayers.length > 0) {
    findings.push({
      severity: 'critical',
      message: `${criticalLayers.length} layer(s) in critical state: ${criticalLayers.map(r => r.layerId).join(', ')}`,
      suggestedAction: 'Prioritize critical layer fixes before other optimizations',
    })
  }

  if (warningLayers.length > 0) {
    findings.push({
      severity: 'warning',
      message: `${warningLayers.length} layer(s) with warnings: ${warningLayers.map(r => r.layerId).join(', ')}`,
    })
  }

  // Cross-layer analysis
  const crossIssues = detectCrossLayerIssues(subReports)
  for (const issue of crossIssues) {
    findings.push({
      severity: 'warning',
      message: issue,
      suggestedAction: 'Coordinate cross-layer action',
    })
  }

  // Total findings across all sub-agents
  const totalFindings = subReports.reduce((sum, r) => sum + r.findings.length, 0)
  findings.push({
    severity: 'info',
    message: `Total findings across all agents: ${totalFindings}`,
  })

  const overallHealth = criticalLayers.length > 0
    ? 'critical'
    : warningLayers.length > 0
      ? 'warning'
      : 'healthy'

  return {
    agentId: AGENT_IDS.META_ORCHESTRATOR,
    layerId: '0n-layer-orchestrator',
    timestamp: new Date().toISOString(),
    findings,
    overallHealth,
  }
}

/**
 * Create an orchestrator learning record.
 */
export function createOrchestratorLearningRecord(params: {
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
    id: `orl-${Date.now()}`,
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
