/**
 * Layer 3: BLOG AI — Content calendar and production schedule.
 */

import type { Row } from '../core/types'

export interface CalendarEntry {
  id: string
  title: string
  keyword: string
  targetDate: string
  status: 'planned' | 'drafting' | 'review' | 'published' | 'refresh'
  assignedTo: string
  postId: string
}

/**
 * Create a calendar entry row for sheet storage.
 */
export function calendarEntryToRow(entry: CalendarEntry): Row {
  return {
    id: entry.id,
    title: entry.title,
    keyword: entry.keyword,
    target_date: entry.targetDate,
    status: entry.status,
    assigned_to: entry.assignedTo,
    post_id: entry.postId,
  }
}

/**
 * Parse a row into a CalendarEntry.
 */
export function rowToCalendarEntry(row: Row): CalendarEntry {
  return {
    id: row.id || '',
    title: row.title || '',
    keyword: row.keyword || '',
    targetDate: row.target_date || '',
    status: (row.status as CalendarEntry['status']) || 'planned',
    assignedTo: row.assigned_to || '',
    postId: row.post_id || '',
  }
}

/**
 * Get entries due for action (past target date, not yet published).
 */
export function getOverdueEntries(entries: CalendarEntry[]): CalendarEntry[] {
  const now = new Date()
  return entries.filter(e => {
    if (e.status === 'published') return false
    const target = new Date(e.targetDate)
    return target < now
  })
}

/**
 * Get entries scheduled for the next N days.
 */
export function getUpcomingEntries(entries: CalendarEntry[], days: number): CalendarEntry[] {
  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return entries.filter(e => {
    const target = new Date(e.targetDate)
    return target >= now && target <= future && e.status !== 'published'
  })
}
