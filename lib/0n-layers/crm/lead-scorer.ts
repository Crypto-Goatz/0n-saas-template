/**
 * Layer 4: CRM — AI-powered lead scoring.
 */

import type { Row } from '../core/types'

export interface LeadScore {
  contactId: string
  score: number // 0-100
  factors: { factor: string; weight: number; value: number }[]
  tier: 'hot' | 'warm' | 'cold'
}

/**
 * Score a lead based on engagement signals.
 */
export function scoreLead(params: {
  contact: Row
  activities: Row[]
  daysSinceCreation: number
  pipelineStage: string
  pageViews?: number
  formSubmissions?: number
}): LeadScore {
  const factors: { factor: string; weight: number; value: number }[] = []
  let total = 0

  // Email provided (basic qualification)
  if (params.contact.email) {
    factors.push({ factor: 'has_email', weight: 10, value: 10 })
    total += 10
  }

  // Phone provided
  if (params.contact.phone) {
    factors.push({ factor: 'has_phone', weight: 5, value: 5 })
    total += 5
  }

  // Company provided
  if (params.contact.company) {
    factors.push({ factor: 'has_company', weight: 5, value: 5 })
    total += 5
  }

  // Activity count
  const activityScore = Math.min(30, params.activities.length * 5)
  factors.push({ factor: 'activity_count', weight: 30, value: activityScore })
  total += activityScore

  // Pipeline stage
  const stageScores: Record<string, number> = {
    new: 5, contacted: 10, qualified: 20, proposal: 30, won: 0, lost: 0,
  }
  const stageScore = stageScores[params.pipelineStage.toLowerCase()] || 5
  factors.push({ factor: 'pipeline_stage', weight: 30, value: stageScore })
  total += stageScore

  // Recency (newer leads score higher)
  const recencyScore = params.daysSinceCreation < 7 ? 15
    : params.daysSinceCreation < 30 ? 10
      : params.daysSinceCreation < 90 ? 5 : 0
  factors.push({ factor: 'recency', weight: 15, value: recencyScore })
  total += recencyScore

  // Page views
  if (params.pageViews) {
    const pvScore = Math.min(5, params.pageViews)
    factors.push({ factor: 'page_views', weight: 5, value: pvScore })
    total += pvScore
  }

  const score = Math.min(100, total)
  const tier = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'

  return { contactId: params.contact.id, score, factors, tier }
}

/**
 * Detect stalled leads (stuck in a stage too long).
 */
export function detectStalledLeads(
  leads: Row[],
  maxDaysPerStage: Record<string, number>
): { leadId: string; stage: string; daysSinceUpdate: number; maxDays: number }[] {
  const stalled: { leadId: string; stage: string; daysSinceUpdate: number; maxDays: number }[] = []

  for (const lead of leads) {
    if (lead.stage === 'won' || lead.stage === 'lost') continue

    const updatedAt = new Date(lead.updated_at || lead.created_at)
    const daysSinceUpdate = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    const maxDays = maxDaysPerStage[lead.stage] || 14

    if (daysSinceUpdate > maxDays) {
      stalled.push({
        leadId: lead.id,
        stage: lead.stage,
        daysSinceUpdate,
        maxDays,
      })
    }
  }

  return stalled
}
