'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { WelcomeStep } from './welcome-step'
import { GoogleConnectStep } from './google-connect-step'
import { ContentGenerationStep } from './content-generation-step'
import { CrmStep } from './crm-step'
import { ReviewStep } from './review-step'

export interface SetupData {
  googleKey: string
  spreadsheetId: string
  spreadsheetUrl: string
  driveFolderId: string
  geminiKey: string
  contentGenerated: boolean
  crmMode: 'sheets' | 'rocketclients' | 'skip'
  crmPit: string
  businessName: string
  businessIndustry: string
  businessDescription: string
}

const STEPS = ['Welcome', 'Google Connect', 'Content', 'CRM', 'Review']
const STORAGE_KEY = 'cr0n-setup-wizard'

export function SetupWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<SetupData>({
    googleKey: '',
    spreadsheetId: '',
    spreadsheetUrl: '',
    driveFolderId: '',
    geminiKey: '',
    contentGenerated: false,
    crmMode: 'sheets',
    crmPit: '',
    businessName: '',
    businessIndustry: '',
    businessDescription: '',
  })

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setData((prev) => ({ ...prev, ...parsed.data }))
        setStep(parsed.step || 0)
      }
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }))
    } catch {}
  }, [step, data])

  function updateData(partial: Partial<SetupData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleComplete() {
    localStorage.removeItem(STORAGE_KEY)
    window.location.href = '/dashboard'
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < step
                  ? 'bg-cr0n-success text-void'
                  : i === step
                    ? 'bg-cr0n-cyan text-void'
                    : 'bg-muted/50 text-subtle'
              }`}
            >
              {i < step ? '\u2713' : i + 1}
            </div>
            <span className={`hidden text-xs sm:inline ${i === step ? 'text-white font-medium' : 'text-subtle'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-4 bg-border/50 sm:w-8" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent>
          <div className="py-2">
            {step === 0 && <WelcomeStep data={data} updateData={updateData} onNext={next} />}
            {step === 1 && <GoogleConnectStep data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 2 && <ContentGenerationStep data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 3 && <CrmStep data={data} updateData={updateData} onNext={next} onBack={back} />}
            {step === 4 && <ReviewStep data={data} onBack={back} onComplete={handleComplete} />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
