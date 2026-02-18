/**
 * Layer 3: BLOG AI — Blog content generation and refresh.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

function getClient(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key is not configured')
  return new GoogleGenerativeAI(key)
}

export interface BlogDraft {
  title: string
  slug: string
  excerpt: string
  content: string
}

export interface BlogOutline {
  title: string
  slug: string
  sections: { heading: string; points: string[] }[]
  targetKeyword: string
}

/**
 * Generate a full blog post draft.
 */
export async function generateBlogPost(
  topic: string,
  businessContext: string,
  apiKey?: string
): Promise<BlogDraft> {
  const prompt = `Write a professional blog post for a business website.

Business context: ${businessContext}
Topic: ${topic}

Return a JSON object with:
- "title": engaging blog post title
- "slug": URL-friendly slug (lowercase, hyphens)
- "excerpt": 1-2 sentence summary (max 200 chars)
- "content": full blog post in HTML (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags)

The content should be 500-800 words, professional, and SEO-optimized.
Return only valid JSON, no markdown fences.`

  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}

/**
 * Generate a blog post outline for editorial review.
 */
export async function generateBlogOutline(
  keyword: string,
  businessContext: string,
  apiKey?: string
): Promise<BlogOutline> {
  const prompt = `Create a detailed blog post outline targeting the keyword "${keyword}".

Business context: ${businessContext}

Return a JSON object with:
- "title": SEO-optimized title including the keyword
- "slug": URL-friendly slug
- "targetKeyword": "${keyword}"
- "sections": array of { "heading": "H2 heading", "points": ["key point 1", "key point 2"] }

Include 4-6 sections. Return only valid JSON, no markdown fences.`

  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}

/**
 * Refresh an existing blog post to improve rankings.
 */
export async function refreshBlogPost(
  existingContent: string,
  keyword: string,
  reason: string,
  apiKey?: string
): Promise<string> {
  const prompt = `Refresh the following blog post to improve its search rankings.

Target keyword: ${keyword}
Reason for refresh: ${reason}

Instructions:
- Update any outdated information
- Strengthen keyword usage naturally
- Add new relevant sections if needed
- Improve internal linking suggestions (mark with [INTERNAL_LINK: topic])
- Keep the same tone and structure

Original content:
${existingContent}

Return only the improved HTML content, no explanations or markdown fences.`

  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

/**
 * Generate freeform content from a prompt (shared utility).
 */
export async function generateContent(
  prompt: string,
  apiKey?: string
): Promise<string> {
  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}
