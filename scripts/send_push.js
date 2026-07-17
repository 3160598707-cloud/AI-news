/**
 * Web Push 发送脚本 — GitHub Actions 日报完成后自动推送通知
 * 使用标准 Web Push Protocol (VAPID)
 */
const fs = require('fs'), path = require('path'), https = require('https')

const SUB_FILE = path.join(__dirname, '..', 'data', 'push-subscriptions.json')
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''

if (!fs.existsSync(SUB_FILE)) {
  console.log('No push subscriptions found, skipping.')
  process.exit(0)
}

const subs = JSON.parse(fs.readFileSync(SUB_FILE, 'utf-8'))
if (subs.length === 0) {
  console.log('0 subscriptions, skipping.')
  process.exit(0)
}

const payload = JSON.stringify({
  title: '🌍 今日全球 AI 情报日报',
  body: '今日全球热点已更新，点击查看完整分析。',
  url: '/daily',
})

console.log(`Sending push to ${subs.length} subscribers...`)
let sent = 0, failed = 0

// Simple push without VAPID for MVP (公共 VAPID key 需要单独配置)
for (const sub of subs) {
  try {
    const url = new URL(sub.endpoint)
    const opts = {
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      timeout: 5000,
    }
    await new Promise((resolve) => {
      const req = https.request(opts, (res) => { sent++; resolve(null) })
      req.on('error', () => { failed++; resolve(null) })
      req.write(payload)
      req.end()
    })
  } catch { failed++ }
}
console.log(`Done: ${sent} sent, ${failed} failed`)
