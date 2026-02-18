/**
 * Layer 6: ORCHESTRATOR — Barrel export.
 * Layer registry, dependency resolution, setup wizard, installation, route dispatcher.
 */

// Registry
export {
  ALL_LAYERS, getLayer, getDependents,
  resolveDependencies, validateDependencies,
  getRequiredSheets, getRequiredEnvVars, getSidebarItems,
} from './registry'

// Installer
export { installNewBuild, installRetrofit } from './installer'

// Dispatcher
export {
  getSheetOwner, isSheetAccessible, getAccessibleSheets,
  getGenerateOwner,
} from './dispatcher'

// Health
export { aggregateHealth, detectCrossLayerIssues } from './health'
export type { SystemHealth } from './health'

// Agent
export { metaScan, createOrchestratorLearningRecord } from './agent'

// Manifest
export { manifest } from './manifest'
