import type { NextApiRequest, NextApiResponse } from 'next'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { addEvent } from '../../lib/eventsStore'

/** Absolute deadline in ms for any single remote feed fetch */
const FEED_TIMEOUT_MS = 5000

const feeds = [
  // Asia
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www3.nhk.or.jp/rss/news/cat0.xml',
  'https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
  // Europe
  'https://www.theguardian.com/world/rss',
  'https://rss.dw.com/rdf/rss-en-all',
  'https://www.france24.com/en/rss',
  // Americas
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://www.cbc.ca/cmlink/rss-world',
  // Middle East
  'https://www.aljazeera.com/xml/rss/all.xml',
  // Africa
  'https://allafrica.com/tools/headlines/rss.xml',
  // Business
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362',
  // Tech
  'https://feeds.feedburner.com/TechCrunch/',
  'https://www.wired.com/feed/rss'
]

const localFallbackFeed = join(process.cwd(), 'feeds', 'sample-rss.xml')

function colorForCategory(cat: string) {
  if (!cat) return '#999999'
  const c = cat.toLowerCase()
  if (c.includes('polit') || c.includes('gov')) return '#ff4d4f'
  if (c.includes('tech') || c.includes('science')) return '#40a9ff'
  if (c.includes('energy') || c.includes('oil')) return '#f7b500'
  return '#9b59b6'
}

/** Minimal RSS item shape */
interface RssItem {
  title?: string
  contentSnippet?: string
  content?: string
  summary?: string
  categories?: string[]
  creator?: string
}

/** Fetch one feed with hard timeout; returns parsed items or null on failure */
async function fetchFeed(url: string): Promise<{ items: RssItem[]; source: string } | null> {
  try {
    const parser = new (require('rss-parser'))({
      requestOptions: {
        timeout: FEED_TIMEOUT_MS,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-news/1.0; +https://example.com)'
        }
      }
    })

    const feedPromise = parser.parseURL(url)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), FEED_TIMEOUT_MS)
    )

    const feed = await Promise.race([feedPromise, timeoutPromise])
    return { items: (feed.items || []) as RssItem[], source: url }
  } catch {
    return null
  }
}

/** Parse local sample-rss.xml; returns parsed items or null */
async function fetchLocalFeed(): Promise<{ items: RssItem[]; source: string } | null> {
  if (!existsSync(localFallbackFeed)) return null
  try {
    const parser = new (require('rss-parser'))()
    const xml = readFileSync(localFallbackFeed, 'utf-8')
    const feed = await parser.parseString(xml)
    return { items: (feed.items || []) as RssItem[], source: 'local-sample' }
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Run remote + local in parallel
    const remoteResults = await Promise.all(feeds.map(fetchFeed))
    const localResult = await fetchLocalFeed()

    const added: any[] = []
    const errors: string[] = []

    // Process remote results
    for (const result of remoteResults) {
      if (!result) continue
      for (const item of result.items.slice(0, 5)) {
        const ev = {
          id: `rss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          city: item.categories?.[0] || '未知',
          country: item.creator || '未知',
          lat: 0,
          lng: 0,
          category: item.categories?.[0] || (item.categories ? item.categories.join(',') : '新闻'),
          title: item.title || '无标题',
          summary: item.contentSnippet || item.content || item.summary || '',
          color: colorForCategory(item.categories?.[0] || item.title || '')
        }
        addEvent(ev)
        added.push(ev)
      }
    }

    // Process local fallback
    if (localResult) {
      for (const item of localResult.items.slice(0, 5)) {
        const ev = {
          id: `rss-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          city: item.categories?.[0] || '本地',
          country: item.creator || '本地',
          lat: 0,
          lng: 0,
          category: item.categories?.[0] || (item.categories ? item.categories.join(',') : '本地新闻'),
          title: item.title || '本地示例',
          summary: item.contentSnippet || item.content || item.summary || '',
          color: colorForCategory(item.categories?.[0] || item.title || '')
        }
        addEvent(ev)
        added.push(ev)
      }
    } else {
      errors.push('Local fallback RSS feed not found or failed to parse.')
    }

    // Report
    if (added.length === 0) {
      return res.status(500).json({ error: 'No feeds ingested', details: errors })
    }
    return res.status(200).json({ added, total: added.length, warnings: errors })
  } catch (err: any) {
    return res.status(500).json({ error: String(err && err.message ? err.message : err) })
  }
}
