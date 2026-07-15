import type { NextApiRequest, NextApiResponse } from 'next'
import { searchEvents } from '../../lib/eventsStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string) || ''
  if (!q.trim()) return res.status(200).json({ results: [], query: q })
  const results = searchEvents(q)
  res.status(200).json({ results, query: q, total: results.length })
}
