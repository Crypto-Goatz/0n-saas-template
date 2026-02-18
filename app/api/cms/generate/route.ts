import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { generateContent, generateSEO, generateBlogPost, generatePageContent } from '@/lib/gemini'

function json(data: object, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * POST /api/cms/generate
 * AI content generation via Gemini
 */
export async function POST(req: NextRequest) {
  const auth = await getAuth()
  if (!auth) return json({ error: 'Unauthorized' }, 401)

  try {
    const { type, context, topic, content, apiKey } = await req.json()

    switch (type) {
      case 'page': {
        if (!context || !topic) {
          return json({ error: 'context and topic required' }, 400)
        }
        const result = await generatePageContent(topic, context, apiKey)
        return json({ result })
      }

      case 'blog': {
        if (!topic || !context) {
          return json({ error: 'topic and context required' }, 400)
        }
        const result = await generateBlogPost(topic, context, apiKey)
        return json({ result })
      }

      case 'seo': {
        if (!content) {
          return json({ error: 'content required for SEO generation' }, 400)
        }
        const result = await generateSEO(content, apiKey)
        return json({ result })
      }

      case 'freeform': {
        if (!content) {
          return json({ error: 'content (prompt) required' }, 400)
        }
        const result = await generateContent(content, apiKey)
        return json({ result })
      }

      default:
        return json({ error: `Unknown type: ${type}. Valid: page, blog, seo, freeform` }, 400)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 500)
  }
}
