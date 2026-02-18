/**
 * Layer 3: BLOG AI — Layer manifest.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS } from '../core/constants'

export const manifest: LayerManifest = {
  id: LAYER_IDS.BLOG_AI,
  name: 'Blog AI',
  version: '1.0.0',
  depends: [LAYER_IDS.CORE, LAYER_IDS.GOOGLE_BACKEND],
  provides: {
    routes: ['/api/cms/content?sheet=blog_posts', '/api/cms/generate?type=blog'],
    sheets: ['blog_posts', 'content_calendar', 'blog_ai_learnings'],
    sidebarItems: [
      { label: 'Blog', href: '/content?tab=blog', icon: 'PenLine', group: 'Content' },
    ],
  },
  envVars: ['GEMINI_API_KEY'],
  agentConfig: {
    scanInterval: '24h',
    objectives: [
      { metric: 'impressions', direction: 'maximize', weight: 0.2 },
      { metric: 'clicks', direction: 'maximize', weight: 0.3 },
      { metric: 'avg_position', direction: 'minimize', weight: 0.3 },
      { metric: 'keyword_coverage', direction: 'maximize', weight: 0.2 },
    ],
    trustLevel: 'recommend',
    confidenceThreshold: 0.7,
    learningStore: 'blog_ai_learnings',
    maxActionsPerCycle: 3,
  },
}
