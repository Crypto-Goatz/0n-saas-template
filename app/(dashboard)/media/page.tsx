'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Trash2, Copy, Image, Loader2, CheckCircle2 } from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  createdTime?: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchFiles() {
    setLoading(true)
    try {
      const res = await fetch('/api/cms/media')
      const data = await res.json()
      setFiles(data.files || [])
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('subfolder', 'images')

      await fetch('/api/cms/media', { method: 'POST', body: formData })
      await fetchFiles()
    } catch {}
    setUploading(false)
  }

  async function handleDelete(fileId: string) {
    if (!confirm('Delete this file?')) return
    await fetch(`/api/cms/media?fileId=${fileId}`, { method: 'DELETE' })
    await fetchFiles()
  }

  function copyUrl(fileId: string) {
    const url = `https://drive.google.com/uc?id=${fileId}&export=view`
    navigator.clipboard.writeText(url)
    setCopied(fileId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="mt-1 text-sm text-subtle">Upload and manage images stored in Google Drive.</p>
        </div>
        <Button
          size="sm"
          loading={uploading}
          icon={<Upload className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cr0n-cyan" />
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-12 text-center">
              <Image className="mx-auto mb-3 h-10 w-10 text-subtle" />
              <p className="text-sm text-subtle">No media files yet. Upload your first image.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <Card key={file.id} hover>
              <div className="aspect-square overflow-hidden rounded-t-2xl bg-dark/50">
                {file.thumbnailLink ? (
                  <img
                    src={file.thumbnailLink.replace('=s220', '=s400')}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Image className="h-8 w-8 text-subtle" />
                  </div>
                )}
              </div>
              <CardContent>
                <p className="truncate text-xs font-medium text-white">{file.name}</p>
                <div className="mt-2 flex items-center gap-1">
                  <button
                    onClick={() => copyUrl(file.id)}
                    className="rounded-lg p-1.5 text-subtle hover:bg-muted/50 hover:text-white transition-colors"
                    title="Copy URL"
                  >
                    {copied === file.id ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-cr0n-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="rounded-lg p-1.5 text-subtle hover:bg-cr0n-danger/10 hover:text-cr0n-danger transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
