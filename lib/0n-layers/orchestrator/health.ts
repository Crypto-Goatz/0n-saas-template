/**
 * Layer 6: ORCHESTRATOR — Cross-layer health checks.
 */

import type { ScanReport } from '../core/types'

export interface SystemHealth {
  timestamp: string
  overallScore: number // 0-100
  layers: {
    layerId: string
    name: string
    status: 'healthy' | 'warning' | 'critical' | 'offline'
    lastScan?: string
    agentTrustLevel?: string
  }[]
  alerts: { severity: 'warning' | 'critical'; message: string; layerId: string }[]
}

/**
 * Aggregate health from all layer scan reports.
 */
export function aggregateHealth(
  reports: ScanReport[],
  layerNames: Record<string, string>
): SystemHealth {
  const alerts: SystemHealth['alerts'] = []
  let healthyCount = 0
  let warningCount = 0
  let criticalCount = 0

  const layers = reports.map(report => {
    const name = layerNames[report.layerId] || report.layerId

    for (const finding of report.findings) {
      if (finding.severity === 'critical') {
        alerts.push({ severity: 'critical', message: finding.message, layerId: report.layerId })
      } else if (finding.severity === 'warning') {
        alerts.push({ severity: 'warning', message: finding.message, layerId: report.layerId })
      }
    }

    if (report.overallHealth === 'healthy') healthyCount++
    else if (report.overallHealth === 'warning') warningCount++
    else criticalCount++

    return {
      layerId: report.layerId,
      name,
      status: report.overallHealth,
      lastScan: report.timestamp,
    }
  })

  const total = reports.length || 1
  const overallScore = Math.round(
    (healthyCount * 100 + warningCount * 50 + criticalCount * 0) / total
  )

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    layers,
    alerts,
  }
}

/**
 * Determine if cross-layer coordination is needed.
 */
export function detectCrossLayerIssues(reports: ScanReport[]): string[] {
  const issues: string[] = []

  const blogReport = reports.find(r => r.layerId === '0n-layer-blog-ai')
  const pageReport = reports.find(r => r.layerId === '0n-layer-page-ai')
  const crmReport = reports.find(r => r.layerId === '0n-layer-crm')

  // Blog producing traffic but pages not converting
  if (blogReport?.overallHealth === 'healthy' && pageReport?.overallHealth === 'critical') {
    issues.push('Blog traffic healthy but page conversions critical — prioritize Page AI fixes')
  }

  // CRM has stalled leads but no page optimization in progress
  if (crmReport?.findings.some(f => f.metric === 'days_in_stage') && pageReport?.overallHealth === 'healthy') {
    issues.push('CRM has stalled leads — check if landing pages need optimization')
  }

  return issues
}
