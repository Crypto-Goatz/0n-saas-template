/**
 * Layer 0: CORE — TypeScript interfaces for all layers.
 */

import type { ReactNode } from 'react'

// -- Data Row Types --

export interface PageRow {
  id: string
  title: string
  slug: string
  content: string
  meta_description: string
  status: string
  updated_at: string
}

export interface BlogPostRow {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image_id: string
  published_at: string
  status: string
}

export interface ContactRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  tags: string
  source: string
  created_at: string
}

export interface LeadRow {
  id: string
  contact_id: string
  stage: string
  value: string
  notes: string
  assigned_to: string
  created_at: string
  updated_at: string
}

// -- Sidebar Item --

export interface SidebarItem {
  label: string
  href: string
  icon: string
  group: string
}

// -- Layer System Types --

export interface AgentObjective {
  metric: string
  direction: 'maximize' | 'minimize'
  weight: number
}

export interface AgentConfig {
  scanInterval: string
  objectives: AgentObjective[]
  trustLevel: TrustLevel
  confidenceThreshold: number
  learningStore: string
  maxActionsPerCycle: number
}

export interface LayerManifest {
  id: string
  name: string
  version: string
  depends: string[]
  provides: {
    routes: string[]
    sheets: string[]
    sidebarItems: SidebarItem[]
  }
  envVars: string[]
  agentConfig: AgentConfig | null
}

// -- Progressive Trust --

export type TrustLevel = 'observe' | 'recommend' | 'auto-low' | 'auto-medium' | 'auto-full'

export const TRUST_LEVELS: TrustLevel[] = ['observe', 'recommend', 'auto-low', 'auto-medium', 'auto-full']

export interface TrustPromotion {
  from: TrustLevel
  to: TrustLevel
  requirement: string
  threshold: number
}

export const TRUST_PROMOTIONS: TrustPromotion[] = [
  { from: 'observe', to: 'recommend', requirement: 'scan_cycles_no_errors', threshold: 3 },
  { from: 'recommend', to: 'auto-low', requirement: 'human_approved_recommendations', threshold: 5 },
  { from: 'auto-low', to: 'auto-medium', requirement: 'successful_auto_actions', threshold: 10 },
  { from: 'auto-medium', to: 'auto-full', requirement: 'successful_medium_actions_and_human_approval', threshold: 25 },
]

// -- Agent Learning Store --

export interface LearningRecord {
  id: string
  cycle_date: string
  target: string
  metric: string
  value_before: string
  action_type: string
  action_detail: string
  value_after: string
  delta_pct: string
  days_measured: string
  confidence: string
  trust_level: string
  outcome: 'positive' | 'negative' | 'neutral'
}

// -- Agent Scan Report --

export interface ScanReport {
  agentId: string
  layerId: string
  timestamp: string
  findings: ScanFinding[]
  overallHealth: 'healthy' | 'warning' | 'critical'
}

export interface ScanFinding {
  severity: 'info' | 'warning' | 'critical'
  message: string
  metric?: string
  currentValue?: number
  threshold?: number
  suggestedAction?: string
}

// -- Agent Action --

export interface AgentAction {
  id: string
  agentId: string
  type: string
  detail: string
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'failed'
  trustRequired: TrustLevel
  createdAt: string
  executedAt?: string
  result?: string
}

// -- Layer Installation --

export interface InstallationResult {
  layerId: string
  success: boolean
  sheetsCreated: string[]
  errors: string[]
}

// -- Generic Row type for Sheets --

export type Row = Record<string, string>

// -- Setup Wizard --

export interface WizardStepProps {
  onNext: () => void
  onBack?: () => void
  children?: ReactNode
}
