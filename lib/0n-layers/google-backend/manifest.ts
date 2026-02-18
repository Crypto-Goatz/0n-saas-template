/**
 * Layer 1: GOOGLE BACKEND — Layer manifest.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS, AGENT_IDS } from '../core/constants'

export const manifest: LayerManifest = {
  id: LAYER_IDS.GOOGLE_BACKEND,
  name: 'Google Backend',
  version: '1.0.0',
  depends: [LAYER_IDS.CORE],
  provides: {
    routes: [],
    sheets: Object.keys({}), // Provides CRUD for all sheets — not an owner
    sidebarItems: [],
  },
  envVars: ['GOOGLE_SERVICE_ACCOUNT_KEY', 'GOOGLE_SHEET_ID', 'GOOGLE_DRIVE_FOLDER_ID'],
  agentConfig: {
    scanInterval: '6h',
    objectives: [
      { metric: 'api_uptime', direction: 'maximize', weight: 0.5 },
      { metric: 'repair_success_rate', direction: 'maximize', weight: 0.3 },
      { metric: 'response_time_ms', direction: 'minimize', weight: 0.2 },
    ],
    trustLevel: 'recommend',
    confidenceThreshold: 0.8,
    learningStore: 'orchestrator_learnings',
    maxActionsPerCycle: 5,
  },
}
