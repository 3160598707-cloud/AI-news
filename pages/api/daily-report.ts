import type { NextApiRequest, NextApiResponse } from 'next'
import { generateDailyReport } from '../../lib/deepseek'
import { getEvents } from '../../lib/eventsStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const events = getEvents()
    if (events.length === 0) {
      return res.status(200).json({ report: '今日无事件，无法生成日报。' })
    }

    const report = await generateDailyReport(events)
    return res.status(200).json({ report, eventCount: events.length })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Report generation failed' })
  }
}
