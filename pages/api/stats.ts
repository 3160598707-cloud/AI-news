import type { NextApiRequest, NextApiResponse } from 'next'
import { getStats } from '../../lib/eventsStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getStats())
}
