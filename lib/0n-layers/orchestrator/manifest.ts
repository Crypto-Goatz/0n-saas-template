/**
 * Layer 6: ORCHESTRATOR — Layer manifest.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS } from '../core/constants'

export const manifest: LayerManifest = {
  id: LAYER_IDS.ORCHESTRATOR,
  name: 'Orchestrator',
  version: '1.0.0',
  depends: [LAYER_IDS.CORE, LAYER_IDS.GOOGLE_BACKEND],
  provides: {
    routes: ['/api/setup', '/api/cms/config', '/api/cms/media'],
    sheets: ['site_config', 'media_log', '0n_events', 'orchestrator_learnings'],
    sidebarItems: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', group: 'Main' },
      { label: 'Media', href: '/media', icon: 'Image', group: 'Content' },
      { label: 'Settings', href: '/settings', icon: 'Settings', group: 'Settings' },
    ],
  },
  envVars: ['GOOGLE_SERVICE_ACCOUNT_KEY', 'GOOGLE_SHEET_ID', 'GOOGLE_DRIVE_FOLDER_ID'],
  agentConfig: {
    scanInterval: '6h',
    objectives: [
      { metric: 'overall_sxo_score', direction: 'maximize', weight: 0.4 },
      { metric: 'cross_layer_alignment', direction: 'maximize', weight: 0.3 },
      { metric: 'agent_efficiency', direction: 'maximize', weight: 0.3 },
    ],
    trustLevel: 'recommend',
    confidenceThreshold: 0.8,
    learningStore: 'orchestrator_learnings',
    maxActionsPerCycle: 5,
  },
}
