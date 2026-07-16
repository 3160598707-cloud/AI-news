import type { NextApiRequest, NextApiResponse } from 'next'
import { getEvents } from '../../lib/eventsStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const events = getEvents()
  const format = req.query.format as string || 'json'
  if (format === 'csv') {
    const header = 'id,city,country,lat,lng,category,title,summary\n'
    const rows = events.map(e =>
      `"${e.id}","${e.city}","${e.country}",${e.lat},${e.lng},"${e.category}","${e.title}","${e.summary}"`
    ).join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=ai-monitor-events.csv')
    return res.status(200).send(header + rows)
  }
  res.status(200).json({ exported: new Date().toISOString(), total: events.length, events })
}
