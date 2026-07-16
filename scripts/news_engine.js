/**
 * ═══════════════════════════════════════════════════════
 *  AI World Monitor — 统一新闻引擎 v3
 *  实时 · 多源 · 去重 · AI 增强 · 质量过滤
 * ═══════════════════════════════════════════════════════
 *
 * 用法: node scripts/news_engine.js
 * 环境变量: DEEPSEEK_API_KEY (必需)
 *
 * 采集流程:
 *   并行请求 40+ 源 → 解析 → 多层去重 → AI 标签 → 质量过滤 → 排序 → 输出
 */

const https = require('https')
const http = require('http')
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')

// ===== 配置 =====
const DATA_FILE = join(__dirname, '..', 'data', 'events.json')
const REPORT_FILE = join(__dirname, '..', 'data', 'report.json')
const API_KEY = process.env.DEEPSEEK_API_KEY || ''
const MAX_EVENTS = 80
const FETCH_TIMEOUT = 10000
const MAX_RETRIES = 3
const PARALLEL_BATCH = 10

// ===== 新闻源注册表 =====
const NEWS_SOURCES = [
  // === 国际权威 ===
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World', country: '英国', cat: '国际' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', name: 'NYT World', country: '美国', cat: '国际' },
  { url: 'https://feeds.npr.org/1001/rss.xml', name: 'NPR News', country: '美国', cat: '国际' },
  { url: 'https://www.theguardian.com/world/rss', name: 'The Guardian', country: '英国', cat: '国际' },
  { url: 'https://feeds.reuters.com/reuters/worldNews', name: 'Reuters', country: '英国', cat: '国际' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera', country: '卡塔尔', cat: '中东' },

  // === 亚洲 ===
  { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', name: 'NHK World', country: '日本', cat: '亚洲' },
  { url: 'https://en.yna.co.kr/RSS/news.xml', name: 'Yonhap', country: '韩国', cat: '亚洲' },
  { url: 'https://asia.nikkei.com/rss/feed/nar', name: 'Nikkei Asia', country: '日本', cat: '商业' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', name: 'Times of India', country: '印度', cat: '亚洲' },
  { url: 'https://www.straitstimes.com/news/asia/rss.xml', name: 'Straits Times', country: '新加坡', cat: '亚洲' },

  // === 中国（增强）===
  { url: 'https://rsshub.app/xinhua/whxw', name: '新华网', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/people/rmw', name: '人民网', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/thepaper', name: '澎湃新闻', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/huanqiu', name: '环球时报', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/caixin/latest', name: '财新', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/36kr/motif/最新', name: '36氪', country: '中国', cat: '科技' },
  { url: 'https://rsshub.app/chinanews/scroll', name: '中国新闻网', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/cctv/world', name: '央视国际', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/jiemian/lists/1', name: '界面新闻', country: '中国', cat: '商业' },
  { url: 'https://rsshub.app/cls/depth', name: '财联社', country: '中国', cat: '财经' },
  { url: 'https://rsshub.app/ifeng/news', name: '凤凰网', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/sina/roll', name: '新浪滚动', country: '中国', cat: '中国' },
  { url: 'https://rsshub.app/netease/today', name: '网易新闻', country: '中国', cat: '中国' },

  // === 欧洲 ===
  { url: 'https://rss.dw.com/rdf/rss-en-all', name: 'DW', country: '德国', cat: '欧洲' },
  { url: 'https://www.france24.com/en/rss', name: 'France 24', country: '法国', cat: '欧洲' },
  { url: 'https://www.lemonde.fr/en/rss/une.xml', name: 'Le Monde', country: '法国', cat: '欧洲' },
  { url: 'https://www.ansa.it/english/english_rss.xml', name: 'ANSA', country: '意大利', cat: '欧洲' },

  // === 美洲 ===
  { url: 'https://www.cbc.ca/cmlink/rss-world', name: 'CBC', country: '加拿大', cat: '美洲' },

  // === 中东 ===
  { url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', name: 'Jerusalem Post', country: '以色列', cat: '中东' },
  { url: 'https://www.arabnews.com/rss.xml', name: 'Arab News', country: '沙特阿拉伯', cat: '中东' },

  // === 非洲 ===
  { url: 'https://allafrica.com/tools/headlines/rss.xml', name: 'AllAfrica', country: '非洲', cat: '非洲' },

  // === 财经 ===
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', name: 'CNBC', country: '美国', cat: '财经' },
  { url: 'https://www.ft.com/rss/home/uk', name: 'Financial Times', country: '英国', cat: '财经' },

  // === 科技 ===
  { url: 'https://feeds.feedburner.com/TechCrunch/', name: 'TechCrunch', country: '美国', cat: '科技' },
  { url: 'https://www.wired.com/feed/rss', name: 'WIRED', country: '美国', cat: '科技' },
  { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge', country: '美国', cat: '科技' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica', country: '美国', cat: '科技' },

  // === 科学/自然 ===
  { url: 'https://www.bbc.com/news/science_and_environment/rss.xml', name: 'BBC Science', country: '英国', cat: '科技' },
  { url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.atom', name: 'USGS Earthquakes', country: '全球', cat: '自然灾害' },

  // === 加密货币 ===
  { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', country: '全球', cat: '金融' },
]

// ===== 备用源（主源失败时使用）=====
const FALLBACK_SOURCES = [
  { url: 'https://www.bangkokpost.com/rss/news.xml', name: 'Bangkok Post', country: '泰国', cat: '亚洲' },
  { url: 'https://www.themoscowtimes.com/rss/news', name: 'Moscow Times', country: '俄罗斯', cat: '欧洲' },
]

// ===== 坐标映射 =====
const CAPITAL_COORDS = {
  '中国':[39.9042,116.4074],'美国':[38.9072,-77.0369],'英国':[51.5074,-0.1278],
  '法国':[48.8566,2.3522],'德国':[52.52,13.405],'俄罗斯':[55.7558,37.6173],
  '日本':[35.6762,139.6503],'韩国':[37.5665,126.978],'印度':[28.6139,77.209],
  '加拿大':[45.4215,-75.6972],'澳大利亚':[-33.8688,151.2093],'巴西':[-15.8267,-47.9218],
  '新加坡':[1.3521,103.8198],'泰国':[13.7563,100.5018],'越南':[21.0278,105.8342],
  '印尼':[-6.2088,106.8456],'菲律宾':[14.5995,120.9842],'马来西亚':[3.139,101.687],
  '沙特阿拉伯':[24.7136,46.6753],'卡塔尔':[25.2854,51.531],'以色列':[31.7683,35.2137],
  '阿联酋':[24.4539,54.3773],'伊朗':[35.6892,51.389],'巴基斯坦':[33.6844,73.0479],
  '南非':[-25.7479,28.2293],'尼日利亚':[9.082,8.6753],'肯尼亚':[-1.2921,36.8219],
  '比利时':[50.8503,4.3517],'瑞士':[46.8182,8.2275],'意大利':[41.9028,12.4964],
  '西班牙':[40.4168,-3.7038],'墨西哥':[19.4326,-99.1332],'乌克兰':[50.4501,30.5234],
  '全球':[0,0],'非洲':[9.145,40.4897],'欧洲':[50.8503,4.3517],
}

// ===== HTTP 请求（带重试）=====
function httpGet(url, retries = 0) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http
    const req = proto.get(url, {
      timeout: FETCH_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-WorldMonitor/3.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
      },
      rejectUnauthorized: false,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpGet(res.headers.location, retries).then(resolve)
        return
      }
      if (res.statusCode !== 200) {
        if (retries < MAX_RETRIES) {
          setTimeout(() => httpGet(url, retries + 1).then(resolve), 1000 * (retries + 1))
        } else {
          resolve(null)
        }
        return
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', () => {
      if (retries < MAX_RETRIES) {
        setTimeout(() => httpGet(url, retries + 1).then(resolve), 1000 * (retries + 1))
      } else {
        resolve(null)
      }
    })
    req.on('timeout', () => {
      req.destroy()
      if (retries < MAX_RETRIES) {
        setTimeout(() => httpGet(url, retries + 1).then(resolve), 1000 * (retries + 1))
      } else {
        resolve(null)
      }
    })
  })
}

// ===== JSON API 请求 =====
function httpGetJson(url) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http
    const req = proto.get(url, {
      timeout: FETCH_TIMEOUT,
      headers: { 'User-Agent': 'AI-WorldMonitor/3.0', 'Cache-Control': 'no-cache' },
      rejectUnauthorized: false,
    }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch { resolve(null) } })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

// ===== 简易 RSS/Atom 解析 =====
function parseXML(xml) {
  const items = []
  // Match <item> or <entry>
  const itemRegex = /<(item|entry)>([\s\S]*?)<\/(item|entry)>/gi
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[2]
    const getTag = (tag) => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
      const m = block.match(re)
      return m ? m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim() : ''
    }
    const title = getTag('title')
    const link = getTag('link') || (block.match(/<link[^>]*href="([^"]*)"/i) || [])[1] || ''
    const desc = getTag('description') || getTag('content') || getTag('summary') || ''
    const pubDate = getTag('pubDate') || getTag('published') || getTag('updated') || getTag('dc:date') || ''
    const cat = getTag('category')
    const creator = getTag('dc:creator') || getTag('author') || ''
    if (title && (desc || link)) {
      items.push({ title, link, description: desc, pubDate, category: cat, creator })
    }
  }
  return items
}

