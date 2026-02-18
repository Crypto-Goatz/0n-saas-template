/**
 * Layer 3: BLOG AI — Barrel export.
 * Blog production pipeline, keyword targeting, content refresh.
 */

// Generator
export { generateBlogPost, generateBlogOutline, refreshBlogPost, generateContent } from './generator'
export type { BlogDraft, BlogOutline } from './generator'

// Keyword Analyzer
export { analyzeKeywordPerformance, identifyKeywordGaps, buildTopicClusters } from './keyword-analyzer'
export type { KeywordData, KeywordGap, TopicCluster } from './keyword-analyzer'

// Content Calendar
export { calendarEntryToRow, rowToCalendarEntry, getOverdueEntries, getUpcomingEntries } from './content-calendar'
export type { CalendarEntry } from './content-calendar'

// Optimizer
export { detectDecay, suggestInternalLinks, generateArticleSchema } from './optimizer'
export type { DecaySignal } from './optimizer'

// Agent
export { scanBlogPosts, createBlogLearningRecord } from './agent'

// Manifest
export { manifest } from './manifest'
