/**
 * 独立 RSS 采集脚本 — 全球 40+ 权威新闻源
 * 用于 GitHub Actions 定时任务 / 手动运行
 */
const Parser = require('rss-parser')
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')

const DATA_FILE = join(__dirname, '..', 'data', 'events.json')
const LOCAL_FEED = join(__dirname, '..', 'feeds', 'sample-rss.xml')

// ===== 全球 40+ 权威 RSS 新闻源 =====
const REMOTE_FEEDS = [
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

  // === 欧洲 ===
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', country: '英国', cat: '政治' },
  { url: 'https://www.theguardian.com/world/rss', country: '英国', cat: '政治' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', country: '德国', cat: '政治' },
  { url: 'https://www.france24.com/en/rss', country: '法国', cat: '政治' },
  { url: 'https://feeds.reuters.com/reuters/worldNews', country: '英国', cat: '政治' },
  { url: 'https://www.lemonde.fr/en/rss/une.xml', country: '法国', cat: '政治' },
  { url: 'https://www.ansa.it/english/english_rss.xml', country: '意大利', cat: '政治' },
  { url: 'https://www.themoscowtimes.com/rss/news', country: '俄罗斯', cat: '政治' },

  // === 美洲 ===
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', country: '美国', cat: '政治' },
  { url: 'https://feeds.npr.org/1001/rss.xml', country: '美国', cat: '政治' },
  { url: 'https://www.cbc.ca/cmlink/rss-world', country: '加拿大', cat: '政治' },
  { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', country: '美国', cat: '政治' },
  { url: 'https://rss.app/feeds/1dPVAfDrPJNrHGb5.xml', country: '巴西', cat: '政治' }, // AP News LatAm

  // === 中东 ===
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', country: '卡塔尔', cat: '政治' },
  { url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', country: '以色列', cat: '政治' },
  { url: 'https://www.arabnews.com/rss.xml', country: '沙特阿拉伯', cat: '政治' },

  // === 非洲 ===
  { url: 'https://allafrica.com/tools/headlines/rss.xml', country: '非洲', cat: '政治' },

  // === 商业/财经 ===
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', country: '美国', cat: '商业' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', country: '美国', cat: '商业' },
  { url: 'https://www.ft.com/rss/home/uk', country: '英国', cat: '商业' },
  { url: 'https://www.economist.com/finance-and-economics/rss.xml', country: '英国', cat: '商业' },

  // === 科技 ===
  { url: 'https://feeds.feedburner.com/TechCrunch/', country: '美国', cat: '科技' },
  { url: 'https://www.wired.com/feed/rss', country: '美国', cat: '科技' },
  { url: 'https://www.theverge.com/rss/index.xml', country: '美国', cat: '科技' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', country: '美国', cat: '科技' },

  // === 能源/气候 ===
  { url: 'https://www.reuters.com/arcx-outboundfeeds/energy/?outputType=xml', country: '英国', cat: '能源' },
  { url: 'https://www.bbc.com/news/science_and_environment/rss.xml', country: '英国', cat: '科技' },
]

const FEED_TIMEOUT_MS = 12000

// ===== 智能分类 =====
function detectCategory(title, sourceCat, sourceCountry) {
  const t = (title || '').toLowerCase()
  const c = (sourceCat || '').toLowerCase()
  // 科技
  if (c === '科技' || t.match(/ai|artificial intelligence|芯片|chip|量子|quantum|卫星|satellite|space|太空|航天|rocket|5g|6g|半导体|semicon|新能源|光伏|solar|blockchain|区块链|cyber|网络安全/i)) return '科技'
  // 能源
  if (c === '能源' || t.match(/石油|oil|天然气|gas|opec|原油|crude|核能|nuclear|风电|wind power|碳中和|carbon|climate|气候/i)) return '能源'
  // 商业
  if (c === '商业' || t.match(/stock|股市|market|bitcoin|加密|crypto|trade|贸易|gdp|经济|economy|inflation|通胀|fed|央行|interest rate|利率|dollar|美元|汇率/i)) return '商业'
  // 战争
  if (t.match(/war|战争|conflict|冲突|military|军事|missile|导弹|troop|军队|invasion|入侵|strike|空袭|bomb|爆炸|ceasefire|停火/i)) return '战争'
  // 自然灾害
  if (t.match(/earthquake|地震|flood|洪水|hurricane|飓风|typhoon|台风|tsunami|海啸|wildfire|山火|volcano|火山|storm|暴风|landslide|滑坡/i)) return '自然灾害'
  // 网络安全
  if (t.match(/hack|黑客|ransomware|勒索|breach|泄露|data leak|cyber attack|网络攻击/i)) return '网络安全'
  // 政治
  if (t.match(/president|总统|election|选举|parliament|议会|senate|参议院|diplomat|外交|sanction|制裁|summit|峰会|treaty|条约|un |联合国|eu |欧盟|nato|北约/i)) return '政治'
  return '政治' // default
}

// ===== 智能国家提取 =====
function detectCountry(item, sourceCountry) {
  if (item.categories && item.categories.length > 0) {
    for (const cat of item.categories) {
      const known = ['中国','美国','日本','韩国','印度','英国','法国','德国','俄罗斯','巴西','加拿大','澳大利亚','新加坡','泰国','越南','印尼']
      if (known.includes(cat)) return cat
    }
  }
  return sourceCountry || '未知'
}

// ===== 城市坐标映射 =====
const CITY_COORDS = {
  '北京': [39.9042, 116.4074], '上海': [31.2304, 121.4737], '深圳': [22.5429, 114.0596],
  '华盛顿': [38.9072, -77.0369], '纽约': [40.7128, -74.0060], '洛杉矶': [34.0522, -118.2437],
  '伦敦': [51.5074, -0.1278], '巴黎': [48.8566, 2.3522], '柏林': [52.5200, 13.4050],
  '莫斯科': [55.7558, 37.6173], '东京': [35.6762, 139.6503], '首尔': [37.5665, 126.9780],
  '新德里': [28.6139, 77.2090], '悉尼': [-33.8688, 151.2093], '新加坡': [1.3521, 103.8198],
  '布鲁塞尔': [50.8503, 4.3517], '日内瓦': [46.2044, 6.1432], '香港': [22.3193, 114.1694],
  '台北': [25.0330, 121.5654], '雅加达': [-6.2088, 106.8456], '曼谷': [13.7563, 100.5018],
  '河内': [21.0278, 105.8342], '马尼拉': [14.5995, 120.9842], '吉隆坡': [3.1390, 101.6870],
  '迪拜': [25.2048, 55.2708], '利雅得': [24.7136, 46.6753], '多哈': [25.2854, 51.5310],
  '耶路撒冷': [31.7683, 35.2137], '开罗': [30.0444, 31.2357], '开普敦': [-33.9249, 18.4241],
  '拉各斯': [6.5244, 3.3792], '内罗毕': [-1.2921, 36.8219],
  '圣保罗': [-23.5505, -46.6333], '墨西哥城': [19.4326, -99.1332],
  '罗马': [41.9028, 12.4964], '马德里': [40.4168, -3.7038],
  '德黑兰': [35.6892, 51.3890], '伊斯兰堡': [33.6844, 73.0479],
}

function getCityCoords(country) {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    // simple match — return capital coords for country
  }
  // Default: use country capital
  const capitals = {
    '中国': [39.9042, 116.4074], '美国': [38.9072, -77.0369], '英国': [51.5074, -0.1278],
    '法国': [48.8566, 2.3522], '德国': [52.5200, 13.4050], '俄罗斯': [55.7558, 37.6173],
    '日本': [35.6762, 139.6503], '韩国': [37.5665, 126.9780], '印度': [28.6139, 77.2090],
    '加拿大': [45.4215, -75.6972], '澳大利亚': [-33.8688, 151.2093], '巴西': [-15.8267, -47.9218],
    '新加坡': [1.3521, 103.8198], '泰国': [13.7563, 100.5018], '越南': [21.0278, 105.8342],
    '印尼': [-6.2088, 106.8456], '菲律宾': [14.5995, 120.9842], '马来西亚': [3.1390, 101.6870],
    '沙特阿拉伯': [24.7136, 46.6753], '卡塔尔': [25.2854, 51.5310], '以色列': [31.7683, 35.2137],
    '阿拉伯联合酋长国': [24.4539, 54.3773], '伊朗': [35.6892, 51.3890], '巴基斯坦': [33.6844, 73.0479],
    '南非': [-25.7479, 28.2293], '尼日利亚': [9.0820, 8.6753], '肯尼亚': [-1.2921, 36.8219],
    '比利时': [50.8503, 4.3517], '瑞士': [46.8182, 8.2275], '意大利': [41.9028, 12.4964],
    '西班牙': [40.4168, -3.7038], '墨西哥': [19.4326, -99.1332],
  }
  return capitals[country] || [0, 0]
}

const CATEGORY_COLORS = {
  '战争': '#ff4d4f', '能源': '#fbbf24', '科技': '#40a9ff',
  '政治': '#ffffff', '商业': '#a78bfa', '自然灾害': '#fb923c', '网络安全': '#f87171'
}

// ===== 去重 =====
function isDuplicate(title, existing) {
  const t = title.toLowerCase()
  return existing.some(e => {
    const et = e.title.toLowerCase()
    // Exact match or very similar (>70% word overlap)
    if (t === et) return true
    const tw = t.split(/\s+/)
    const ew = et.split(/\s+/)
    if (tw.length < 3 || ew.length < 3) return t === et
    const overlap = tw.filter(w => ew.includes(w)).length
    return overlap / Math.max(tw.length, ew.length) > 0.65
  })
}

// ===== 主流程 =====
async function fetchFeed(parser, feedObj) {
  try {
    const promise = parser.parseURL(feedObj.url)
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), FEED_TIMEOUT_MS)
    )
    const feed = await Promise.race([promise, timeout])
    return { items: feed.items || [], ...feedObj }
  } catch {
    console.log(`  ⚠ ${feedObj.country} — 超时/不可达`)
    return null
  }
}

