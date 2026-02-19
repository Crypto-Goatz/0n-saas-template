-- ============================================================
-- 0n SaaS Template — Schema v1
-- Prefix: 0n_
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS "0n_users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free',
  email_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  crm_contact_id TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS "0n_sessions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "0n_users"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Password Resets
CREATE TABLE IF NOT EXISTS "0n_password_resets" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "0n_users"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email Verifications
CREATE TABLE IF NOT EXISTS "0n_email_verifications" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "0n_users"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sites (multi-tenant workspaces)
CREATE TABLE IF NOT EXISTS "0n_sites" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User <> Site junction
CREATE TABLE IF NOT EXISTS "0n_user_sites" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "0n_users"(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES "0n_sites"(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, site_id)
);

-- Activity Log
CREATE TABLE IF NOT EXISTS "0n_activity_log" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "0n_users"(id) ON DELETE SET NULL,
  site_id UUID REFERENCES "0n_sites"(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_0n_users_email ON "0n_users"(email);
CREATE INDEX IF NOT EXISTS idx_0n_users_stripe ON "0n_users"(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_0n_sessions_token ON "0n_sessions"(token);
CREATE INDEX IF NOT EXISTS idx_0n_sessions_user ON "0n_sessions"(user_id);
CREATE INDEX IF NOT EXISTS idx_0n_sessions_expires ON "0n_sessions"(expires_at);
CREATE INDEX IF NOT EXISTS idx_0n_resets_token ON "0n_password_resets"(token);
CREATE INDEX IF NOT EXISTS idx_0n_verify_token ON "0n_email_verifications"(token);
CREATE INDEX IF NOT EXISTS idx_0n_user_sites_user ON "0n_user_sites"(user_id);
CREATE INDEX IF NOT EXISTS idx_0n_user_sites_site ON "0n_user_sites"(site_id);
CREATE INDEX IF NOT EXISTS idx_0n_activity_user ON "0n_activity_log"(user_id);
CREATE INDEX IF NOT EXISTS idx_0n_activity_created ON "0n_activity_log"(created_at);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE "0n_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_password_resets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_email_verifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_sites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_user_sites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "0n_activity_log" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_0n_users" ON "0n_users" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_sessions" ON "0n_sessions" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_resets" ON "0n_password_resets" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_verify" ON "0n_email_verifications" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_sites" ON "0n_sites" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_user_sites" ON "0n_user_sites" FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_0n_activity" ON "0n_activity_log" FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION "0n_update_updated_at"()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "0n_users_updated_at"
  BEFORE UPDATE ON "0n_users"
  FOR EACH ROW EXECUTE FUNCTION "0n_update_updated_at"();

CREATE TRIGGER "0n_sites_updated_at"
  BEFORE UPDATE ON "0n_sites"
  FOR EACH ROW EXECUTE FUNCTION "0n_update_updated_at"();

-- Cleanup function
CREATE OR REPLACE FUNCTION "0n_cleanup_expired"()
RETURNS void AS $$
BEGIN
  DELETE FROM "0n_sessions" WHERE expires_at < now();
  DELETE FROM "0n_password_resets" WHERE expires_at < now() OR used = true;
  DELETE FROM "0n_email_verifications" WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
