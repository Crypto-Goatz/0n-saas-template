/**
 * Layer 3: BLOG AI — Blog Traffic Agent.
 * Optimizes for impressions, clicks, avg position, keyword coverage.
 */

import type { ScanReport, ScanFinding, LearningRecord } from '../core/types'
import { AGENT_IDS } from '../core/constants'
import { detectDecay } from './optimizer'

/**
 * Scan blog posts for traffic health.
 */
export async function scanBlogPosts(params: {
  posts: { id: string; slug: string; publishedAt: string; updatedAt?: string }[]
  getPositionData?: (slug: string) => Promise<{ before: number; after: number; impressionsBefore: number; impressionsAfter: number } | null>
}): Promise<ScanReport> {
  const findings: ScanFinding[] = []

  for (const post of params.posts) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(post.updatedAt || post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Check content age
    if (daysSinceUpdate > 90) {
      findings.push({
        severity: daysSinceUpdate > 180 ? 'warning' : 'info',
        message: `Post "${post.slug}" is ${daysSinceUpdate} days old without refresh`,
        metric: 'content_age',
        currentValue: daysSinceUpdate,
        threshold: 90,
        suggestedAction: 'Schedule content refresh',
      })
    }

    // Check position data if available
    if (params.getPositionData) {
      const data = await params.getPositionData(post.slug)
      if (data) {
        const decay = detectDecay({
          postId: post.id,
          slug: post.slug,
          positionBefore: data.before,
          positionAfter: data.after,
          impressionsBefore: data.impressionsBefore,
          impressionsAfter: data.impressionsAfter,
          daysSinceUpdate,
        })

        if (decay) {
          findings.push({
            severity: decay.severity === 'high' ? 'critical' : 'warning',
            message: `Post "${post.slug}" dropped ${decay.positionDrop} positions (${decay.suggestedAction} recommended)`,
            metric: 'position_change',
            currentValue: data.after,
            threshold: data.before,
            suggestedAction: decay.suggestedAction,
          })
        }
      }
    }
  }

  const overallHealth = findings.some(f => f.severity === 'critical')
    ? 'critical'
    : findings.some(f => f.severity === 'warning')
      ? 'warning'
      : 'healthy'

  return {
    agentId: AGENT_IDS.BLOG_TRAFFIC,
    layerId: '0n-layer-blog-ai',
    timestamp: new Date().toISOString(),
    findings,
    overallHealth,
  }
}

/**
 * Create a learning record from a blog action result.
 */
export function createBlogLearningRecord(params: {
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
    id: `bal-${Date.now()}`,
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
