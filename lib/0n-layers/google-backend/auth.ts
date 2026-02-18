/**
 * Layer 1: GOOGLE BACKEND — Authentication and client factories.
 */

import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
]

let cachedAuth: InstanceType<typeof google.auth.GoogleAuth> | null = null

export function getGoogleAuth() {
  if (cachedAuth) return cachedAuth

  const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyBase64) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not configured')
  }

  const credentials = JSON.parse(
    Buffer.from(keyBase64, 'base64').toString('utf-8')
  )

  cachedAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })

  return cachedAuth
}

export function getAuthFromCredentials(credentials: object) {
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })
}

export function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getGoogleAuth() })
}

export function getDriveClient() {
  return google.drive({ version: 'v3', auth: getGoogleAuth() })
}

export function getSheetsClientWithAuth(auth: InstanceType<typeof google.auth.GoogleAuth>) {
  return google.sheets({ version: 'v4', auth })
}

export function getDriveClientWithAuth(auth: InstanceType<typeof google.auth.GoogleAuth>) {
  return google.drive({ version: 'v3', auth })
}
