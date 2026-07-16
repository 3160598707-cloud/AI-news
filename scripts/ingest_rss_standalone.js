/**
 * 独立 RSS 采集脚本（不依赖 Next.js 服务器）
 * 用于 GitHub Actions 定时任务
 */
const Parser = require('rss-parser')
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')

const DATA_FILE = join(__dirname, '..', 'data', 'events.json')
const LOCAL_FEED = join(__dirname, '..', 'feeds', 'sample-rss.xml')

const REMOTE_FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www3.nhk.or.jp/rss/news/cat0.xml',
  'https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
  'https://www.theguardian.com/world/rss',
  'https://rss.dw.com/rdf/rss-en-all',
  'https://www.france24.com/en/rss',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://www.cbc.ca/cmlink/rss-world',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://allafrica.com/tools/headlines/rss.xml',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362',
  'https://feeds.feedburner.com/TechCrunch/',
  'https://www.wired.com/feed/rss'
]

const FEED_TIMEOUT_MS = 8000

function colorForCategory(cat) {
  if (!cat) return '#999999'
  const c = cat.toLowerCase()
  if (c.includes('polit') || c.includes('gov')) return '#ff4d4f'
  if (c.includes('tech') || c.includes('science')) return '#40a9ff'
  if (c.includes('energy') || c.includes('oil')) return '#f7b500'
  return '#9b59b6'
}

async function fetchFeed(parser, url) {
  try {
    const promise = parser.parseURL(url)
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), FEED_TIMEOUT_MS)
    )
    const feed = await Promise.race([promise, timeout])
    return { items: feed.items || [], source: url }
  } catch {
    return null
  }
}

async function fetchLocal(parser) {
  if (!existsSync(LOCAL_FEED)) return null
  try {
    const xml = readFileSync(LOCAL_FEED, 'utf-8')
    const feed = await parser.parseString(xml)
    return { items: feed.items || [], source: 'local-sample' }
  } catch {
    return null
  }
}

async function main() {
  const parser = new Parser({
    requestOptions: {
      timeout: FEED_TIMEOUT_MS,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-news/1.0)' }
    }
  })

  // Load existing events
  let events = []
  if (existsSync(DATA_FILE)) {
    try { events = JSON.parse(readFileSync(DATA_FILE, 'utf-8')) } catch {}
  }

  const newEvents = []

  // Fetch remote feeds
  const remoteResults = await Promise.all(REMOTE_FEEDS.map(u => fetchFeed(parser, u)))
  for (const result of remoteResults) {
    if (!result) continue
    for (const item of result.items.slice(0, 3)) {
      newEvents.push({
        id: `rss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        city: item.categories?.[0] || '未知',
        country: item.creator || '未知',
        lat: 0, lng: 0,
        category: item.categories?.[0] || '新闻',
        title: item.title || '无标题',
        summary: (item.contentSnippet || item.content || '').slice(0, 200),
        color: colorForCategory(item.categories?.[0] || '')
      })
    }
  }

  // Local fallback
  const localResult = await fetchLocal(parser)
  if (localResult && newEvents.length === 0) {
    for (const item of localResult.items.slice(0, 3)) {
      newEvents.push({
        id: `rss-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        city: item.categories?.[0] || '本地',
        country: item.creator || '本地',
        lat: 0, lng: 0,
        category: item.categories?.[0] || '本地新闻',
        title: item.title || '本地示例',
        summary: (item.contentSnippet || item.content || '').slice(0, 200),
        color: colorForCategory(item.categories?.[0] || '')
      })
    }
  }

  if (newEvents.length > 0) {
    events = [...newEvents, ...events].slice(0, 50) // 保留最多 50 条
    const dir = join(__dirname, '..', 'data')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(events, null, 2))
    console.log(`Ingested ${newEvents.length} new events. Total: ${events.length}`)
  } else {
    console.log('No new events ingested.')
  }
}

main().catch((err) => {
  console.error('Ingest failed:', err.message)
  process.exit(1)
})
