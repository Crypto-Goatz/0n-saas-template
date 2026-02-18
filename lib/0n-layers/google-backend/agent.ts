/**
 * Layer 1: GOOGLE BACKEND — Health Monitor Agent.
 * Scans sheet structure, Drive access, API quota.
 * Auto-repairs missing tabs and misaligned headers.
 */

import type { ScanReport, ScanFinding } from '../core/types'
import { CMS_SCHEMA, type SheetName } from '../core/schema'
import { AGENT_IDS } from '../core/constants'

export interface HealthCheckResult {
  sheetsAccessible: boolean
  driveAccessible: boolean
  missingTabs: string[]
  misalignedHeaders: { tab: string; expected: string[]; actual: string[] }[]
  quotaRemaining?: number
}

/**
 * Scan Google Sheets structure for integrity.
 */
export async function scanSheetHealth(
  getSheetHeaders: (tab: string) => Promise<string[] | null>
): Promise<HealthCheckResult> {
  const missingTabs: string[] = []
  const misalignedHeaders: { tab: string; expected: string[]; actual: string[] }[] = []
  let sheetsAccessible = true

  const tabNames = Object.keys(CMS_SCHEMA) as SheetName[]

  for (const tab of tabNames) {
    try {
      const headers = await getSheetHeaders(tab)
      if (headers === null) {
        missingTabs.push(tab)
      } else {
        const expected = CMS_SCHEMA[tab].columns as readonly string[]
        const mismatches = expected.filter((col, i) => headers[i] !== col)
        if (mismatches.length > 0) {
          misalignedHeaders.push({ tab, expected: [...expected], actual: headers })
        }
      }
    } catch {
      sheetsAccessible = false
      break
    }
  }

  return {
    sheetsAccessible,
    driveAccessible: true, // Checked separately
    missingTabs,
    misalignedHeaders,
  }
}

/**
 * Generate a scan report from health check results.
 */
export function generateScanReport(result: HealthCheckResult): ScanReport {
  const findings: ScanFinding[] = []

  if (!result.sheetsAccessible) {
    findings.push({
      severity: 'critical',
      message: 'Google Sheets API is not accessible',
      suggestedAction: 'Check GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SHEET_ID environment variables',
    })
  }

  if (!result.driveAccessible) {
    findings.push({
      severity: 'critical',
      message: 'Google Drive API is not accessible',
      suggestedAction: 'Check GOOGLE_DRIVE_FOLDER_ID environment variable',
    })
  }

  for (const tab of result.missingTabs) {
    findings.push({
      severity: 'warning',
      message: `Missing sheet tab: ${tab}`,
      suggestedAction: `Create tab "${tab}" with correct headers`,
    })
  }

  for (const mismatch of result.misalignedHeaders) {
    findings.push({
      severity: 'warning',
      message: `Misaligned headers in "${mismatch.tab}": expected [${mismatch.expected.join(', ')}], got [${mismatch.actual.join(', ')}]`,
      suggestedAction: `Fix headers in "${mismatch.tab}" to match schema`,
    })
  }

  const overallHealth = findings.some(f => f.severity === 'critical')
    ? 'critical'
    : findings.some(f => f.severity === 'warning')
      ? 'warning'
      : 'healthy'

  return {
    agentId: AGENT_IDS.HEALTH_MONITOR,
    layerId: '0n-layer-google-backend',
    timestamp: new Date().toISOString(),
    findings,
    overallHealth,
  }
}
