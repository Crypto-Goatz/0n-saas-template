/**
 * Layer 1: GOOGLE BACKEND — Barrel export.
 * All Google API communication (auth, Sheets CRUD, Drive files).
 */

// Auth
export {
  getGoogleAuth, getAuthFromCredentials,
  getSheetsClient, getDriveClient,
  getSheetsClientWithAuth, getDriveClientWithAuth,
} from './auth'

// Sheets
export {
  getSheetData, getSiteConfig, updateSheetRow,
  appendSheetRow, upsertSiteConfigKey, deleteSheetRow,
} from './sheets'
export type { Row } from './sheets'

// Drive
export {
  listFiles, uploadFile, deleteFile,
  getPublicUrl, getThumbnailUrl,
} from './drive'
export type { DriveFile } from './drive'

// Agent
export { scanSheetHealth, generateScanReport } from './agent'
export type { HealthCheckResult } from './agent'

// Manifest
export { manifest } from './manifest'
