/**
 * 🦾 零依赖新闻引擎 — 纯 RSS 抓取，无需 API Key
 * 用法: node scripts/simple_ingest.js
 * 55 个全球 RSS 源 → 解析 → 去重 → 生成 events.json
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'events.json');

// ===== 55 个全球 RSS 源 =====
const FEEDS = [
  // 中国
  { url: 'https://rsshub.app/xinhua/whxw', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/people/rmw', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/thepaper', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/huanqiu', country: '中国', cat: '政治' },
  { url: 'https://rsshub.app/caixin/latest', country: '中国', cat: '商业' },
  { url: 'https://rsshub.app/36kr/motif/最新', country: '中国', cat: '科技' },
  // 亚洲
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
  // 欧洲
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', country: '英国', cat: '政治' },
  { url: 'https://www.theguardian.com/world/rss', country: '英国', cat: '政治' },
  { url: 'https://rss.dw.com/rdf/rss-en-all', country: '德国', cat: '政治' },
  { url: 'https://www.france24.com/en/rss', country: '法国', cat: '政治' },
  { url: 'https://www.lemonde.fr/en/rss/une.xml', country: '法国', cat: '政治' },
  { url: 'https://www.ansa.it/english/english_rss.xml', country: '意大利', cat: '政治' },
  { url: 'https://www.dailysabah.com/rssFeed/10', country: '土耳其', cat: '政治' },
  // 美洲
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', country: '美国', cat: '政治' },
  { url: 'https://feeds.npr.org/1001/rss.xml', country: '美国', cat: '政治' },
  { url: 'https://www.cbc.ca/cmlink/rss-world', country: '加拿大', cat: '政治' },
  { url: 'https://www1.folha.uol.com.br/emcimadahora/rss091.xml', country: '巴西', cat: '政治' },
  // 大洋洲
  { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', country: '澳大利亚', cat: '政治' },
  // 中东
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', country: '卡塔尔', cat: '政治' },
  { url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', country: '以色列', cat: '政治' },
  { url: 'https://www.arabnews.com/rss.xml', country: '沙特阿拉伯', cat: '政治' },
  { url: 'https://www.tehrantimes.com/rss', country: '伊朗', cat: '政治' },
  // 非洲
  { url: 'https://allafrica.com/tools/headlines/rss.xml', country: '非洲', cat: '政治' },
  { url: 'https://www.vanguardngr.com/feed/', country: '尼日利亚', cat: '政治' },
  // 商业
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', country: '美国', cat: '商业' },
  // 科技
  { url: 'https://feeds.feedburner.com/TechCrunch/', country: '美国', cat: '科技' },
  { url: 'https://www.wired.com/feed/rss', country: '美国', cat: '科技' },
  { url: 'https://www.theverge.com/rss/index.xml', country: '美国', cat: '科技' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', country: '美国', cat: '科技' },
  { url: 'https://www.theregister.com/headlines.atom', country: '英国', cat: '科技' },
  { url: 'https://www.technologyreview.com/feed/', country: '美国', cat: '科技' },
  { url: 'https://www.artificialintelligence-news.com/feed/', country: '英国', cat: '科技' },
  { url: 'https://venturebeat.com/feed/', country: '美国', cat: '科技' },
  { url: 'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml', country: '美国', cat: '科技' },
  // 能源
  { url: 'https://www.bbc.com/news/science_and_environment/rss.xml', country: '英国', cat: '能源' },
];

// ===== 坐标映射 =====
const COORDS = {
  '中国': [35.86, 104.19], '日本': [36.20, 138.25], '韩国': [35.91, 127.77],
  '新加坡': [1.35, 103.82], '印度': [20.59, 78.96], '泰国': [15.87, 100.99],
  '印度尼西亚': [-0.79, 113.92], '越南': [14.06, 108.28], '巴基斯坦': [30.38, 69.35],
  '菲律宾': [12.88, 121.77], '英国': [55.38, -3.44], '德国': [51.17, 10.45],
  '法国': [46.60, 1.89], '意大利': [41.87, 12.57], '土耳其': [38.96, 35.24],
  '俄罗斯': [61.52, 105.32], '美国': [37.09, -95.71], '加拿大': [56.13, -106.35],
  '巴西': [-14.24, -51.93], '澳大利亚': [-25.27, 133.78], '卡塔尔': [25.35, 51.18],
  '以色列': [31.05, 34.85], '沙特阿拉伯': [23.89, 45.08], '伊朗': [32.43, 53.69],
  '非洲': [8.78, 17.64], '尼日利亚': [9.08, 8.68], '南非': [-30.56, 22.94],
  '墨西哥': [23.63, -102.55],
};

const COLORS = {
  '政治': '#ffffff', '科技': '#40a9ff', '商业': '#a78bfa',
  '能源': '#fbbf24', '网络安全': '#f87171', '军事': '#ff4d4f',
};

// ===== HTTP 请求 =====
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { req.destroy(); return resolve(''); }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

// ===== 简易 RSS 解析（不依赖 rss-parser 库） =====
function parseRSS(xml, feedInfo) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i;
  const descRegex = /<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i;
  const dateRegex = /<pubDate>(.*?)<\/pubDate>/i;
  const linkRegex = /<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = (content.match(titleRegex) || [])[1] || '';
    const desc = (content.match(descRegex) || [])[1] || '';
    const date = (content.match(dateRegex) || [])[1] || new Date().toUTCString();
    const link = (content.match(linkRegex) || [])[1] || '';

    if (!title || title.length < 10) continue;
    // 清理 HTML
    const summary = (desc || title).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200);

    items.push({
      title: title.replace(/<[^>]+>/g, '').trim(),
      summary,
      link,
      timestamp: date,
      ...feedInfo,
    });
  }

  // 也尝试 Atom 格式
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    const atomTitleRegex = /<title[^>]*>(.*?)<\/title>/i;
    const atomSummaryRegex = /<summary[^>]*>(.*?)<\/summary>/i;
    const atomDateRegex = /<updated>(.*?)<\/updated>/i;
    const atomLinkRegex = /<link[^>]*href="(.*?)"/i;

    while ((match = entryRegex.exec(xml)) !== null) {
      const content = match[1];
      const title = (content.match(atomTitleRegex) || [])[1] || '';
      const desc = (content.match(atomSummaryRegex) || [])[1] || '';
      const date = (content.match(atomDateRegex) || [])[1] || new Date().toISOString();
      const link = (content.match(atomLinkRegex) || [])[1] || '';

      if (!title || title.length < 10) continue;
      const summary = (desc || title).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200);

      items.push({
        title: title.replace(/<[^>]+>/g, '').trim(),
        summary,
        link,
        timestamp: date,
        ...feedInfo,
      });
    }
  }

  return items;
}

// ===== 主程序 =====
async function main() {
  console.log(`🕐 ${new Date().toISOString()} — 开始抓取 ${FEEDS.length} 个 RSS 源\n`);

  const allItems = [];

  // 并行抓取（每次 8 个并发）
  for (let i = 0; i < FEEDS.length; i += 8) {
    const batch = FEEDS.slice(i, i + 8);
    const results = await Promise.all(batch.map(async (feed) => {
      try {
        const xml = await fetchUrl(feed.url);
        if (!xml) return [];
        const items = parseRSS(xml, { country: feed.country, cat: feed.cat });
        if (items.length > 0) {
          console.log(`  ✅ ${feed.country} [${feed.cat}]: ${items.length} 条 — ${new URL(feed.url).hostname}`);
        } else {
          console.log(`  ⚠️ ${feed.country} [${feed.cat}]: 0 条 — ${new URL(feed.url).hostname}`);
        }
        return items;
      } catch (e) {
        console.log(`  ❌ ${feed.country}: 失败 — ${e.message}`);
        return [];
      }
    }));
    results.forEach(r => allItems.push(...r));
  }

  console.log(`\n📊 总计抓取: ${allItems.length} 条`);

  // 去重（基于标题相似度）
  const unique = [];
  const seen = new Set();
  for (const item of allItems) {
    const key = item.title.substring(0, 50).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  console.log(`🔍 去重后: ${unique.length} 条`);

  // 转为 events 格式，只取最新的 80 条
  const events = unique.slice(0, 80).map((item, idx) => {
    const [lat, lng] = COORDS[item.country] || [0, 0];
    return {
      id: `rss-${Date.now()}-${idx}`,
      city: item.country,
      country: item.country,
      lat: lat + (Math.random() - 0.5) * 2,
      lng: lng + (Math.random() - 0.5) * 2,
      category: item.cat,
      title: item.title,
      summary: item.summary,
      color: COLORS[item.cat] || '#ffffff',
      timestamp: item.timestamp,
      source: item.link || '',
    };
  });

  // 保存
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
  console.log(`💾 已保存 ${events.length} 条事件到 data/events.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
