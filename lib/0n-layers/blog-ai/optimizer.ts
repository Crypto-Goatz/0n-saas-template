/**
 * Layer 3: BLOG AI — Content decay detection, internal linking, schema markup.
 */

export interface DecaySignal {
  postId: string
  slug: string
  positionDrop: number
  impressionDrop: number
  daysSinceUpdate: number
  severity: 'low' | 'medium' | 'high'
  suggestedAction: 'refresh' | 'rewrite' | 'consolidate'
}

/**
 * Detect content decay by comparing position changes.
 */
export function detectDecay(params: {
  postId: string
  slug: string
  positionBefore: number
  positionAfter: number
  impressionsBefore: number
  impressionsAfter: number
  daysSinceUpdate: number
}): DecaySignal | null {
  const positionDrop = params.positionAfter - params.positionBefore
  const impressionDrop = params.impressionsBefore > 0
    ? (params.impressionsBefore - params.impressionsAfter) / params.impressionsBefore
    : 0

  // No decay if position improved or held
  if (positionDrop <= 0 && impressionDrop <= 0) return null

  let severity: 'low' | 'medium' | 'high' = 'low'
  let suggestedAction: 'refresh' | 'rewrite' | 'consolidate' = 'refresh'

  if (positionDrop >= 5 || impressionDrop >= 0.3) {
    severity = 'high'
    suggestedAction = params.daysSinceUpdate > 180 ? 'rewrite' : 'refresh'
  } else if (positionDrop >= 3 || impressionDrop >= 0.15) {
    severity = 'medium'
    suggestedAction = 'refresh'
  }

  return {
    postId: params.postId,
    slug: params.slug,
    positionDrop,
    impressionDrop,
    daysSinceUpdate: params.daysSinceUpdate,
    severity,
    suggestedAction,
  }
}

/**
 * Suggest internal links between posts based on keyword overlap.
 */
export function suggestInternalLinks(
  posts: { id: string; slug: string; title: string; keywords: string[] }[]
): { from: string; to: string; anchor: string }[] {
  const links: { from: string; to: string; anchor: string }[] = []

  for (let i = 0; i < posts.length; i++) {
    for (let j = 0; j < posts.length; j++) {
      if (i === j) continue
      const overlap = posts[i].keywords.filter(k =>
        posts[j].keywords.includes(k)
      )
      if (overlap.length >= 2) {
        links.push({
          from: posts[i].slug,
          to: posts[j].slug,
          anchor: posts[j].title,
        })
      }
    }
  }

  return links
}

/**
 * Generate Article schema markup for a blog post.
 */
export function generateArticleSchema(params: {
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedAt: string
  updatedAt?: string
  authorName: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url,
    ...(params.imageUrl ? { image: params.imageUrl } : {}),
    datePublished: params.publishedAt,
    dateModified: params.updatedAt || params.publishedAt,
    author: {
      '@type': 'Person',
      name: params.authorName,
    },
  }
}
