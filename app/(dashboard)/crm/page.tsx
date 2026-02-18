'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, ArrowUpRight, Loader2, Mail, Phone, Building } from 'lucide-react'

type Row = Record<string, string>

export default function CrmPage() {
  const [contacts, setContacts] = useState<Row[]>([])
  const [leads, setLeads] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState<Row>({
    first_name: '', last_name: '', email: '', phone: '', company: '', tags: '', source: 'manual',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [contactsRes, leadsRes] = await Promise.all([
        fetch('/api/cms/content?sheet=contacts'),
        fetch('/api/cms/content?sheet=leads'),
      ])
      const contactsData = await contactsRes.json()
      const leadsData = await leadsRes.json()
      setContacts(contactsData.data || [])
      setLeads(leadsData.data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAddContact() {
    const id = String(contacts.length + 1)
    const data = { ...newContact, id, created_at: new Date().toISOString() }
    await fetch('/api/cms/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: 'contacts', data }),
    })
    setShowAddForm(false)
    setNewContact({ first_name: '', last_name: '', email: '', phone: '', company: '', tags: '', source: 'manual' })
    await fetchData()
  }

  const pipelineStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']
  const stageColors: Record<string, string> = {
    New: 'gray', Contacted: 'cyan', Qualified: 'violet', Proposal: 'amber', Won: 'emerald', Lost: 'rose',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM</h1>
          <p className="mt-1 text-sm text-subtle">Manage contacts, leads, and your sales pipeline.</p>
        </div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddForm(true)}>
          Add Contact
        </Button>
      </div>

      {/* Upgrade Banner */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cr0n-violet/10">
                <ArrowUpRight className="h-5 w-5 text-cr0n-violet" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Upgrade to RocketClients</p>
                <p className="text-xs text-subtle">Full CRM with automations, email marketing, and more.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">Learn More</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cr0n-cyan" />
        </div>
      ) : (
        <>
          {/* Pipeline Overview */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Pipeline</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {pipelineStages.map((stage) => {
                const count = leads.filter((l) => l.stage?.toLowerCase() === stage.toLowerCase()).length
                return (
                  <Card key={stage}>
                    <CardContent>
                      <Badge variant={(stageColors[stage] || 'gray') as 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'gray'}>
                        {stage}
                      </Badge>
                      <p className="mt-2 text-xl font-bold text-white">{count}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Add Contact Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>New Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="First Name" value={newContact.first_name} onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })} />
                  <Input label="Last Name" value={newContact.last_name} onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })} />
                  <Input label="Email" type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                  <Input label="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                  <Input label="Company" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} />
                  <Input label="Tags" value={newContact.tags} onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })} hint="Comma-separated" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button onClick={handleAddContact} disabled={!newContact.email}>Save Contact</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contacts Table */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Contacts <span className="text-sm text-subtle font-normal">({contacts.length})</span>
            </h2>
            {contacts.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="py-8 text-center">
                    <Users className="mx-auto mb-3 h-8 w-8 text-subtle" />
                    <p className="text-sm text-subtle">No contacts yet. Add your first contact to get started.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {contacts.map((c, i) => (
                  <Card key={i} hover>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cr0n-cyan/20 to-cr0n-violet/20 text-xs font-bold text-white">
                            {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {c.first_name} {c.last_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-subtle">
                              {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                              {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                              {c.company && <span className="flex items-center gap-1"><Building className="h-3 w-3" />{c.company}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {c.tags?.split(',').filter(Boolean).map((tag) => (
                            <Badge key={tag.trim()} variant="cyan">{tag.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
