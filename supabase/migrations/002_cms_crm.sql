-- ============================================================
-- cr0n SaaS Template — Schema v2: CMS + CRM
-- Migration: 002_cms_crm.sql
-- ============================================================

-- CMS/CRM configuration per site
CREATE TABLE IF NOT EXISTS cr0n_cms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES cr0n_sites(id) ON DELETE CASCADE,
  sheet_id TEXT,
  drive_folder_id TEXT,
  gemini_key TEXT,
  consent_mode TEXT DEFAULT 'essential',
  crm_pit TEXT,
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id)
);

-- CRM sync log
CREATE TABLE IF NOT EXISTS cr0n_crm_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES cr0n_sites(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  contacts_synced INT DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cr0n_cms_config_site ON cr0n_cms_config(site_id);
CREATE INDEX IF NOT EXISTS idx_cr0n_crm_sync_site ON cr0n_crm_sync_log(site_id);
CREATE INDEX IF NOT EXISTS idx_cr0n_crm_sync_created ON cr0n_crm_sync_log(created_at);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE cr0n_cms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr0n_crm_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_cr0n_cms_config" ON cr0n_cms_config FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_cr0n_crm_sync" ON cr0n_crm_sync_log FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER cr0n_cms_config_updated_at
  BEFORE UPDATE ON cr0n_cms_config
  FOR EACH ROW EXECUTE FUNCTION cr0n_update_updated_at();
