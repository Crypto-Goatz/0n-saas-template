/**
 * Layer 4: CRM — Layer manifest.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS } from '../core/constants'

export const manifest: LayerManifest = {
  id: LAYER_IDS.CRM,
  name: 'CRM',
  version: '1.0.0',
  depends: [LAYER_IDS.CORE, LAYER_IDS.GOOGLE_BACKEND],
  provides: {
    routes: ['/api/crm/sync', '/api/cms/content?sheet=contacts', '/api/cms/content?sheet=leads'],
    sheets: ['contacts', 'leads', 'pipeline', 'activities', 'tags', 'crm_ai_learnings'],
    sidebarItems: [
      { label: 'CRM', href: '/crm', icon: 'Users', group: 'Business' },
    ],
  },
  envVars: ['CRM_API_KEY', 'CRM_LOCATION_ID'],
  agentConfig: {
    scanInterval: '12h',
    objectives: [
      { metric: 'lead_velocity', direction: 'maximize', weight: 0.3 },
      { metric: 'conversion_rate', direction: 'maximize', weight: 0.3 },
      { metric: 'stall_rate', direction: 'minimize', weight: 0.2 },
      { metric: 'response_time', direction: 'minimize', weight: 0.2 },
    ],
    trustLevel: 'recommend',
    confidenceThreshold: 0.7,
    learningStore: 'crm_ai_learnings',
    maxActionsPerCycle: 5,
  },
}
