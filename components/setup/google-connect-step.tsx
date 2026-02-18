'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { SetupData } from './setup-wizard'
import { Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  data: SetupData
  updateData: (partial: Partial<SetupData>) => void
  onNext: () => void
  onBack: () => void
}

type Status = 'idle' | 'validating' | 'creating-sheet' | 'creating-drive' | 'done' | 'error'

async function callSetup(action: string, body: Record<string, unknown>) {
  const res = await fetch('/api/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

export function GoogleConnectStep({ data, updateData, onNext, onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>(data.spreadsheetId ? 'done' : 'idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [serviceEmail, setServiceEmail] = useState('')

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      try {
        JSON.parse(text)
        updateData({ googleKey: btoa(text) })
      } catch {
        setErrorMsg('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  async function handleConnect() {
    if (!data.googleKey) {
      setErrorMsg('Please upload your service account JSON')
      return
    }

    setErrorMsg('')
    try {
      setStatus('validating')
      const validateRes = await callSetup('validate-google', { googleKey: data.googleKey })
      setServiceEmail(validateRes.serviceAccountEmail)

      setStatus('creating-sheet')
      const sheetRes = await callSetup('create-sheet', {
        googleKey: data.googleKey,
        businessName: data.businessName,
      })
      updateData({ spreadsheetId: sheetRes.spreadsheetId, spreadsheetUrl: sheetRes.spreadsheetUrl })

      setStatus('creating-drive')
      const driveRes = await callSetup('setup-drive', {
        googleKey: data.googleKey,
        businessName: data.businessName,
      })
      updateData({ driveFolderId: driveRes.rootFolderId })

      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  const isDone = status === 'done'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Connect Google Workspace</h2>
        <p className="mt-1 text-sm text-subtle">
          Upload your Google Cloud service account JSON key. This creates your content spreadsheet and media folders.
        </p>
      </div>

      <div className="rounded-xl border border-border/30 bg-dark/50 p-4 text-sm text-subtle space-y-2">
        <p className="font-medium text-gray-300">How to get your service account key:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Go to Google Cloud Console</li>
          <li>Create or select a project</li>
          <li>Enable Google Sheets API and Google Drive API</li>
          <li>Go to IAM &amp; Admin &gt; Service Accounts</li>
          <li>Create a service account and download the JSON key</li>
        </ol>
      </div>

      {!isDone && (
        <div
          className="cursor-pointer rounded-xl border-2 border-dashed border-border/50 p-6 text-center transition-colors hover:border-cr0n-cyan/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-subtle" />
          <p className="text-sm text-subtle">
            {data.googleKey ? 'Key loaded — click to replace' : 'Click to upload service-account.json'}
          </p>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
        </div>
      )}

      {status !== 'idle' && (
        <div className="space-y-3">
          <StatusLine done={status !== 'validating'} active={status === 'validating'} label="Validating credentials..." result={serviceEmail ? `Account: ${serviceEmail}` : undefined} />
          <StatusLine done={['creating-drive', 'done'].includes(status)} active={status === 'creating-sheet'} label="Creating content spreadsheet..." result={data.spreadsheetId ? 'Sheet created' : undefined} />
          <StatusLine done={status === 'done'} active={status === 'creating-drive'} label="Creating Drive folder structure..." result={data.driveFolderId ? 'Folders created' : undefined} />
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-cr0n-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        {isDone ? (
          <Button onClick={onNext} className="flex-1">Continue</Button>
        ) : (
          <div className="flex flex-1 gap-2">
            <Button variant="ghost" onClick={onNext}>Skip</Button>
            <Button
              onClick={handleConnect}
              disabled={!data.googleKey || !['idle', 'error'].includes(status)}
              className="flex-1"
            >
              {status === 'error' ? 'Retry' : 'Connect & Create'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusLine({ done, active, label, result }: { done: boolean; active: boolean; label: string; result?: string }) {
  if (!done && !active) return null
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-cr0n-success" />
      ) : (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cr0n-cyan" />
      )}
      <span className={done ? 'text-cr0n-success' : 'text-gray-300'}>{result || label}</span>
    </div>
  )
}
