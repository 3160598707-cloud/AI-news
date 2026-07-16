const h = require('https'), fs = require('fs'), path = require('path')
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const eventsFile = path.join(dataDir, 'events.json')
const key = 'sk-5b20a36cc25e478e98e549a5034b04f2'
const today = new Date().toISOString().slice(0, 10)
const body = JSON.stringify({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: '你是专业新闻编辑。今天是'+today+'。列出今天10条最重要、最有影响力的真实新闻。必须基于公开可验证的事实。分类:财经/科技/民生/国际/军事。每条30-60字，简洁权威。严格返回JSON数组：[{"country":"中国","category":"财经","title":"央行下调存款准备金率0.5个百分点","summary":"中国人民银行决定自7月20日起降准0.5个百分点，预计释放长期资金约1.2万亿元，旨在降低实体经济融资成本。"}]。至少5条中国国内。' },
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
