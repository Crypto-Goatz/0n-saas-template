/**
 * Layer 6: ORCHESTRATOR — Layer discovery, validation, dependency resolution.
 */

import type { LayerManifest } from '../core/types'
import { LAYER_IDS } from '../core/constants'

// Import all layer manifests
import { manifest as googleBackendManifest } from '../google-backend/manifest'
import { manifest as pageAiManifest } from '../page-ai/manifest'
import { manifest as blogAiManifest } from '../blog-ai/manifest'
import { manifest as crmManifest } from '../crm/manifest'
import { manifest as complianceManifest } from '../compliance/manifest'

/** Core manifest (Layer 0 has no agent, no manifest file) */
const coreManifest: LayerManifest = {
  id: LAYER_IDS.CORE,
  name: 'Core',
  version: '1.0.0',
  depends: [],
  provides: { routes: [], sheets: [], sidebarItems: [] },
  envVars: [],
  agentConfig: null,
}

/** All available layer manifests */
export const ALL_LAYERS: LayerManifest[] = [
  coreManifest,
  googleBackendManifest,
  pageAiManifest,
  blogAiManifest,
  crmManifest,
  complianceManifest,
]

/** Get a layer by ID */
export function getLayer(id: string): LayerManifest | undefined {
  return ALL_LAYERS.find(l => l.id === id)
}

/** Get all layers that depend on a given layer */
export function getDependents(layerId: string): LayerManifest[] {
  return ALL_LAYERS.filter(l => l.depends.includes(layerId))
}

/** Resolve dependency order (topological sort) */
export function resolveDependencies(selectedIds: string[]): string[] {
  const resolved: string[] = []
  const visited = new Set<string>()

  function visit(id: string) {
    if (visited.has(id)) return
    visited.add(id)

    const layer = getLayer(id)
    if (!layer) return

    for (const dep of layer.depends) {
      visit(dep)
    }

    resolved.push(id)
  }

  for (const id of selectedIds) {
    visit(id)
  }

  return resolved
}

/** Validate that all dependencies are met */
export function validateDependencies(selectedIds: string[]): { valid: boolean; missing: { layer: string; needs: string }[] } {
  const selectedSet = new Set(selectedIds)
  const missing: { layer: string; needs: string }[] = []

  for (const id of selectedIds) {
    const layer = getLayer(id)
    if (!layer) continue

    for (const dep of layer.depends) {
      if (!selectedSet.has(dep)) {
        missing.push({ layer: id, needs: dep })
      }
    }
  }

  return { valid: missing.length === 0, missing }
}

/** Get all sheet tabs that should be created for selected layers */
export function getRequiredSheets(selectedIds: string[]): string[] {
  const sheets = new Set<string>()

  for (const id of selectedIds) {
    const layer = getLayer(id)
    if (!layer) continue
    for (const sheet of layer.provides.sheets) {
      sheets.add(sheet)
    }
  }

  return [...sheets]
}

/** Get all required env vars for selected layers */
export function getRequiredEnvVars(selectedIds: string[]): string[] {
  const vars = new Set<string>()

  for (const id of selectedIds) {
    const layer = getLayer(id)
    if (!layer) continue
    for (const v of layer.envVars) {
      vars.add(v)
    }
  }

  return [...vars]
}

/** Get all sidebar items for selected layers */
export function getSidebarItems(selectedIds: string[]) {
  const items = []

  for (const id of selectedIds) {
    const layer = getLayer(id)
    if (!layer) continue
    items.push(...layer.provides.sidebarItems)
  }

  return items
}
