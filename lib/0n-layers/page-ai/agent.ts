/**
 * Layer 2: PAGE AI — Page Conversion Agent.
 * Optimizes pages for bounce rate, time on page, CTA clicks, conversion rate.
 */

import type { ScanReport, ScanFinding, LearningRecord } from '../core/types'
import { AGENT_IDS } from '../core/constants'
import { getPageMetrics, calculatePageHealth } from './analytics'

const THRESHOLDS = {
  bounceRate: 0.6,
  avgTimeOnPage: 30,
  ctaClickRate: 0.03,
  conversionRate: 0.02,
}

/**
 * Scan all pages for conversion health.
 */
export async function scanPages(
  pageSlugs: string[]
): Promise<ScanReport> {
  const findings: ScanFinding[] = []

  for (const slug of pageSlugs) {
    const metrics = await getPageMetrics(slug)
    if (!metrics) {
      findings.push({
        severity: 'info',
        message: `No analytics data for page "${slug}"`,
      })
      continue
    }

    const health = calculatePageHealth(metrics)

    if (metrics.bounceRate > THRESHOLDS.bounceRate) {
      findings.push({
        severity: 'warning',
        message: `Page "${slug}" bounce rate ${(metrics.bounceRate * 100).toFixed(1)}% exceeds threshold ${THRESHOLDS.bounceRate * 100}%`,
        metric: 'bounce_rate',
        currentValue: metrics.bounceRate,
        threshold: THRESHOLDS.bounceRate,
        suggestedAction: 'Generate headline variants for A/B testing',
      })
    }

    if (metrics.avgTimeOnPage < THRESHOLDS.avgTimeOnPage) {
      findings.push({
        severity: 'warning',
        message: `Page "${slug}" avg time ${metrics.avgTimeOnPage}s below threshold ${THRESHOLDS.avgTimeOnPage}s`,
        metric: 'avg_time_on_page',
        currentValue: metrics.avgTimeOnPage,
        threshold: THRESHOLDS.avgTimeOnPage,
        suggestedAction: 'Improve content depth and engagement',
      })
    }

    if (metrics.ctaClickRate < THRESHOLDS.ctaClickRate) {
      findings.push({
        severity: 'warning',
        message: `Page "${slug}" CTA click rate ${(metrics.ctaClickRate * 100).toFixed(1)}% below threshold ${THRESHOLDS.ctaClickRate * 100}%`,
        metric: 'cta_click_rate',
        currentValue: metrics.ctaClickRate,
        threshold: THRESHOLDS.ctaClickRate,
        suggestedAction: 'Test alternative CTA copy and placement',
      })
    }

    if (health < 50) {
      findings.push({
        severity: 'critical',
        message: `Page "${slug}" health score ${health}/100 — needs immediate attention`,
      })
    }
  }

  const overallHealth = findings.some(f => f.severity === 'critical')
    ? 'critical'
    : findings.some(f => f.severity === 'warning')
      ? 'warning'
      : 'healthy'

  return {
    agentId: AGENT_IDS.PAGE_CONVERSION,
    layerId: '0n-layer-page-ai',
    timestamp: new Date().toISOString(),
    findings,
    overallHealth,
  }
}

/**
 * Create a learning record from an action result.
 */
export function createLearningRecord(params: {
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
    id: `pal-${Date.now()}`,
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