// ===== 智能分类（20+ 类别）=====
function classifyEvent(title, desc, sourceCat) {
  const text = `${title} ${desc}`.toLowerCase()
  const rules = [
    ['AI', /(ai|artificial intelligence|machine learning|大模型|gpt|llm|深度学习|neural network)/i],
    ['战争', /(war|conflict|military|invasion|missile|strike|air raid|bomb|casualt|troop|shell|fighting|battle|offensive|defense|military)/i],
    ['外交', /(diploma|sanction|treaty|summit|negotiation|peace talk|ceasefire|embassy|foreign minister|state visit)/i],
    ['金融', /(stock|market|dollar|fed|interest rate|inflation|gdp|recession|treasury|bond|wall street|s&p|nasdaq|dow)/i],
    ['股市', /(stock|share|index|ipo|bull|bear|dividend|nasdaq|nyse|shanghai composite|hang seng|nikkei)/i],
    ['能源', /(oil|gas|petroleum|crude|opec|energy|power|electricity|nuclear|solar|wind|coal|pipeline)/i],
    ['科技', /(tech|chip|semicon|processor|quantum|supercomputer|launch|spacecraft|satellite|rocket|orbit|nasa|spacex)/i],
    ['商业', /(merger|acquisition|takeover|startup|vc|venture|funding|ipo|revenue|profit|ceo|board|bankrupt)/i],
    ['自然灾害', /(earthquake|flood|tsunami|hurricane|typhoon|volcano|wildfire|tornado|storm|cyclone|drought|landslide|avalanche)/i],
    ['公共卫生', /(pandemic|outbreak|virus|vaccine|covid|disease|who|hospital|health emergency|epidemic)/i],
    ['网络安全', /(hack|cyber|ransomware|malware|data breach|phishing|ddos|security|零日|vulnerability)/i],
    ['跨境电商', /(e-commerce|amazon|alibaba|shopee|temu|shein|logistics|supply chain|customs|tariff|trade war|export|import)/i],
    ['供应链', /(supply chain|shortage|logistics|shipping|port|cargo|container|freight|manufacturing)/i],
    ['中国', /(china|chinese|beijing|shanghai|shenzhen|xi jinping|ccp|politburo|中国|北京|上海|深圳)/i],
    ['美国', /(united states|america|us |usa|biden|trump|white house|congress|senate|pentagon|washington)/i],
    ['欧洲', /(europe|eu |european|brussels|nato|germany|france|uk |italy|spain|欧盟|德国|法国)/i],
    ['亚洲', /(asia|japan|korea|india|asean|southeast asia|vietnam|indonesia|thailand|日本|韩国|印度)/i],
    ['中东', /(middle east|israel|palestin|iran|saudi|uae|dubai|qatar|kuwait|iraq|syria|yemen|以色列|伊朗|沙特)/i],
    ['非洲', /(africa|nigeria|south africa|kenya|ethiopia|egypt|cairo|非洲)/i],
  ]
  for (const [cat, re] of rules) if (re.test(text)) return cat
  return sourceCat || '国际'
}

