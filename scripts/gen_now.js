const h = require('https'), fs = require('fs')
const key = 'sk-5b20a36cc25e478e98e549a5034b04f2'
const today = new Date().toISOString().slice(0, 10)
const body = JSON.stringify({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: '你是全球新闻助手。今天是' + today + '。列出今天15条最重要的中国+全球新闻。严格返回JSON数组：[{"country":"中国","category":"中国","title":"...","summary":"..."}]。分类:中国/国际/科技/财经/军事/自然灾害。必须覆盖至少8条中国国内新闻。' },
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
      fs.writeFileSync('data/events.json', JSON.stringify(events, null, 2))
      console.log('OK ' + events.length + ' events')
    } catch (e) { console.log('PARSE:', e.message.slice(0, 200)) }
  })
})
r.on('error', e => console.log('ERR:', e.message))
r.on('timeout', () => { r.destroy(); console.log('TIMEOUT') })
r.write(body)
r.end()
