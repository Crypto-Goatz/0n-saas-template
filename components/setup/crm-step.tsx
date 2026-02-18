'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SetupData } from './setup-wizard'
import { Users, ArrowUpRight, CheckCircle2 } from 'lucide-react'

interface Props {
  data: SetupData
  updateData: (partial: Partial<SetupData>) => void
  onNext: () => void
  onBack: () => void
}

export function CrmStep({ data, updateData, onNext, onBack }: Props) {
  const [mode, setMode] = useState<'sheets' | 'rocketclients' | 'skip'>(data.crmMode || 'sheets')

  function handleContinue() {
    updateData({ crmMode: mode })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">CRM Setup</h2>
        <p className="mt-1 text-sm text-subtle">
          Choose how to manage your contacts and leads.
        </p>
      </div>

      <div className="space-y-3">
        {/* Option A: Sheets CRM */}
        <button
          onClick={() => setMode('sheets')}
          className={`w-full rounded-xl border p-4 text-left transition-all ${
            mode === 'sheets'
              ? 'border-cr0n-cyan/50 bg-cr0n-cyan/5'
              : 'border-border/30 bg-dark/50 hover:border-border/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              mode === 'sheets' ? 'bg-cr0n-cyan/20' : 'bg-muted/30'
            }`}>
              <Users className={`h-5 w-5 ${mode === 'sheets' ? 'text-cr0n-cyan' : 'text-subtle'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">Google Sheets CRM</p>
                {mode === 'sheets' && <CheckCircle2 className="h-4 w-4 text-cr0n-cyan" />}
              </div>
              <p className="mt-0.5 text-xs text-subtle">
                Free tier — contacts, leads, and pipeline managed in your spreadsheet.
                Sync to RocketClients anytime with one click.
              </p>
            </div>
          </div>
        </button>

        {/* Option B: RocketClients */}
        <button
          onClick={() => setMode('rocketclients')}
          className={`w-full rounded-xl border p-4 text-left transition-all ${
            mode === 'rocketclients'
              ? 'border-cr0n-violet/50 bg-cr0n-violet/5'
              : 'border-border/30 bg-dark/50 hover:border-border/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              mode === 'rocketclients' ? 'bg-cr0n-violet/20' : 'bg-muted/30'
            }`}>
              <ArrowUpRight className={`h-5 w-5 ${mode === 'rocketclients' ? 'text-cr0n-violet' : 'text-subtle'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">Connect RocketClients</p>
                {mode === 'rocketclients' && <CheckCircle2 className="h-4 w-4 text-cr0n-violet" />}
              </div>
              <p className="mt-0.5 text-xs text-subtle">
                Full CRM with automations, pipelines, email marketing, and more.
                Requires a RocketClients account.
              </p>
            </div>
          </div>
        </button>
      </div>

      {mode === 'rocketclients' && (
        <Input
          label="CRM Private Integration Token (PIT)"
          type="password"
          value={data.crmPit}
          onChange={(e) => updateData({ crmPit: e.target.value })}
          placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          hint="Find this in your CRM Settings > Integrations > Private Integration Tokens"
        />
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <div className="flex flex-1 gap-2">
          <Button variant="ghost" onClick={() => { updateData({ crmMode: 'skip' }); onNext() }}>
            Skip
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
