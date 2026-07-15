import type { NextApiRequest, NextApiResponse } from 'next'
import { analyzeEvents } from '../../lib/deepseek'
import { getEvents } from '../../lib/eventsStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // POST with body: use provided events; otherwise use store
    const body = req.method === 'POST' ? req.body : null
    const events = (Array.isArray(body) && body.length > 0) ? body : getEvents()

    if (!events || events.length === 0) {
      return res.status(200).json({ analysis: '暂无事件可分析。' })
    }

    const analysis = await analyzeEvents(events)
    return res.status(200).json({ analysis, eventCount: events.length })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Analysis failed' })
  }
}