// ===== 去重引擎 =====
function dedup(events) {
  const seen = new Set()
  const result = []
  for (const ev of events) {
    // Layer 1: 标题 MD5
    const titleKey = ev.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '').slice(0, 80)
    if (seen.has(titleKey)) continue
    seen.add(titleKey)

    // Layer 2: 链接去重
    if (ev.link) {
      const linkKey = ev.link.replace(/https?:\/\//,'').replace(/\/$/,'').slice(0, 60)
      if (seen.has('L:' + linkKey)) continue
      seen.add('L:' + linkKey)
    }

    // Layer 3: 摘要相似度（与前 3 条比较）
    let isDup = false
    if (ev.description) {
      const words = ev.description.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      for (const prev of result.slice(-3)) {
        if (!prev.description) continue
        const prevWords = prev.description.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        if (words.length < 5 || prevWords.length < 5) continue
        const overlap = words.filter(w => prevWords.includes(w)).length
        if (overlap / Math.min(words.length, prevWords.length) > 0.6) { isDup = true; break }
      }
    }
    if (!isDup) result.push(ev)
  }
  return result
}

// ===== 质量过滤 =====
function qualityFilter(events) {
  return events.filter(ev => {
    if (!ev.title || ev.title.length < 5) return false
    if (!ev.description || ev.description.length < 10) return false
    // 过滤纯广告/SEO内容
    const spamWords = ['buy now','click here','subscribe','sponsored','advertorial','free trial','discount','exclusive offer']
    const text = (ev.title + ev.description).toLowerCase()
    if (spamWords.some(w => text.includes(w))) return false
    // 必须有日期
    if (ev.pubDate) {
      const d = new Date(ev.pubDate)
      if (isNaN(d.getTime())) return true // keep if unparseable but other checks pass
      // 只保留最近 7 天
      if (Date.now() - d.getTime() > 7 * 24 * 3600 * 1000) return false
    }
    return true
  })
}

