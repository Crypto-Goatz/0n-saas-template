/**
 * Layer 6: ORCHESTRATOR — Layer installation for new and existing builds.
 */

import type { InstallationResult } from '../core/types'
import { CMS_SCHEMA, type SheetName } from '../core/schema'
import { resolveDependencies, getRequiredSheets, getLayer } from './registry'

/**
 * Install layers into a new build.
 * Creates only the sheet tabs needed for selected layers.
 */
export async function installNewBuild(params: {
  selectedLayerIds: string[]
  createSheet: (name: string, columns: string[]) => Promise<boolean>
}): Promise<InstallationResult[]> {
  const resolved = resolveDependencies(params.selectedLayerIds)
  const requiredSheets = getRequiredSheets(resolved)
  const results: InstallationResult[] = []

  // Always create site_config (owned by orchestrator)
  const allSheets = new Set([...requiredSheets, 'site_config', 'media_log', '0n_events', 'orchestrator_learnings'])

  for (const layerId of resolved) {
    const layer = getLayer(layerId)
    if (!layer) continue

    const sheetsCreated: string[] = []
    const errors: string[] = []

    for (const sheetName of layer.provides.sheets) {
      if (!allSheets.has(sheetName)) continue

      const schema = CMS_SCHEMA[sheetName as SheetName]
      if (!schema) {
        errors.push(`Unknown sheet: ${sheetName}`)
        continue
      }

      try {
        const ok = await params.createSheet(sheetName, [...schema.columns])
        if (ok) sheetsCreated.push(sheetName)
      } catch (err) {
        errors.push(`Failed to create ${sheetName}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    results.push({
      layerId,
      success: errors.length === 0,
      sheetsCreated,
      errors,
    })
  }

  return results
}

/**
 * Install a layer into an existing build (retrofit).
 * Non-destructive: adds missing tabs/columns, never deletes data.
 */
export async function installRetrofit(params: {
  layerId: string
  existingSheets: string[]
  createSheet: (name: string, columns: string[]) => Promise<boolean>
  addColumnsToSheet?: (name: string, columns: string[]) => Promise<boolean>
}): Promise<InstallationResult> {
  const resolved = resolveDependencies([params.layerId])
  const sheetsCreated: string[] = []
  const errors: string[] = []

  for (const id of resolved) {
    const layer = getLayer(id)
    if (!layer) continue

    for (const sheetName of layer.provides.sheets) {
      const schema = CMS_SCHEMA[sheetName as SheetName]
      if (!schema) continue

      if (params.existingSheets.includes(sheetName)) {
        // Sheet exists — check for missing columns (non-destructive)
        if (params.addColumnsToSheet) {
          try {
            await params.addColumnsToSheet(sheetName, [...schema.columns])
          } catch (err) {
            errors.push(`Failed to update columns for ${sheetName}: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      } else {
        // Sheet doesn't exist — create it
        try {
          const ok = await params.createSheet(sheetName, [...schema.columns])
          if (ok) sheetsCreated.push(sheetName)
        } catch (err) {
          errors.push(`Failed to create ${sheetName}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
    }
  }

  return {
    layerId: params.layerId,
    success: errors.length === 0,
    sheetsCreated,
    errors,
  }
}
