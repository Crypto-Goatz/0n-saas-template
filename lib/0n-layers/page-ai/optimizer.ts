/**
 * Layer 2: PAGE AI — Variant generation and winner selection.
 * A/B testing for page elements (headlines, CTAs).
 */

import type { Row } from '../core/types'

export interface PageVariant {
  id: string
  pageId: string
  variant: 'A' | 'B' | 'C'
  headline: string
  cta: string
  startedAt: string
  endedAt?: string
  winner: boolean
}

/**
 * Generate headline variants for testing.
 */
export function generateVariantIds(pageId: string, count: number): PageVariant[] {
  const variants: PageVariant[] = []
  const labels = ['A', 'B', 'C'] as const

  for (let i = 0; i < Math.min(count, 3); i++) {
    variants.push({
      id: `${pageId}-var-${labels[i]}`,
      pageId,
      variant: labels[i],
      headline: '',
      cta: '',
      startedAt: new Date().toISOString(),
      winner: false,
    })
  }

  return variants
}

/**
 * Select a winner from experiment results based on conversion metrics.
 */
export function selectWinner(
  variants: { variant: string; conversionRate: number; sampleSize: number }[]
): string | null {
  const MIN_SAMPLE = 100

  const eligible = variants.filter(v => v.sampleSize >= MIN_SAMPLE)
  if (eligible.length < 2) return null

  eligible.sort((a, b) => b.conversionRate - a.conversionRate)

  const best = eligible[0]
  const second = eligible[1]

  // Require at least 10% relative improvement
  if (best.conversionRate > second.conversionRate * 1.1) {
    return best.variant
  }

  return null // No clear winner yet
}

/**
 * Convert a PageVariant to a Row for sheet storage.
 */
export function variantToRow(v: PageVariant): Row {
  return {
    id: v.id,
    page_id: v.pageId,
    variant: v.variant,
    headline: v.headline,
    cta: v.cta,
    started_at: v.startedAt,
    ended_at: v.endedAt || '',
    winner: v.winner ? 'true' : 'false',
  }
}
