/**
 * Layer 4: CRM — CRM Intelligence Agent.
 * Lead scoring, stall detection, pipeline optimization.
 */

import type { ScanReport, ScanFinding, LearningRecord } from '../core/types'
import { AGENT_IDS } from '../core/constants'
import { detectStalledLeads } from './lead-scorer'
import type { Row } from '../core/types'

const DEFAULT_MAX_DAYS: Record<string, number> = {
  new: 3,
  contacted: 7,
  qualified: 14,
  proposal: 10,
}

/**
 * Scan CRM for pipeline health and lead issues.
 */
export async function scanCRM(params: {
  leads: Row[]
  contacts: Row[]
  activities: Row[]
}): Promise<ScanReport> {
  const findings: ScanFinding[] = []

  // Check for stalled leads
  const stalled = detectStalledLeads(params.leads, DEFAULT_MAX_DAYS)
  for (const s of stalled) {
    findings.push({
      severity: s.daysSinceUpdate > s.maxDays * 2 ? 'critical' : 'warning',
      message: `Lead ${s.leadId} stalled in "${s.stage}" for ${s.daysSinceUpdate} days (max ${s.maxDays})`,
      metric: 'days_in_stage',
      currentValue: s.daysSinceUpdate,
      threshold: s.maxDays,
      suggestedAction: 'Tag for follow-up or escalate',
    })
  }

  // Check for contacts without leads
  const contactsWithLeads = new Set(params.leads.map(l => l.contact_id))
  const orphanContacts = params.contacts.filter(c => !contactsWithLeads.has(c.id))
  if (orphanContacts.length > 0) {
    findings.push({
      severity: 'info',
      message: `${orphanContacts.length} contacts without pipeline leads`,
      suggestedAction: 'Create leads for engaged contacts',
    })
  }

  // Check for leads without recent activity
  const recentActivity = new Set(
    params.activities
      .filter(a => {
        const d = new Date(a.created_at)
        return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000
      })
      .map(a => a.contact_id)
  )
  const inactiveLeads = params.leads.filter(
    l => l.stage !== 'won' && l.stage !== 'lost' && !recentActivity.has(l.contact_id)
  )
  if (inactiveLeads.length > 0) {
    findings.push({
      severity: 'warning',
      message: `${inactiveLeads.length} active leads with no activity in 7 days`,
      suggestedAction: 'Schedule follow-up tasks',
    })
  }

  const overallHealth = findings.some(f => f.severity === 'critical')
    ? 'critical'
    : findings.some(f => f.severity === 'warning')
      ? 'warning'
      : 'healthy'

  return {
    agentId: AGENT_IDS.CRM_INTELLIGENCE,
    layerId: '0n-layer-crm',
    timestamp: new Date().toISOString(),
    findings,
    overallHealth,
  }
}

/**
 * Create a CRM learning record.
 */
export function createCRMLearningRecord(params: {
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
    id: `crl-${Date.now()}`,
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
