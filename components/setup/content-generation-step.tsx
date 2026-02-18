'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SetupData } from './setup-wizard'
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

interface Props {
  data: SetupData
  updateData: (partial: Partial<SetupData>) => void
  onNext: () => void
  onBack: () => void
}

type Status = 'idle' | 'generating' | 'done' | 'error'

export function ContentGenerationStep({ data, updateData, onNext, onBack }: Props) {
  const [status, setStatus] = useState<Status>(data.contentGenerated ? 'done' : 'idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})

  async function handleGenerate() {
    if (!data.geminiKey.trim()) {
      setErrorMsg('Enter your Gemini API key')
      return
    }

    if (!data.spreadsheetId) {
      setErrorMsg('Complete Google setup first (Step 2)')
      return
    }

    setErrorMsg('')
    setStatus('generating')

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-content',
          googleKey: data.googleKey,
          spreadsheetId: data.spreadsheetId,
          geminiKey: data.geminiKey,
          businessInfo: {
            name: data.businessName,
            industry: data.businessIndustry,
            description: data.businessDescription,
          },
        }),
      })

      const result = await res.json()
      if (result.error) throw new Error(result.error)

      setCounts(result)
      updateData({ contentGenerated: true })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Content generation failed')
    }
  }

  function handleSkip() {
    updateData({ geminiKey: '', contentGenerated: false })
    onNext()
  }

  const isDone = status === 'done'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Content Generation</h2>
        <p className="mt-1 text-sm text-subtle">
          Enter your Gemini API key to generate starter content — pages, blog posts, navigation, and site config.
        </p>
      </div>

      <div className="rounded-xl border border-border/30 bg-dark/50 p-4 text-sm text-subtle">
        Get a free Gemini API key from <span className="text-cr0n-cyan">aistudio.google.com</span>
      </div>

      {!isDone && (
        <Input
          label="Gemini API Key"
          type="password"
          value={data.geminiKey}
          onChange={(e) => updateData({ geminiKey: e.target.value })}
          placeholder="AIza..."
        />
      )}

      {status === 'generating' && (
        <div className="flex items-center gap-3 text-sm text-cr0n-cyan">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generating content with AI... this may take a minute</span>
        </div>
      )}

      {isDone && (
        <div className="rounded-xl border border-cr0n-success/30 bg-cr0n-success/10 p-4 space-y-2">
          <div className="flex items-center gap-2 font-medium text-cr0n-success">
            <Sparkles className="h-5 w-5" />
            Content generated and written to your spreadsheet!
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 sm:grid-cols-4">
            {counts.pages ? <div><CheckCircle2 className="mr-1 inline h-3 w-3 text-cr0n-success" />{counts.pages} pages</div> : null}
            {counts.blog_posts ? <div><CheckCircle2 className="mr-1 inline h-3 w-3 text-cr0n-success" />{counts.blog_posts} posts</div> : null}
            {counts.navigation ? <div><CheckCircle2 className="mr-1 inline h-3 w-3 text-cr0n-success" />{counts.navigation} nav items</div> : null}
            {counts.site_config ? <div><CheckCircle2 className="mr-1 inline h-3 w-3 text-cr0n-success" />{counts.site_config} configs</div> : null}
          </div>
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
            <Button variant="ghost" onClick={handleSkip}>Skip</Button>
            <Button
              onClick={handleGenerate}
              disabled={status === 'generating'}
              className="flex-1"
            >
              {status === 'error' ? 'Retry' : 'Generate'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
