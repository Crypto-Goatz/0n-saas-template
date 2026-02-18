/**
 * Layer 0: CORE — CMS + CRM schema definition for Google Sheets.
 * Each sheet tab has defined columns.
 * CRM tabs include field mapping for sync.
 */

// -- CMS + CRM Schema --

export const CMS_SCHEMA = {
  site_config: {
    description: 'Key-value pairs for site configuration',
    columns: ['key', 'value'],
  },
  pages: {
    description: 'Website pages with content',
    columns: ['id', 'title', 'slug', 'content', 'meta_description', 'status', 'updated_at'],
  },
  blog_posts: {
    description: 'Blog posts with full content',
    columns: ['id', 'title', 'slug', 'content', 'excerpt', 'image_id', 'published_at', 'status'],
  },
  navigation: {
    description: 'Navigation menu items',
    columns: ['id', 'label', 'href', 'order', 'parent_id', 'visible'],
  },
  media_log: {
    description: 'Media file metadata log',
    columns: ['id', 'file_name', 'drive_file_id', 'mime_type', 'subfolder', 'uploaded_at'],
  },
  contacts: {
    description: 'CRM contacts',
    columns: ['id', 'first_name', 'last_name', 'email', 'phone', 'company', 'tags', 'source', 'created_at'],
  },
  leads: {
    description: 'Lead pipeline entries',
    columns: ['id', 'contact_id', 'stage', 'value', 'notes', 'assigned_to', 'created_at', 'updated_at'],
  },
  pipeline: {
    description: 'Pipeline stage definitions',
    columns: ['id', 'name', 'order', 'color'],
  },
  activities: {
    description: 'CRM activity log',
    columns: ['id', 'contact_id', 'type', 'description', 'created_at'],
  },
  tags: {
    description: 'Contact tag definitions',
    columns: ['id', 'name', 'color'],
  },
  // -- Agent Learning Tabs --
  page_experiments: {
    description: 'Page A/B test variants',
    columns: ['id', 'page_id', 'variant', 'headline', 'cta', 'started_at', 'ended_at', 'winner'],
  },
  page_ai_learnings: {
    description: 'Page AI agent learning store',
    columns: ['id', 'cycle_date', 'target', 'metric', 'value_before', 'action_type', 'action_detail', 'value_after', 'delta_pct', 'days_measured', 'confidence', 'trust_level', 'outcome'],
  },
  content_calendar: {
    description: 'Blog production schedule',
    columns: ['id', 'title', 'keyword', 'target_date', 'status', 'assigned_to', 'post_id'],
  },
  blog_ai_learnings: {
    description: 'Blog AI agent learning store',
    columns: ['id', 'cycle_date', 'target', 'metric', 'value_before', 'action_type', 'action_detail', 'value_after', 'delta_pct', 'days_measured', 'confidence', 'trust_level', 'outcome'],
  },
  crm_ai_learnings: {
    description: 'CRM AI agent learning store',
    columns: ['id', 'cycle_date', 'target', 'metric', 'value_before', 'action_type', 'action_detail', 'value_after', 'delta_pct', 'days_measured', 'confidence', 'trust_level', 'outcome'],
  },
  compliance_ai_learnings: {
    description: 'Compliance AI agent learning store',
    columns: ['id', 'cycle_date', 'target', 'metric', 'value_before', 'action_type', 'action_detail', 'value_after', 'delta_pct', 'days_measured', 'confidence', 'trust_level', 'outcome'],
  },
  orchestrator_learnings: {
    description: 'Orchestrator meta-agent learning store',
    columns: ['id', 'cycle_date', 'target', 'metric', 'value_before', 'action_type', 'action_detail', 'value_after', 'delta_pct', 'days_measured', 'confidence', 'trust_level', 'outcome'],
  },
  '0n_events': {
    description: 'Cross-layer event log',
    columns: ['id', 'timestamp', 'layer', 'event_type', 'payload', 'agent_id'],
  },
} as const

export type SheetName = keyof typeof CMS_SCHEMA

// -- CRM Field Map --

export const CRM_FIELD_MAP: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  phone: 'phone',
  company: 'companyName',
  tags: 'tags',
  source: 'source',
}

// -- CMS Tab Definitions (for content manager UI) --

export const CMS_TABS: { key: SheetName; label: string; category: 'cms' | 'crm' }[] = [
  { key: 'pages', label: 'Pages', category: 'cms' },
  { key: 'blog_posts', label: 'Blog Posts', category: 'cms' },
  { key: 'navigation', label: 'Navigation', category: 'cms' },
  { key: 'site_config', label: 'Site Config', category: 'cms' },
  { key: 'contacts', label: 'Contacts', category: 'crm' },
  { key: 'leads', label: 'Leads', category: 'crm' },
  { key: 'activities', label: 'Activities', category: 'crm' },
]
