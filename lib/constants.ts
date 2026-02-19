// ============================================================
// 0n SaaS Template — Dynamic Table Prefix
// ============================================================
// Set TABLE_PREFIX env var per deployment (default: '0n')
// Each SaaS instance gets its own prefix.
// ============================================================

export const TABLE_PREFIX = process.env.TABLE_PREFIX || '0n'

export const TABLES = {
  users: `${TABLE_PREFIX}_users`,
  sessions: `${TABLE_PREFIX}_sessions`,
  passwordResets: `${TABLE_PREFIX}_password_resets`,
  emailVerifications: `${TABLE_PREFIX}_email_verifications`,
  sites: `${TABLE_PREFIX}_sites`,
  userSites: `${TABLE_PREFIX}_user_sites`,
  activityLog: `${TABLE_PREFIX}_activity_log`,
  cmsConfig: `${TABLE_PREFIX}_cms_config`,
  crmSyncLog: `${TABLE_PREFIX}_crm_sync_log`,
} as const
