'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/loading'
import { Globe, TrendingUp, Zap, Clock, FileText, Users, Sparkles, ArrowRight } from 'lucide-react'

interface SiteData {
  id: string
  name: string
  domain: string | null
  role: string
  created_at: string
}

const statIcons = [Globe, TrendingUp, FileText, Users]

export default function DashboardPage() {
  const [sites, setSites] = useState<SiteData[]>([])
  const [loading, setLoading] = useState(true)
  const [setupDone, setSetupDone] = useState(true)
  const [cmsStats, setCmsStats] = useState({ pages: 0, posts: 0, contacts: 0 })

  useEffect(() => {
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => setSites(data.sites || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Check setup status
    fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check-status' }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSetupDone(data.configured === true)
      })
      .catch(() => {})

    // Fetch CMS stats
    Promise.all([
      fetch('/api/cms/content?tab=pages').then((r) => r.json()).catch(() => ({ rows: [] })),
      fetch('/api/cms/content?tab=blog_posts').then((r) => r.json()).catch(() => ({ rows: [] })),
      fetch('/api/cms/content?tab=contacts').then((r) => r.json()).catch(() => ({ rows: [] })),
    ]).then(([pages, posts, contacts]) => {
      setCmsStats({
        pages: pages.rows?.length || 0,
        posts: posts.rows?.length || 0,
        contacts: contacts.rows?.length || 0,
      })
    })
  }, [])

  const stats = [
    { label: 'Total Sites', value: sites.length, icon: 0 },
    { label: 'Active', value: sites.length, icon: 1 },
    { label: 'Pages', value: cmsStats.pages, icon: 2 },
    { label: 'Contacts', value: cmsStats.contacts, icon: 3 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-subtle">Overview of your cr0n workspace</p>
      </div>

      {/* Setup Prompt */}
      {!loading && !setupDone && (
        <Card glow="violet">
          <CardContent>
            <div className="flex items-center gap-4 py-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cr0n-violet/10">
                <Sparkles className="h-6 w-6 text-cr0n-violet" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Complete your setup</p>
                <p className="text-sm text-subtle">
                  Connect Google Sheets, generate content with AI, and configure your CRM in under 5 minutes.
                </p>
              </div>
              <Link href="/setup">
                <Button>
                  Setup Wizard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = statIcons[stat.icon]
          return (
            <Card key={stat.label} hover>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cr0n-cyan/10">
                  <Icon className="h-5 w-5 text-cr0n-cyan" />
                </div>
                <div>
                  <p className="text-xs text-subtle">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/content">
          <Card hover>
            <CardContent>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-cr0n-cyan" />
                <div>
                  <p className="text-sm font-medium text-white">Content Manager</p>
                  <p className="text-xs text-subtle">{cmsStats.pages} pages, {cmsStats.posts} posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/crm">
          <Card hover>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-cr0n-violet" />
                <div>
                  <p className="text-sm font-medium text-white">CRM</p>
                  <p className="text-xs text-subtle">{cmsStats.contacts} contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/content?tab=generate">
          <Card hover>
            <CardContent>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-cr0n-success" />
                <div>
                  <p className="text-sm font-medium text-white">AI Writer</p>
                  <p className="text-xs text-subtle">Generate pages & posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Sites */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Your Sites</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : sites.length === 0 ? (
          <Card>
            <CardContent>
              <div className="py-8 text-center">
                <Globe className="mx-auto mb-3 h-10 w-10 text-subtle" />
                <p className="text-sm text-subtle">No sites yet. Create your first site to get started.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sites.map((site) => (
              <Card key={site.id} hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{site.name}</CardTitle>
                    <Badge variant="cyan">{site.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-subtle">
                    {site.domain || 'No domain configured'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
