/**
 * Layer 5: COMPLIANCE — Layer manifest.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS } from '../core/constants'

export const manifest: LayerManifest = {
  id: LAYER_IDS.COMPLIANCE,
  name: 'Compliance',
  version: '1.0.0',
  depends: [LAYER_IDS.CORE],
  provides: {
    routes: [],
    sheets: ['compliance_ai_learnings'],
    sidebarItems: [
      { label: 'Compliance', href: '/settings/compliance', icon: 'Shield', group: 'Settings' },
    ],
  },
  envVars: [],
  agentConfig: {
    scanInterval: '7d',
    objectives: [
      { metric: 'consent_rate', direction: 'maximize', weight: 0.4 },
      { metric: 'banner_dismiss_rate', direction: 'minimize', weight: 0.3 },
      { metric: 'policy_freshness', direction: 'maximize', weight: 0.3 },
    ],
    trustLevel: 'recommend',
    confidenceThreshold: 0.6,
    learningStore: 'compliance_ai_learnings',
    maxActionsPerCycle: 2,
  },
}
