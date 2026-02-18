/**
 * Layer 1: GOOGLE BACKEND — Google Drive file operations.
 */

import { getDriveClient } from './auth'
import { Readable } from 'stream'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  webContentLink?: string
  createdTime?: string
}

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!

/**
 * List image files in a Drive folder.
 */
export async function listFiles(subfolder?: string): Promise<DriveFile[]> {
  const drive = getDriveClient()
  let parentId = FOLDER_ID

  if (subfolder) {
    const folderRes = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and name = '${subfolder}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    })
    if (folderRes.data.files?.[0]?.id) {
      parentId = folderRes.data.files[0].id
    }
  }

  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  })

  return (res.data.files || []) as DriveFile[]
}

/**
 * Upload a file to Drive with public read permissions.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  subfolder?: string
): Promise<DriveFile> {
  const drive = getDriveClient()
  let parentId = FOLDER_ID

  if (subfolder) {
    const folderRes = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and name = '${subfolder}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    })

    if (folderRes.data.files?.[0]?.id) {
      parentId = folderRes.data.files[0].id
    } else {
      const newFolder = await drive.files.create({
        requestBody: {
          name: subfolder,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [FOLDER_ID],
        },
        fields: 'id',
      })
      parentId = newFolder.data.id!
    }
  }

  const stream = new Readable()
  stream.push(fileBuffer)
  stream.push(null)

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, name, mimeType, thumbnailLink, webContentLink, createdTime',
  })

  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return res.data as DriveFile
}

/**
 * Delete a file from Drive.
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDriveClient()
  await drive.files.delete({ fileId })
}

/**
 * Get the public URL for a Drive file.
 */
export function getPublicUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${fileId}&export=view`
}

/**
 * Get a thumbnail URL for a Drive file.
 */
export function getThumbnailUrl(fileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`
}