async function fetchLocal(parser) {
  if (!existsSync(LOCAL_FEED)) return null
  try {
    const xml = readFileSync(LOCAL_FEED, 'utf-8')
    const feed = await parser.parseString(xml)
    return { items: feed.items || [], country: '本地', cat: '政治' }
  } catch { return null }
}

async function main() {
  console.log('=== AI World Monitor — 全球新闻采集 ===')
  console.log(`时间: ${new Date().toISOString()}`)
  console.log(`源: ${REMOTE_FEEDS.length} 个 RSS feeds\n`)

  const parser = new Parser({
    requestOptions: {
      timeout: FEED_TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-WorldMonitor/2.0; +https://ai-world-monitor.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    }
  })

  // 加载已有事件
  let events = []
  if (existsSync(DATA_FILE)) {
    try { events = JSON.parse(readFileSync(DATA_FILE, 'utf-8')) } catch {}
  }
  console.log(`已有 ${events.length} 条事件\n`)

  const newEvents = []
  let successCount = 0, failCount = 0

  // 并行抓取（分批避免过载）
  const BATCH_SIZE = 8
  for (let i = 0; i < REMOTE_FEEDS.length; i += BATCH_SIZE) {
    const batch = REMOTE_FEEDS.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(f => fetchFeed(parser, f)))
    for (const result of results) {
      if (!result) { failCount++; continue }
      successCount++
      console.log(`  ✓ ${result.country} — ${(result.items || []).length} 条`)
      for (const item of (result.items || []).slice(0, 4)) {
        const title = (item.title || '').trim()
        if (!title || title.length < 5) continue
        if (isDuplicate(title, [...events, ...newEvents])) continue

        const country = detectCountry(item, result.country)
        const category = detectCategory(title, result.cat, country)
        const [lat, lng] = getCityCoords(country)
        const summary = (item.contentSnippet || item.content || item.summary || '').replace(/<[^>]+>/g, '').slice(0, 300)
        const pubDate = item.pubDate || item.isoDate || new Date().toISOString()

        newEvents.push({
          id: `rss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          city: country,
          country,
          lat, lng,
          category,
          title,
          summary,
          color: CATEGORY_COLORS[category] || '#ffffff',
          timestamp: pubDate,
          source: result.country
        })
      }
    }
  }

  // 本地 fallback
  if (newEvents.length === 0) {
    console.log('\n远程源均不可达，尝试本地 fallback...')
    const localResult = await fetchLocal(parser)
    if (localResult) {
      for (const item of (localResult.items || []).slice(0, 5)) {
        newEvents.push({
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          city: '未知', country: '未知', lat: 0, lng: 0,
          category: '政治', title: item.title || '无标题',
          summary: (item.contentSnippet || '').slice(0, 200),
          color: '#ffffff', timestamp: new Date().toISOString()
        })
      }
    }
  }

  if (newEvents.length > 0) {
    // 合并：新事件在前，去重后保留最多 100 条
    const allIds = new Set()
    events = [...newEvents, ...events].filter(e => {
      const key = e.title.toLowerCase().slice(0, 60)
      if (allIds.has(key)) return false
      allIds.add(key)
      return true
    }).slice(0, 100)

    const dir = join(__dirname, '..', 'data')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8')
    console.log(`\n✅ 采集完成: +${newEvents.length} 条新事件, 总计 ${events.length} 条`)
    console.log(`   成功: ${successCount} 源, 失败: ${failCount} 源`)
  } else {
    console.log('\n⚠ 未获取到任何新事件')
  }
}

main().catch((err) => {
  console.error('❌ 采集失败:', err.message)
  process.exit(1)
})
