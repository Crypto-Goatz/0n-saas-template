import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCredentials, getSheetsClientWithAuth, getDriveClientWithAuth } from '@/lib/google/auth'
import { CMS_SCHEMA, type SheetName } from '@/config/cms-schema'

function json(data: object, status = 200) {
  return NextResponse.json(data, { status })
}

function error(message: string, status = 400) {
  return json({ error: message }, status)
}

function decodeCredentials(base64Key: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(base64Key, 'base64').toString('utf-8'))
  } catch {
    throw new Error('Invalid service account JSON — could not decode base64')
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'validate-google': {
        const { googleKey } = body
        if (!googleKey) return error('Missing googleKey')

        const credentials = decodeCredentials(googleKey) as { client_email?: string }
        if (!credentials.client_email) {
          return error('Invalid service account JSON — no client_email found')
        }

        const auth = getAuthFromCredentials(credentials)
        const client = await auth.getClient()
        await client.getAccessToken()

        return json({ valid: true, serviceAccountEmail: credentials.client_email })
      }

      case 'create-sheet': {
        const { googleKey, businessName } = body
        if (!googleKey || !businessName) return error('Missing googleKey or businessName')

        const credentials = decodeCredentials(googleKey)
        const auth = getAuthFromCredentials(credentials)
        const sheets = getSheetsClientWithAuth(auth)

        // Create a new spreadsheet with all CMS+CRM tabs
        const tabNames = Object.keys(CMS_SCHEMA) as SheetName[]
        const createRes = await sheets.spreadsheets.create({
          requestBody: {
            properties: { title: `${businessName} — CMS` },
            sheets: tabNames.map((name, i) => ({
              properties: { title: name, index: i },
            })),
          },
        })

        const spreadsheetId = createRes.data.spreadsheetId!
        const spreadsheetUrl = createRes.data.spreadsheetUrl!

        // Write header rows
        const headerData = tabNames.map((name) => ({
          range: `${name}!A1`,
          values: [CMS_SCHEMA[name].columns as unknown as string[]],
        }))

        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: { valueInputOption: 'RAW', data: headerData },
        })

        // Write default pipeline stages
        const pipelineData = [
          ['1', 'New', '1', '#6b7280'],
          ['2', 'Contacted', '2', '#3b82f6'],
          ['3', 'Qualified', '3', '#8b5cf6'],
          ['4', 'Proposal', '4', '#f59e0b'],
          ['5', 'Won', '5', '#22c55e'],
          ['6', 'Lost', '6', '#ef4444'],
        ]
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'pipeline!A2',
          valueInputOption: 'RAW',
          requestBody: { values: pipelineData },
        })

        return json({ spreadsheetId, spreadsheetUrl })
      }

      case 'setup-drive': {
        const { googleKey, businessName } = body
        if (!googleKey || !businessName) return error('Missing googleKey or businessName')

        const credentials = decodeCredentials(googleKey)
        const auth = getAuthFromCredentials(credentials)
        const drive = getDriveClientWithAuth(auth)

        // Create root folder
        const rootFolder = await drive.files.create({
          requestBody: {
            name: `${businessName} — Media`,
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id',
        })
        const rootFolderId = rootFolder.data.id!

        // Create subfolders
        for (const sub of ['images', 'logos', 'blog', 'documents']) {
          await drive.files.create({
            requestBody: {
              name: sub,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootFolderId],
            },
          })
        }

        return json({ rootFolderId })
      }

      case 'generate-content': {
        const { googleKey, spreadsheetId, geminiKey, businessInfo } = body
        if (!googleKey || !spreadsheetId || !geminiKey || !businessInfo) {
          return error('Missing required fields for content generation')
        }

        // Dynamic import to avoid loading Gemini when not needed
        const { generateContent: genContent } = await import('@/lib/gemini')

        const prompt = `Generate starter content for a SaaS website.
Business name: ${businessInfo.name || 'My Business'}
Industry: ${businessInfo.industry || 'Technology'}
Description: ${businessInfo.description || 'A modern SaaS platform'}

Return a JSON object with:
- "pages": array of {id, title, slug, content (HTML), meta_description, status: "published", updated_at}  (3-5 pages: Home, About, Services, Contact)
- "blog_posts": array of {id, title, slug, content (HTML), excerpt, image_id: "", published_at, status: "published"} (3 posts)
- "navigation": array of {id, label, href, order, parent_id: "", visible: "true"} (matching pages)
- "site_config": array of {key, value} pairs (business_name, tagline, contact_email, etc)

Return only valid JSON, no markdown fences.`

        const text = await genContent(prompt, geminiKey)
        const generated = JSON.parse(text)

        // Write to spreadsheet
        const credentials = decodeCredentials(googleKey)
        const auth = getAuthFromCredentials(credentials)
        const sheets = getSheetsClientWithAuth(auth)

        const writeData: { range: string; values: string[][] }[] = []

        for (const tab of ['pages', 'blog_posts', 'navigation', 'site_config'] as const) {
          if (generated[tab]?.length > 0) {
            const cols = CMS_SCHEMA[tab].columns
            writeData.push({
              range: `${tab}!A2`,
              values: generated[tab].map((row: Record<string, string>) =>
                cols.map((c) => row[c] || '')
              ),
            })
          }
        }

        if (writeData.length > 0) {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            requestBody: { valueInputOption: 'RAW', data: writeData },
          })
        }

        return json({
          pages: generated.pages?.length || 0,
          blog_posts: generated.blog_posts?.length || 0,
          navigation: generated.navigation?.length || 0,
          site_config: generated.site_config?.length || 0,
        })
      }

      case 'setup-crm': {
        const { googleKey, spreadsheetId } = body
        if (!googleKey || !spreadsheetId) return error('Missing required fields')

        // CRM tabs (contacts, leads, pipeline, activities, tags) are already created
        // Pipeline defaults are already seeded in create-sheet action
        // Just confirm setup
        return json({ crm_ready: true })
      }

      case 'save-config': {
        const { googleKey, spreadsheetId, config } = body
        if (!googleKey || !spreadsheetId || !config) return error('Missing required fields')

        const credentials = decodeCredentials(googleKey)
        const auth = getAuthFromCredentials(credentials)
        const sheets = getSheetsClientWithAuth(auth)

        const configEntries = Object.entries(config) as [string, string][]
        if (!configEntries.find(([k]) => k === 'setup_complete')) {
          configEntries.push(['setup_complete', 'true'])
        }

        const values = configEntries.map(([key, value]) => [key, String(value)])

        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: 'site_config!A2:B1000',
        })

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'site_config!A2',
          valueInputOption: 'RAW',
          requestBody: { values },
        })

        return json({ saved: true })
      }

      case 'check-status': {
        return json({
          google: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
          sheets: !!process.env.GOOGLE_SHEET_ID,
          drive: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
          gemini: !!process.env.GEMINI_API_KEY,
        })
      }

      default:
        return error(`Unknown action: ${action}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}
