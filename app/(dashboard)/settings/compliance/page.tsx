'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe, Eye, Lock } from 'lucide-react'
import type { ConsentMode } from '@/components/tracking/consent-provider'

const CONSENT_MODES: { id: ConsentMode; label: string; desc: string; region: string; icon: typeof Shield }[] = [
  {
    id: 'gdpr',
    label: 'GDPR',
    desc: 'Strictest mode. Requires explicit consent before any non-essential tracking. Required for EU visitors.',
    region: 'EU / EEA',
    icon: Shield,
  },
  {
    id: 'ccpa',
    label: 'CCPA',
    desc: 'Tracks by default but honors Global Privacy Control signal. Users can opt out of data selling.',
    region: 'California, USA',
    icon: Globe,
  },
  {
    id: 'essential',
    label: 'Essential Only',
    desc: 'Only essential cookies (session, auth). No analytics or marketing tracking. Simple and safe.',
    region: 'Global',
    icon: Lock,
  },
  {
    id: 'disabled',
    label: 'No Restrictions',
    desc: 'Full tracking without consent banner. Not recommended for public-facing sites.',
    region: 'Internal use',
    icon: Eye,
  },
]

export default function CompliancePage() {
  const [selectedMode, setSelectedMode] = useState<ConsentMode>('essential')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    try {
      await fetch('/api/cms/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'consent_mode', value: selectedMode }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance</h1>
        <p className="mt-1 text-sm text-subtle">Configure cookie consent, privacy policies, and data handling.</p>
      </div>

      {/* Consent Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CONSENT_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => { setSelectedMode(mode.id); setSaved(false) }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedMode === mode.id
                    ? 'border-cr0n-cyan/50 bg-cr0n-cyan/5'
                    : 'border-border/30 bg-dark/50 hover:border-border/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <mode.icon className={`mt-0.5 h-5 w-5 shrink-0 ${
                    selectedMode === mode.id ? 'text-cr0n-cyan' : 'text-subtle'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{mode.label}</p>
                      <Badge variant={selectedMode === mode.id ? 'cyan' : 'gray'}>{mode.region}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-subtle">{mode.desc}</p>
                  </div>
                </div>
              </button>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave}>
                {saved ? 'Saved!' : 'Save Consent Mode'}
              </Button>
              {saved && <span className="text-xs text-cr0n-success">Consent mode updated</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/30 bg-dark/80 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cr0n-cyan/10">
                  <Shield className="h-5 w-5 text-cr0n-cyan" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">We value your privacy</p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {selectedMode === 'gdpr'
                      ? 'We use cookies to enhance your experience. Choose which categories to allow.'
                      : selectedMode === 'ccpa'
                        ? 'We collect information to improve our services. You can opt out anytime.'
                        : selectedMode === 'essential'
                          ? 'We use essential cookies only. No tracking without your permission.'
                          : 'Banner disabled — no consent required.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {selectedMode === 'gdpr' && (
                  <>
                    <Badge variant="gray">Decline</Badge>
                    <Badge variant="gray">Essential Only</Badge>
                    <Badge variant="cyan">Accept All</Badge>
                  </>
                )}
                {selectedMode === 'ccpa' && (
                  <>
                    <Badge variant="gray">Do Not Sell</Badge>
                    <Badge variant="cyan">OK</Badge>
                  </>
                )}
                {selectedMode === 'essential' && <Badge variant="cyan">Got it</Badge>}
                {selectedMode === 'disabled' && (
                  <span className="text-xs text-subtle italic">No banner shown</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-subtle mb-3">
            Auto-generated privacy policy, cookie policy, and terms of service based on your site configuration.
            Available at /privacy, /cookies, and /terms.
          </p>
          <div className="flex gap-2">
            <Badge variant="emerald">Privacy Policy</Badge>
            <Badge variant="emerald">Cookie Policy</Badge>
            <Badge variant="emerald">Terms of Service</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
