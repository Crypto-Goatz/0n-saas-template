/**
 * Layer 2: PAGE AI — Layer manifest.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS } from '../core/constants'

export const manifest: LayerManifest = {
  id: LAYER_IDS.PAGE_AI,
  name: 'Page AI',
  version: '1.0.0',
  depends: [LAYER_IDS.CORE, LAYER_IDS.GOOGLE_BACKEND],
  provides: {
    routes: ['/api/cms/content?sheet=pages', '/api/cms/generate?type=page', '/api/cms/generate?type=seo'],
    sheets: ['pages', 'navigation', 'page_experiments', 'page_ai_learnings'],
    sidebarItems: [
      { label: 'Pages', href: '/content', icon: 'FileText', group: 'Content' },
    ],
  },
  envVars: ['GEMINI_API_KEY'],
  agentConfig: {
    scanInterval: '24h',
    objectives: [
      { metric: 'bounce_rate', direction: 'minimize', weight: 0.3 },
      { metric: 'avg_time_on_page', direction: 'maximize', weight: 0.2 },
      { metric: 'cta_click_rate', direction: 'maximize', weight: 0.3 },
      { metric: 'conversion_rate', direction: 'maximize', weight: 0.2 },
    ],
    trustLevel: 'recommend',
    confidenceThreshold: 0.7,
    learningStore: 'page_ai_learnings',
    maxActionsPerCycle: 3,
  },
}
