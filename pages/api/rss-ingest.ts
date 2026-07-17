import type { NextApiRequest, NextApiResponse } from 'next'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { addEvent, getEvents } from '../../lib/eventsStore'

const FEED_TIMEOUT_MS = 8000

// ===== 全球 55+ 权威 RSS 新闻源 =====
const feeds = [
  // === 中国 ===
  { url: 'https://rsshub.app/xinhua/whxw', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/people/rmw', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/thepaper', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/huanqiu', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/caixin/latest', country: '中国', cat: '商业' },
  { url: 'https://rsshub.app/36kr/motif/最新', country: '中国', cat: '科技' },
  // === 亚洲 ===
  { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', country: '日本', cat: '政治' },
  { url: 'https://en.yna.co.kr/RSS/news.xml', country: '韩国', cat: '政治' },
  { url: 'https://asia.nikkei.com/rss/feed/nar', country: '日本', cat: '商业' },
  { url: 'https://www.straitstimes.com/news/asia/rss.xml', country: '新加坡', cat: '政治' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', country: '印度', cat: '政治' },
  { url: 'https://www.bangkokpost.com/rss/news.xml', country: '泰国', cat: '政治' },
  { url: 'https://www.thejakartapost.com/rss.xml', country: '印度尼西亚', cat: '政治' },
  { url: 'https://vnexpress.net/rss/tin-moi-nhat.rss', country: '越南', cat: '政治' },
  { url: 'https://www.dawn.com/feeds/home', country: '巴基斯坦', cat: '政治' },
  { url: 'https://www.philstar.com/rss/headlines', country: '菲律宾', cat: '政治' },
  // === 欧洲 ===
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', country: '英国', cat: '政治' },
  { url: 'https://www.theguardian.com/world/rss', country: '英国', cat: '政治' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', country: '德国', cat: '政治' },
  { url: 'https://www.france24.com/en/rss', country: '法国', cat: '政治' },
  { url: 'https://feeds.reuters.com/reuters/worldNews', country: '英国', cat: '政治' },
  { url: 'https://www.lemonde.fr/en/rss/une.xml', country: '法国', cat: '政治' },
  { url: 'https://www.ansa.it/english/english_rss.xml', country: '意大利', cat: '政治' },
  { url: 'https://tass.com/rss/v2.xml', country: '俄罗斯', cat: '政治' },
  { url: 'https://www.dailysabah.com/rssFeed/10', country: '土耳其', cat: '政治' },
  // === 美洲 ===
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', country: '美国', cat: '政治' },
  { url: 'https://feeds.npr.org/1001/rss.xml', country: '美国', cat: '政治' },
  { url: 'https://www.cbc.ca/cmlink/rss-world', country: '加拿大', cat: '政治' },
  { url: 'https://www1.folha.uol.com.br/emcimadahora/rss091.xml', country: '巴西', cat: '政治' },
  { url: 'https://www.eluniversal.com.mx/rss.xml', country: '墨西哥', cat: '政治' },
  // === 大洋洲 ===
  { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', country: '澳大利亚', cat: '政治' },
  // === 中东 ===
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', country: '卡塔尔', cat: '政治' },
  { url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', country: '以色列', cat: '政治' },
  { url: 'https://www.arabnews.com/rss.xml', country: '沙特阿拉伯', cat: '政治' },
  { url: 'https://www.tehrantimes.com/rss', country: '伊朗', cat: '政治' },
  // === 非洲 ===
  { url: 'https://allafrica.com/tools/headlines/rss.xml', country: '非洲', cat: '政治' },
  { url: 'https://www.news24.com/rss', country: '南非', cat: '政治' },
  { url: 'https://www.vanguardngr.com/feed/', country: '尼日利亚', cat: '政治' },
  // === 商业/财经 ===
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', country: '美国', cat: '商业' },
  { url: 'https://www.ft.com/rss/home/uk', country: '英国', cat: '商业' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', country: '美国', cat: '商业' },
  // === 科技 ===
  { url: 'https://feeds.feedburner.com/TechCrunch/', country: '美国', cat: '科技' },
  { url: 'https://www.wired.com/feed/rss', country: '美国', cat: '科技' },
  { url: 'https://www.theverge.com/rss/index.xml', country: '美国', cat: '科技' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', country: '美国', cat: '科技' },
  { url: 'https://www.theregister.com/headlines.atom', country: '英国', cat: '科技' },
  // === AI 专业源 ===
  { url: 'https://www.technologyreview.com/feed/', country: '美国', cat: '科技' },
  { url: 'https://www.artificialintelligence-news.com/feed/', country: '英国', cat: '科技' },
  { url: 'https://venturebeat.com/feed/', country: '美国', cat: '科技' },
  { url: 'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml', country: '美国', cat: '科技' },
  // === 能源/气候 ===
  { url: 'https://www.bbc.com/news/science_and_environment/rss.xml', country: '英国', cat: '能源' },
]

const localFallbackFeed = join(process.cwd(), 'feeds', 'sample-rss.xml')

const CATEGORY_COLORS: Record<string,string> = {
  '战争': '#ff4d4f', '能源': '#fbbf24', '科技': '#40a9ff',
  '政治': '#ffffff', '商业': '#a78bfa', '自然灾害': '#fb923c', '网络安全': '#f87171'
}

const CAPITAL_COORDS: Record<string,[number,number]> = {
  '中国': [39.9042,116.4074], '美国': [38.9072,-77.0369], '英国': [51.5074,-0.1278],
  '法国': [48.8566,2.3522], '德国': [52.52,13.405], '俄罗斯': [55.7558,37.6173],
  '日本': [35.6762,139.6503], '韩国': [37.5665,126.978], '印度': [28.6139,77.209],
  '加拿大': [45.4215,-75.6972], '澳大利亚': [-33.8688,151.2093], '巴西': [-15.8267,-47.9218],
  '新加坡': [1.3521,103.8198], '泰国': [13.7563,100.5018], '越南': [21.0278,105.8342],
  '印尼': [-6.2088,106.8456], '菲律宾': [14.5995,120.9842], '马来西亚': [3.139,101.687],
  '沙特阿拉伯': [24.7136,46.6753], '卡塔尔': [25.2854,51.531], '以色列': [31.7683,35.2137],
  '阿联酋': [24.4539,54.3773], '伊朗': [35.6892,51.389], '巴基斯坦': [33.6844,73.0479],
  '南非': [-25.7479,28.2293], '尼日利亚': [9.082,8.6753], '肯尼亚': [-1.2921,36.8219],
  '比利时': [50.8503,4.3517], '瑞士': [46.8182,8.2275], '意大利': [41.9028,12.4964],
  '西班牙': [40.4168,-3.7038], '墨西哥': [19.4326,-99.1332], '非洲': [9.145,40.4897],
}

function detectCategory(title: string, sourceCat: string): string {
  const t = title.toLowerCase()
  if (sourceCat === '科技' || t.match(/ai|芯片|chip|space|太空|rocket|satellite|卫星|量子|quantum|5g|6g|semicon|半导体|新能源|blockchain|区块链|cyber/i)) return '科技'
  if (sourceCat === '能源' || t.match(/石油|oil|天然气|gas|opec|原油|crude|nuclear|核能|carbon|碳中和|climate|气候|energy/i)) return '能源'
  if (sourceCat === '商业' || t.match(/stock|股市|market|bitcoin|加密|crypto|trade|贸易|gdp|经济|economy|inflation|通胀|fed|央行|interest|利率|dollar|美元|汇率/i)) return '商业'
  if (t.match(/war|战争|conflict|冲突|military|军事|missile|导弹|troop|军队|invasion|入侵|strike|空袭|bomb|爆炸|ceasefire|停火/i)) return '战争'
  if (t.match(/earthquake|地震|flood|洪水|hurricane|飓风|typhoon|台风|tsunami|海啸|wildfire|山火|volcano|火山|storm|暴风/i)) return '自然灾害'
  if (t.match(/hack|黑客|ransomware|勒索|breach|泄露|data leak|cyber attack|网络攻击/i)) return '网络安全'
  if (t.match(/president|总统|election|选举|parliament|议会|diplomat|外交|sanction|制裁|summit|峰会|treaty|条约|un |联合国|eu |欧盟|nato|北约/i)) return '政治'
  return '政治'
}

async function fetchFeed(url: string): Promise<{items:any[];source:string}|null> {
  try {
    const Parser = (await eval('require')('rss-parser')) as any
    const p = new Parser({ requestOptions: { timeout: FEED_TIMEOUT_MS, headers: { 'User-Agent': 'AI-WorldMonitor/2.0' } } })
    const feed = await Promise.race([
      p.parseURL(url),
      new Promise<never>((_,r)=>setTimeout(()=>r(new Error('timeout')),FEED_TIMEOUT_MS))
    ])
    return { items: feed.items || [], source: url }
  } catch { return null }
}

async function fetchLocal() {
  if (!existsSync(localFallbackFeed)) return null
  try {
    const Parser = require('rss-parser')
    const p = new Parser()
    const xml = readFileSync(localFallbackFeed, 'utf-8')
    const feed = await p.parseString(xml)
    return { items: feed.items || [], source: 'local' }
  } catch { return null }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const existing = getEvents()
  const existingTitles = new Set(existing.map((e:any) => e.title?.toLowerCase().slice(0,60)))

  let added: any[] = []
  let successCount = 0, failCount = 0

  // 分批抓取
  const BATCH = 8
  for (let i = 0; i < feeds.length; i += BATCH) {
    const batch = feeds.slice(i, i + BATCH)
    const results = await Promise.all(batch.map(f => fetchFeed(f.url)))
    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const feedInfo = batch[j]
      if (!result || !result.items?.length) { failCount++; continue }
      successCount++
      for (const item of result.items.slice(0, 3)) {
        const title = (item.title || '').trim()
        if (!title || title.length < 5) continue
        if (existingTitles.has(title.toLowerCase().slice(0,60))) continue
        existingTitles.add(title.toLowerCase().slice(0,60))

        const cat = detectCategory(title, feedInfo.cat)
        const [lat, lng] = CAPITAL_COORDS[feedInfo.country] || [0,0]

        const ev = {
          id: `rss-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          city: feedInfo.country, country: feedInfo.country, lat, lng,
          category: cat,
          title,
          summary: (item.contentSnippet || item.content || item.summary || '').replace(/<[^>]+>/g,'').slice(0,300),
          color: CATEGORY_COLORS[cat] || '#ffffff',
          timestamp: item.pubDate || item.isoDate || new Date().toISOString(),
        }
        addEvent(ev)
        added.push(ev)
      }
    }
  }

  // Local fallback
  if (added.length === 0) {
    const local = await fetchLocal()
    if (local) {
      for (const item of local.items.slice(0, 5)) {
        const ev = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          city: '未知', country: '未知', lat: 0, lng: 0,
          category: '政治', title: item.title || '本地示例',
          summary: (item.contentSnippet || '').slice(0,200),
          color: '#ffffff', timestamp: new Date().toISOString(),
        }
        addEvent(ev); added.push(ev)
      }
    }
  }

  return res.status(200).json({
    success: true,
    added: added.length,
    totalSources: feeds.length,
    successSources: successCount,
    failedSources: failCount,
    events: added.slice(0, 10),
    timestamp: new Date().toISOString(),
  })
}
