/**
 * Layer 1: GOOGLE BACKEND — Google Sheets CRUD operations.
 */

import { getSheetsClient } from './auth'
import { CMS_SCHEMA, type SheetName } from '../core/schema'
import { FALLBACK_DATA } from '../core/fallback'
import type { Row } from '../core/types'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID

export type { Row }

/**
 * Read all rows from a named sheet tab.
 * Falls back to local data when Google Sheets is not configured.
 */
export async function getSheetData(sheetName: SheetName): Promise<Row[]> {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return (FALLBACK_DATA[sheetName] as Row[]) || []
  }

  try {
    const sheets = getSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    })

    const rows = res.data.values
    if (!rows || rows.length < 2) return []

    const headers = rows[0]
    return rows.slice(1).map((row) => {
      const obj: Row = {}
      headers.forEach((header, i) => {
        obj[header] = row[i] || ''
      })
      return obj
    })
  } catch {
    return (FALLBACK_DATA[sheetName] as Row[]) || []
  }
}

/**
 * Get the site_config sheet as a key-value map.
 */
export async function getSiteConfig(): Promise<Record<string, string>> {
  const rows = await getSheetData('site_config')
  const config: Record<string, string> = {}
  for (const row of rows) {
    if (row.key) config[row.key] = row.value || ''
  }
  return config
}

/**
 * Update a specific row in a sheet (0-based data index).
 */
export async function updateSheetRow(
  sheetName: SheetName,
  rowIndex: number,
  data: Row
): Promise<void> {
  const sheets = getSheetsClient()
  const schema = CMS_SCHEMA[sheetName]
  const values = schema.columns.map((col) => data[col] || '')

  const range = `${sheetName}!A${rowIndex + 2}`
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  })
}

/**
 * Append a new row to a sheet.
 */
export async function appendSheetRow(
  sheetName: SheetName,
  data: Row
): Promise<void> {
  const sheets = getSheetsClient()
  const schema = CMS_SCHEMA[sheetName]
  const values = schema.columns.map((col) => data[col] || '')

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  })
}

/**
 * Upsert a key-value pair in the site_config sheet.
 */
export async function upsertSiteConfigKey(
  key: string,
  value: string
): Promise<void> {
  if (!SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error('Google Sheets is not configured')
  }

  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'site_config!A:B',
  })

  const rows = res.data.values || []
  let rowIdx = -1
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === key) {
      rowIdx = i
      break
    }
  }

  if (rowIdx >= 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `site_config!A${rowIdx + 1}:B${rowIdx + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[key, value]] },
    })
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'site_config!A:B',
      valueInputOption: 'RAW',
      requestBody: { values: [[key, value]] },
    })
  }
}

/**
 * Delete a row by clearing it.
 */
export async function deleteSheetRow(
  sheetName: SheetName,
  rowIndex: number
): Promise<void> {
  const sheets = getSheetsClient()
  const schema = CMS_SCHEMA[sheetName]
  const emptyCells = schema.columns.map(() => '')
  const endCol = String.fromCharCode(64 + schema.columns.length)

  const range = `${sheetName}!A${rowIndex + 2}:${endCol}${rowIndex + 2}`
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [emptyCells] },
  })
}
