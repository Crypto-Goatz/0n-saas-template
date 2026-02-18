'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { SetupData } from './setup-wizard'
import { CheckCircle2, XCircle, Loader2, Rocket } from 'lucide-react'

interface Props {
  data: SetupData
  onBack: () => void
  onComplete: () => void
}

export function ReviewStep({ data, onBack, onComplete }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const checks = [
    { label: 'Google Sheets CMS', done: !!data.spreadsheetId },
    { label: 'Google Drive Media', done: !!data.driveFolderId },
    { label: 'AI Content Generated', done: data.contentGenerated },
    { label: 'CRM Configured', done: data.crmMode !== 'skip' },
  ]

  async function handleLaunch() {
    setSaving(true)
    setError('')

    try {
      // Save config to spreadsheet if Google is connected
      if (data.spreadsheetId && data.googleKey) {
        await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save-config',
            googleKey: data.googleKey,
            spreadsheetId: data.spreadsheetId,
            config: {
              business_name: data.businessName,
              business_industry: data.businessIndustry,
              business_description: data.businessDescription,
              consent_mode: 'essential',
              crm_mode: data.crmMode,
              setup_complete: 'true',
            },
          }),
        })
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Review & Launch</h2>
        <p className="mt-1 text-sm text-subtle">
          Here&apos;s what&apos;s been configured. You can always change these later in Settings.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border/30 bg-dark/50 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-300">Business</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-subtle">Name</div>
            <div className="text-white">{data.businessName || '—'}</div>
            <div className="text-subtle">Industry</div>
            <div className="text-white">{data.businessIndustry || '—'}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border/30 bg-dark/50 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-300">Setup Status</p>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 text-cr0n-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-subtle" />
                )}
                <span className={c.done ? 'text-white' : 'text-subtle'}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {data.spreadsheetUrl && (
          <div className="rounded-xl border border-border/30 bg-dark/50 p-4 text-sm">
            <p className="text-subtle">Spreadsheet</p>
            <a
              href={data.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cr0n-cyan hover:underline"
            >
              Open in Google Sheets
            </a>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-cr0n-danger">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button
          onClick={handleLaunch}
          loading={saving}
          className="flex-1"
          icon={<Rocket className="h-4 w-4" />}
        >
          Launch Dashboard
        </Button>
      </div>
    </div>
  )
}
