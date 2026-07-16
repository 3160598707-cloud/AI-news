/**
 * DeepSeek 实时新闻生成器
 * 当 RSS 源无法访问时，通过 DeepSeek API 生成基于最新全球事件的事件数据
 * 用法: node scripts/fetch_realtime_news.js
 */
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')
const https = require('https')

const DATA_FILE = join(__dirname, '..', 'data', 'events.json')
const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-5b20a36cc25e478e98e549a5034b04f2'

const CAPITAL_COORDS = {
  '中国': [39.9042,116.4074], '美国': [38.9072,-77.0369], '英国': [51.5074,-0.1278],
  '法国': [48.8566,2.3522], '德国': [52.52,13.405], '俄罗斯': [55.7558,37.6173],
  '日本': [35.6762,139.6503], '韩国': [37.5665,126.978], '印度': [28.6139,77.209],
  '巴西': [-15.8267,-47.9218], '澳大利亚': [-33.8688,151.2093], '加拿大': [45.4215,-75.6972],
  '沙特阿拉伯': [24.7136,46.6753], '伊朗': [35.6892,51.389], '以色列': [31.7683,35.2137],
  '南非': [-25.7479,28.2293], '新加坡': [1.3521,103.8198], '意大利': [41.9028,12.4964],
  '西班牙': [40.4168,-3.7038], '墨西哥': [19.4326,-99.1332], '巴基斯坦': [33.6844,73.0479],
  '阿根廷': [-34.6037,-58.3816], '土耳其': [41.0082,28.9784], '埃及': [30.0444,31.2357],
  '尼日利亚': [9.082,8.6753], '越南': [21.0278,105.8342], '印尼': [-6.2088,106.8456],
}

const CATEGORY_COLORS = {
  '战争': '#ff4d4f', '能源': '#fbbf24', '科技': '#40a9ff',
  '政治': '#ffffff', '商业': '#a78bfa', '自然灾害': '#fb923c', '网络安全': '#f87171'
}

function deepseekChat(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    })
    const req = https.request({
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      timeout: 30000,
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json.choices?.[0]?.message?.content || '')
        } catch (e) {
          reject(new Error('Parse error: ' + data.slice(0, 200)))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  const today = new Date().toISOString().slice(0, 10)
  console.log(`=== DeepSeek 实时新闻生成 ===`)
  console.log(`日期: ${today}\n`)

  // 加载已有事件
  let events = []
  if (existsSync(DATA_FILE)) {
    try { events = JSON.parse(readFileSync(DATA_FILE, 'utf-8')) } catch {}
  }

  const existingTitles = new Set(events.map(e => e.title?.toLowerCase().slice(0, 60)))

  const prompt = `你是一个全球新闻分析助手。今天是 ${today}。

请列出今天全球最重要的 15 条新闻事件。每条新闻需要包含：
1. 国家（中文）
2. 城市（首都或主要城市）
3. 分类（战争/能源/科技/政治/商业/自然灾害/网络安全）
4. 标题（简洁中文）
5. 摘要（50-100字中文简述）

请严格按照以下 JSON 格式返回，不要加额外的解释文字：
[{"country":"中国","city":"北京","category":"政治","title":"...","summary":"..."}]

注意：必须是今天的真实新闻！覆盖全球各地区：亚洲、欧洲、美洲、中东、非洲。`

  try {
    const response = await deepseekChat([
      { role: 'system', content: '你是一个全球新闻分析助手，只返回 JSON 格式数据。' },
      { role: 'user', content: prompt }
    ])

    // Parse JSON — robust cleanup
    let jsonStr = response.trim()
    // Remove markdown fences
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
    // Remove leading/trailing whitespace around brackets
    jsonStr = jsonStr.replace(/^\s*\[/, '[').replace(/\]\s*$/, ']')
    // Fix trailing commas (before ] or })
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')
    // Remove any text before [ and after ]
    const arrStart = jsonStr.indexOf('[')
    const arrEnd = jsonStr.lastIndexOf(']')
    if (arrStart >= 0 && arrEnd > arrStart) {
      jsonStr = jsonStr.slice(arrStart, arrEnd + 1)
    }

    const newsItems = JSON.parse(jsonStr)
    console.log(`DeepSeek 返回 ${newsItems.length} 条新闻\n`)

    const newEvents = []
    for (const item of newsItems) {
      const title = item.title?.trim()
      if (!title || existingTitles.has(title.toLowerCase().slice(0, 60))) continue
      existingTitles.add(title.toLowerCase().slice(0, 60))

      const coords = CAPITAL_COORDS[item.country] || [0, 0]
      const cat = item.category || '政治'

      newEvents.push({
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        city: item.city || item.country,
        country: item.country,
        lat: coords[0],
        lng: coords[1],
        category: cat,
        title,
        summary: item.summary || '',
        color: CATEGORY_COLORS[cat] || '#ffffff',
        timestamp: new Date().toISOString(),
        source: 'DeepSeek-AI',
      })
    }

    if (newEvents.length > 0) {
      // 合并、去重、保留最多 100 条
      const allIds = new Set()
      events = [...newEvents, ...events].filter(e => {
        const key = e.title?.toLowerCase().slice(0, 60)
        if (allIds.has(key)) return false
        allIds.add(key)
        return true
      }).slice(0, 100)

      const dir = join(__dirname, '..', 'data')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8')
      console.log(`✅ 生成完成: +${newEvents.length} 条 AI 新闻, 总计 ${events.length} 条`)
    } else {
      console.log('⚠ 所有 AI 生成新闻与已有事件重复')
    }
  } catch (err) {
    console.error('❌ DeepSeek 生成失败:', err.message)
    process.exit(1)
  }
}

main()