// ===== 时间解析 =====
function parseDate(str) {
  if (!str) return new Date()
  const d = new Date(str)
  if (!isNaN(d.getTime())) return d
  // Try common formats
  const fmts = [
    /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
    /(\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})/,
  ]
  for (const fmt of fmts) {
    const m = str.match(fmt)
    if (m) { const d2 = new Date(str); if (!isNaN(d2.getTime())) return d2 }
  }
  return new Date()
}

// ===== 排序（时间 + 影响力）=====
function smartSort(events) {
  // 先按时效排序
  events.sort((a, b) => parseDate(b.pubDate) - parseDate(a.pubDate))
  // 提升高影响力事件
  const priorityCats = ['战争', '自然灾害', '公共卫生']
  events.sort((a, b) => {
    const aPri = priorityCats.includes(a.category) ? 2 : 1
    const bPri = priorityCats.includes(b.category) ? 2 : 1
    if (aPri !== bPri) return bPri - aPri
    return parseDate(b.pubDate) - parseDate(a.pubDate)
  })
  return events
}

// ===== DeepSeek AI 增强 =====
async function aiEnrich(events) {
  if (!API_KEY || events.length === 0) return events
  try {
    const sample = events.slice(0, 15).map((e, i) => `[${i}] ${e.title} | ${e.category} | ${e.country}`).join('\n')
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是全球新闻分析助手。对每条新闻输出：风险等级(低/中/高/极高) | 全球影响力(1-10) | 2个标签。JSON格式：[{"idx":0,"risk":"中","impact":7,"tags":["亚洲","外交"]}]' },
        { role: 'user', content: sample }
      ],
      temperature: 0.3, max_tokens: 1200
    })
    const resp = await new Promise((resolve) => {
      const req = https.request({
        hostname:'api.deepseek.com', path:'/v1/chat/completions', method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${API_KEY}`},
        timeout:20000
      }, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch{resolve(null)}}) })
      req.on('error',()=>resolve(null)); req.write(body); req.end()
    })
    const text = resp?.choices?.[0]?.message?.content || ''
    const jsonStr = text.replace(/```json\s*/g,'').replace(/```/g,'').replace(/,\s*([}\]])/g,'$1')
    const arrStart = jsonStr.indexOf('['), arrEnd = jsonStr.lastIndexOf(']')
    if (arrStart >= 0 && arrEnd > arrStart) {
      const enrichments = JSON.parse(jsonStr.slice(arrStart, arrEnd + 1))
      for (const en of enrichments) {
        if (events[en.idx]) {
          events[en.idx].riskLevel = en.risk || '中'
          events[en.idx].impact = en.impact || 5
          events[en.idx].tags = en.tags || []
        }
      }
    }
  } catch {}
  return events
}

// ===== USGS 地震数据 =====
async function fetchUSGS() {
  const data = await httpGetJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson')
  if (!data?.features) return []
  return data.features.slice(0, 5).map(f => {
    const p = f.properties
    const g = f.geometry
    return {
      title: `M${p.mag} 地震 — ${p.place}`,
      description: `USGS 记录: 震级 ${p.mag}, 深度 ${g.coordinates[2]}km, 时间 ${new Date(p.time).toISOString()}`,
      link: p.url,
      pubDate: new Date(p.time).toISOString(),
      category: '自然灾害',
      country: p.place?.split(',').pop()?.trim() || '全球',
      lat: g.coordinates[1],
      lng: g.coordinates[0],
    }
  })
}

// ===== CoinGecko 加密数据 =====
async function fetchCrypto() {
  const data = await httpGetJson('https://api.coingecko.com/api/v3/trending')
  if (!data?.coins) return []
  return data.coins.slice(0, 3).map(c => ({
    title: `${c.item.name} (${c.item.symbol}) 趋势排名 #${c.item.market_cap_rank || '?'}`,
    description: `市值排名 #${c.item.market_cap_rank || 'N/A'}, 24h 价格: $${c.item.price_btc ? 'BTC计价' : 'N/A'}`,
    link: `https://www.coingecko.com/en/coins/${c.item.id}`,
    pubDate: new Date().toISOString(),
    category: '金融',
    country: '全球',
  }))
}

