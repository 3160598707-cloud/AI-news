const h = require('https'), fs = require('fs'), path = require('path')
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const eventsFile = path.join(dataDir, 'events.json')
const key = 'sk-5b20a36cc25e478e98e549a5034b04f2'
const today = new Date().toISOString().slice(0, 10)
const body = JSON.stringify({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: '你是专业新闻编辑。当前日期是'+today+'（2026年7月16日）。你必须只报道今天的新闻，不能使用任何历史数据。列出今天全球15条最重要的真实新闻，必须覆盖所有地区：中国3条、美国2条、欧洲2条、亚洲2条、中东1条、非洲1条、拉美1条、全球财经1条、科技2条。每条30-60字，简洁权威。严格返回JSON数组：[{"country":"中国","category":"科技","title":"...","summary":"..."}]。分类用:财经/科技/民生/军事/国际。禁止使用2025年或更早的事件。' },
    { role: 'user', content: '生成今天最新新闻' }
  ],
  temperature: 0.7, max_tokens: 2500
})
const r = h.request({
  hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
  timeout: 25000
}, res => {
  let d = ''
  res.on('data', c => d += c)
  res.on('end', () => {
    try {
      const json = JSON.parse(d)
      let t = json.choices[0].message.content
      t = t.replace(/```json\s*|```\s*/g, '').trim()
      const arr = JSON.parse(t)
      const events = arr.map((x, i) => ({
        id: 'news-' + Date.now() + '-' + i,
        city: x.country,
        country: x.country,
        lat: 0, lng: 0,
        category: x.category || '中国',
        title: x.title,
        summary: x.summary,
        color: '#ffffff',
        timestamp: new Date().toISOString(),
        source: 'DeepSeek'
      }))
      fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
      console.log('OK ' + events.length + ' events')
    } catch (e) { console.log('PARSE:', e.message.slice(0, 200)) }
  })
})
r.on('error', e => console.log('ERR:', e.message))
r.on('timeout', () => { r.destroy(); console.log('TIMEOUT') })
r.write(body)
r.end()
