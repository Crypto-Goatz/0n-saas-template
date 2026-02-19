-- ============================================================
-- 0n SaaS Template — Schema v2: CMS + CRM
-- Migration: 002_0n_cms_crm.sql
-- ============================================================

-- CMS/CRM configuration per site
CREATE TABLE IF NOT EXISTS "0n_cms_config" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES "0n_sites"(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS "0n_crm_sync_log" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES "0n_sites"(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  contacts_synced INT DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_0n_cms_config_site ON "0n_cms_config"(site_id);
CREATE INDEX IF NOT EXISTS idx_0n_crm_sync_site ON "0n_crm_sync_log"(site_id);
CREATE INDEX IF NOT EXISTS idx_0n_crm_sync_created ON "0n_crm_sync_log"(created_at);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE "0n_cms_config" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_crm_sync_log" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_0n_cms_config" ON "0n_cms_config" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_crm_sync" ON "0n_crm_sync_log" FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER "0n_cms_config_updated_at"
  BEFORE UPDATE ON "0n_cms_config"
  FOR EACH ROW EXECUTE FUNCTION "0n_update_updated_at"();
