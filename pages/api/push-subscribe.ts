/**
 * Web Push 订阅 API
 * Safari 16.4+ / Chrome / Edge / Firefox 兼容
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SUB_FILE = join(process.cwd(), 'data', 'push-subscriptions.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const sub = req.body
    if (!sub || !sub.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' })
    }
    try {
      const dir = join(process.cwd(), 'data')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      let subs: any[] = []
      if (existsSync(SUB_FILE)) {
        subs = JSON.parse(readFileSync(SUB_FILE, 'utf-8'))
      }
      // 去重
      subs = subs.filter(s => s.endpoint !== sub.endpoint)
      subs.push({ ...sub, createdAt: new Date().toISOString() })
      writeFileSync(SUB_FILE, JSON.stringify(subs, null, 2), 'utf-8')
      return res.status(200).json({ success: true, total: subs.length })
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
