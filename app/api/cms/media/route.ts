import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { listFiles, uploadFile, deleteFile } from '@/lib/google/drive'

function json(data: object, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * GET /api/cms/media?subfolder=images
 */
export async function GET(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  const subfolder = req.nextUrl.searchParams.get('subfolder') || undefined

  try {
    const files = await listFiles(subfolder)
    return json({ files })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}

/**
 * POST /api/cms/media (multipart form data)
 */
export async function POST(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const subfolder = formData.get('subfolder') as string | null

    if (!file) {
      return json({ error: 'No file provided' }, 400)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type, subfolder || undefined)

    return json({ file: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}

/**
 * DELETE /api/cms/media?fileId=xxx
 */
export async function DELETE(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  const fileId = req.nextUrl.searchParams.get('fileId')
  if (!fileId) {
    return json({ error: 'fileId required' }, 400)
  }

  try {
    await deleteFile(fileId)
    return json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}
