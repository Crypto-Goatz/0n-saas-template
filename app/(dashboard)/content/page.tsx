'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CMS_TABS, type SheetName } from '@/config/cms-schema'
import { Plus, Trash2, Save, Sparkles, Loader2 } from 'lucide-react'

type Row = Record<string, string>

const cmsTabs = CMS_TABS.filter((t) => t.category === 'cms')

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<SheetName>(cmsTabs[0].key)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editData, setEditData] = useState<Row>({})
  const [addingNew, setAddingNew] = useState(false)
  const [newData, setNewData] = useState<Row>({})

  const fetchData = useCallback(async (sheet: SheetName) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cms/content?sheet=${sheet}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setRows(json.data ?? [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(activeTab)
    setEditingRow(null)
    setAddingNew(false)
  }, [activeTab, fetchData])

  async function handleSave(rowIndex: number) {
    await fetch('/api/cms/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: activeTab, rowIndex, data: editData }),
    })
    setEditingRow(null)
    await fetchData(activeTab)
  }

  async function handleAdd() {
    await fetch('/api/cms/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: activeTab, data: newData }),
    })
    setAddingNew(false)
    setNewData({})
    await fetchData(activeTab)
  }

  async function handleDelete(rowIndex: number) {
    if (!confirm('Delete this row?')) return
    await fetch(`/api/cms/content?sheet=${activeTab}&rowIndex=${rowIndex}`, { method: 'DELETE' })
    await fetchData(activeTab)
  }

  const columns = rows[0] ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Manager</h1>
          <p className="mt-1 text-sm text-subtle">Edit your website content. Changes sync with Google Sheets.</p>
        </div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddingNew(true)}>
          Add Row
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/30">
        {cmsTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-cr0n-cyan text-cr0n-cyan'
                : 'border-transparent text-subtle hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cr0n-cyan" />
          <span className="ml-3 text-subtle">Loading...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add New Row */}
          {addingNew && (
            <Card>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="cyan">New Row</Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setAddingNew(false)}>Cancel</Button>
                      <Button size="sm" icon={<Save className="h-3 w-3" />} onClick={handleAdd}>Save</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {columns.map((col) => (
                      <Input
                        key={col}
                        label={col}
                        value={newData[col] || ''}
                        onChange={(e) => setNewData({ ...newData, [col]: e.target.value })}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rows */}
          {rows.length === 0 && !addingNew ? (
            <Card>
              <CardContent>
                <div className="py-8 text-center">
                  <Sparkles className="mx-auto mb-3 h-8 w-8 text-subtle" />
                  <p className="text-sm text-subtle">No content yet. Add a row or run the Setup Wizard to generate content with AI.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            rows.map((row, i) => (
              <Card key={i} hover>
                <CardContent>
                  {editingRow === i ? (
                    <div className="space-y-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingRow(null)}>Cancel</Button>
                        <Button size="sm" icon={<Save className="h-3 w-3" />} onClick={() => handleSave(i)}>Save</Button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {columns.map((col) => (
                          <div key={col}>
                            {col === 'content' ? (
                              <div>
                                <label className="mb-1 block text-xs font-medium text-subtle">{col}</label>
                                <textarea
                                  value={editData[col] || ''}
                                  onChange={(e) => setEditData({ ...editData, [col]: e.target.value })}
                                  className="w-full rounded-xl border border-border/50 bg-dark/50 px-3 py-2 text-sm text-white focus:border-cr0n-cyan/50 focus:outline-none"
                                  rows={4}
                                />
                              </div>
                            ) : (
                              <Input
                                label={col}
                                value={editData[col] || ''}
                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value })}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => { setEditingRow(i); setEditData({ ...row }) }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">
                            {row.title || row.label || row.name || row.key || row.question || `Row ${i + 1}`}
                          </p>
                          <p className="mt-0.5 text-xs text-subtle truncate">
                            {row.slug || row.description || row.value || row.excerpt || row.answer || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {row.status && <Badge variant={row.status === 'published' ? 'emerald' : 'gray'}>{row.status}</Badge>}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(i) }}
                            className="rounded-lg p-1.5 text-subtle hover:bg-cr0n-danger/10 hover:text-cr0n-danger transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