// ===== 主流程 =====
async function main() {
  const startTime = Date.now()
  const stats = { total: 0, success: 0, failed: 0, added: 0, deduped: 0, filtered: 0 }
  let rawItems = []

  console.log('═'.repeat(60))
  console.log('  AI World Monitor — 新闻引擎 v3')
  console.log(`  启动: ${new Date().toISOString()}`)
  console.log(`  源数: ${NEWS_SOURCES.length} 个`)
  console.log('═'.repeat(60))

  // ===== 第1步：并行采集 RSS =====
  console.log('\n📡 第1步：并行采集 RSS...')
  for (let i = 0; i < NEWS_SOURCES.length; i += PARALLEL_BATCH) {
    const batch = NEWS_SOURCES.slice(i, i + PARALLEL_BATCH)
    const results = await Promise.all(batch.map(async (src) => {
      const xml = await httpGet(src.url)
      if (!xml) return null
      const items = parseXML(xml)
      if (items.length === 0) return null
      return { source: src, items }
    }))
    for (const r of results) {
      if (!r) { stats.failed++; continue }
      stats.success++
      const count = Math.min(r.items.length, 5)
      console.log(`  ✓ ${r.source.name} (${r.source.country}) — ${count} 条`)
      for (const item of r.items.slice(0, 5)) {
        rawItems.push({
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.pubDate,
          sourceCountry: r.source.country,
          sourceCat: r.source.cat,
          sourceName: r.source.name,
        })
      }
    }
  }

  // ===== 第2步：补充 API 数据 =====
  console.log('\n📡 第2步：补充 API 数据...')
  const [usgsItems, cryptoItems] = await Promise.all([fetchUSGS(), fetchCrypto()])
  console.log(`  ✓ USGS — ${usgsItems.length} 条地震`)
  console.log(`  ✓ CoinGecko — ${cryptoItems.length} 条趋势`)
  for (const item of [...usgsItems, ...cryptoItems]) {
    rawItems.push({
      ...item,
      sourceCountry: item.country,
      sourceCat: item.category,
      sourceName: item.category === '自然灾害' ? 'USGS' : 'CoinGecko',
    })
  }

  // ===== 如果主源全部失败，使用备用源 =====
  if (rawItems.length === 0) {
    console.log('\n⚠ 主源全部失败，尝试备用源...')
    const fbXml = await httpGet(FALLBACK_SOURCES[0].url)
    if (fbXml) {
      const fbItems = parseXML(fbXml)
      for (const item of fbItems.slice(0, 5)) {
        rawItems.push({ ...item, sourceCountry: FALLBACK_SOURCES[0].country, sourceCat: FALLBACK_SOURCES[0].cat, sourceName: FALLBACK_SOURCES[0].name })
      }
    }
  }

  stats.total = rawItems.length
  console.log(`\n  原始条目: ${rawItems.length}`)

  // ===== 第3步：分类 =====
  console.log('\n🏷  第3步：智能分类...')
  for (const item of rawItems) {
    item.category = classifyEvent(item.title, item.description, item.sourceCat)
    const coords = CAPITAL_COORDS[item.sourceCountry] || [0, 0]
    item.country = item.sourceCountry
    item.lat = item.lat || coords[0]
    item.lng = item.lng || coords[1]
  }

  // ===== 第4步：质量过滤 =====
  const beforeFilter = rawItems.length
  rawItems = qualityFilter(rawItems)
  stats.filtered = beforeFilter - rawItems.length
  console.log(`  质量过滤: ${beforeFilter} → ${rawItems.length} (-${stats.filtered})`)

  // ===== 第5步：去重 =====
  const beforeDedup = rawItems.length
  rawItems = dedup(rawItems)
  stats.deduped = beforeDedup - rawItems.length
  console.log(`  去重: ${beforeDedup} → ${rawItems.length} (-${stats.deduped})`)

  // ===== 第6步：AI 增强 =====
  if (API_KEY && rawItems.length > 0) {
    console.log('\n🤖 第6步：DeepSeek AI 增强...')
    rawItems = await aiEnrich(rawItems)
    console.log('  ✓ AI 分析完成')
  } else if (!API_KEY) {
    console.log('\n⚠ 未设置 DEEPSEEK_API_KEY，跳过 AI 增强')
  }

  // ===== 第7步：排序 =====
  console.log('\n📊 第7步：智能排序...')
  rawItems = smartSort(rawItems)

  // ===== 第8步：生成最终事件 =====
  const events = rawItems.slice(0, MAX_EVENTS).map((item, idx) => ({
    id: `evt-${Date.now()}-${idx}`,
    city: item.country,
    country: item.country,
    lat: item.lat || 0,
    lng: item.lng || 0,
    category: item.category || '国际',
    title: item.title,
    summary: (item.description || '').slice(0, 300),
    color: categoryColor(item.category),
    timestamp: item.pubDate || new Date().toISOString(),
    source: item.sourceName || '未知',
    riskLevel: item.riskLevel || '中',
    impact: item.impact || 5,
    tags: item.tags || [],
    link: item.link || '',
  }))

  // ===== 写入 =====
  const dir = join(__dirname, '..', 'data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8')

  // ===== 生成报告 =====
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const categories = {}
  events.forEach(e => { categories[e.category] = (categories[e.category] || 0) + 1 })
  const latestDate = events[0]?.timestamp ? new Date(events[0].timestamp).toISOString() : 'N/A'

  const report = {
    timestamp: new Date().toISOString(),
    elapsed: `${elapsed}s`,
    stats: { ...stats, final: events.length },
    categories,
    latestEvent: latestDate,
    top5: events.slice(0, 5).map(e => ({ title: e.title, category: e.category, country: e.country, timestamp: e.timestamp })),
  }
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8')

  console.log('\n' + '═'.repeat(60))
  console.log('  ✅ 采集完成')
  console.log(`  耗时: ${elapsed}s`)
  console.log(`  源成功: ${stats.success} | 失败: ${stats.failed}`)
  console.log(`  最终事件: ${events.length}`)
  console.log(`  最新事件: ${latestDate}`)
  console.log(`  分类: ${JSON.stringify(categories)}`)
  console.log('═'.repeat(60))
}

function categoryColor(cat) {
  const map = {
    '战争':'#ff4d4f','自然灾害':'#fb923c','公共卫生':'#f87171',
    '能源':'#fbbf24','科技':'#40a9ff','AI':'#8b5cf6',
    '金融':'#34d399','股市':'#10b981','商业':'#a78bfa',
    '外交':'#60a5fa','网络安全':'#f472b6',
    '中国':'#ef4444','美国':'#3b82f6','欧洲':'#6366f1',
    '亚洲':'#f59e0b','中东':'#8b5cf6','非洲':'#14b8a6',
    '跨境电商':'#06b6d4','供应链':'#84cc16',
    '国际':'#ffffff'
  }
  return map[cat] || '#ffffff'
}

main().catch(err => {
  console.error('❌ 引擎崩溃:', err.message)
  process.exit(1)
})
