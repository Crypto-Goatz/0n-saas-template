'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/loading'
import { Globe, TrendingUp, Zap, Clock } from 'lucide-react'

interface SiteData {
  id: string
  name: string
  domain: string | null
  role: string
  created_at: string
}

const statIcons = [Globe, TrendingUp, Zap, Clock]

export default function DashboardPage() {
  const [sites, setSites] = useState<SiteData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => setSites(data.sites || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Sites', value: sites.length, icon: 0 },
    { label: 'Active', value: sites.length, icon: 1 },
    { label: 'Optimizations', value: 0, icon: 2 },
    { label: 'Uptime', value: '99.9%', icon: 3 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-subtle">Overview of your cr0n workspace</p>
      </div>

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
