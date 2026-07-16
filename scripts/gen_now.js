const h = require('https'), fs = require('fs'), path = require('path')
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const eventsFile = path.join(dataDir, 'events.json')
const key = 'sk-5b20a36cc25e478e98e549a5034b04f2'
const today = new Date().toISOString().slice(0, 10)

// 首都坐标映射
const COORDS = {
  '中国':[39.9,116.4],'美国':[38.9,-77],'英国':[51.5,-0.1],'法国':[48.9,2.4],
  '德国':[52.5,13.4],'俄罗斯':[55.8,37.6],'日本':[35.7,139.7],'韩国':[37.6,127],
  '印度':[28.6,77.2],'巴西':[-15.8,-47.9],'澳大利亚':[-33.9,151.2],'加拿大':[45.4,-75.7],
  '沙特阿拉伯':[24.7,46.7],'伊朗':[35.7,51.4],'以色列':[31.8,35.2],'南非':[-25.7,28.2],
  '尼日利亚':[9.1,8.7],'埃及':[30,31.2],'墨西哥':[19.4,-99.1],'阿根廷':[-34.6,-58.4],
  '土耳其':[41,29],'意大利':[41.9,12.5],'西班牙':[40.4,-3.7],'新加坡':[1.4,103.8],
  '泰国':[13.8,100.5],'越南':[21,105.8],'印尼':[-6.2,106.8],'巴基斯坦':[33.7,73],
  '阿联酋':[24.5,54.4],'欧洲':[50.9,4.4],'亚洲':[34,100],'中东':[25,45],
  '非洲':[9.1,40.5],'拉美':[-15,-55],'全球':[0,0],
}
function getCoords(c) { return COORDS[c] || [0,0] }

const body = JSON.stringify({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: '你是专业新闻编辑。当前日期是'+today+'（2026年7月16日）。只报道今天的新闻。列出今天全球15条最重要的真实新闻，覆盖所有地区：中国3条、美国2条、欧洲2条、亚洲2条、中东1条、非洲1条、拉美1条、全球财经1条、科技2条。每条30-60字，简洁权威。严格返回JSON数组：[{"country":"中国","city":"北京","category":"科技","title":"...","summary":"..."}]。分类用:财经/科技/民生/军事/国际。禁止使用2025年或更早的事件。' },
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
      const events = arr.map((x, i) => {
        const [lat, lng] = getCoords(x.country)
        return {
        id: 'news-' + Date.now() + '-' + i,
        city: x.city || x.country,
        country: x.country,
        lat, lng,
        category: x.category || '国际',
        title: x.title,
        summary: x.summary,
        color: '#ffffff',
        timestamp: new Date().toISOString(),
        source: 'DeepSeek'
      }})
      fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
      console.log('OK ' + events.length + ' events')
    } catch (e) { console.log('PARSE:', e.message.slice(0, 200)) }
  })
})
r.on('error', e => console.log('ERR:', e.message))
r.on('timeout', () => { r.destroy(); console.log('TIMEOUT') })
r.write(body)
r.end()
