/**
 * Layer 2: PAGE AI — Page content generation and SEO optimization.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

function getClient(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key is not configured')
  return new GoogleGenerativeAI(key)
}

export interface SEOSuggestions {
  title: string
  description: string
  keywords: string[]
}

/**
 * Generate content for a specific page type.
 */
export async function generatePageContent(
  pageType: string,
  businessContext: string,
  apiKey?: string
): Promise<{ title: string; slug: string; content: string; meta_description: string }> {
  const prompt = `Generate content for a "${pageType}" page on a business website.

Business context: ${businessContext}

Return a JSON object with:
- "title": page title
- "slug": URL-friendly slug
- "content": full page content in HTML
- "meta_description": SEO description (max 155 chars)

Return only valid JSON, no markdown fences.`

  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}

/**
 * Generate SEO metadata for page content.
 */
export async function generateSEO(
  pageContent: string,
  apiKey?: string
): Promise<SEOSuggestions> {
  const prompt = `Analyze the following page content and generate SEO metadata. Return a JSON object with "title" (max 60 chars), "description" (max 155 chars), and "keywords" (array of 5-10 relevant keywords).

Content:
${pageContent}

Return only valid JSON, no markdown fences.`

  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text())
}

/**
 * Improve or rewrite existing page content.
 */
export async function improvePageContent(
  content: string,
  instructions: string,
  apiKey?: string
): Promise<string> {
  const prompt = `Improve the following page content based on these instructions: ${instructions}

Original content:
${content}

Return only the improved content, no explanations or markdown fences.`

  const genAI = getClient(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}
