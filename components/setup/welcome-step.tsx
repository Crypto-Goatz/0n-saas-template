'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SetupData } from './setup-wizard'
import { Sparkles, Database, Users, Shield } from 'lucide-react'

interface Props {
  data: SetupData
  updateData: (partial: Partial<SetupData>) => void
  onNext: () => void
}

const features = [
  { icon: Database, label: 'Google Sheets CMS', desc: 'Content management via spreadsheets' },
  { icon: Sparkles, label: 'AI Content Generation', desc: 'Gemini-powered pages and blog posts' },
  { icon: Users, label: 'Built-in CRM', desc: 'Contacts, leads, and pipeline tracking' },
  { icon: Shield, label: 'Compliance Layer', desc: 'Cookie consent and privacy policies' },
]

export function WelcomeStep({ data, updateData, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome to Setup</h2>
        <p className="mt-1 text-sm text-subtle">
          This wizard configures your CMS, CRM, and compliance layer. Takes about 5 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-start gap-3 rounded-xl border border-border/30 bg-dark/50 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cr0n-cyan/10">
              <f.icon className="h-4 w-4 text-cr0n-cyan" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{f.label}</p>
              <p className="text-xs text-subtle">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Input
          label="Business Name"
          value={data.businessName}
          onChange={(e) => updateData({ businessName: e.target.value })}
          placeholder="My Awesome SaaS"
        />
        <Input
          label="Industry"
          value={data.businessIndustry}
          onChange={(e) => updateData({ businessIndustry: e.target.value })}
          placeholder="Technology, Marketing, etc."
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={data.businessDescription}
            onChange={(e) => updateData({ businessDescription: e.target.value })}
            placeholder="Brief description of your business..."
            className="w-full rounded-xl border border-border/50 bg-dark/50 px-4 py-2.5 text-sm text-white placeholder-subtle focus:border-cr0n-cyan/50 focus:outline-none"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="md" onClick={() => (window.location.href = '/dashboard')}>
          Skip Setup
        </Button>
        <Button
          size="md"
          onClick={onNext}
          disabled={!data.businessName.trim()}
          className="flex-1"
        >
          Let&apos;s Go
        </Button>
      </div>
    </div>
  )
}
