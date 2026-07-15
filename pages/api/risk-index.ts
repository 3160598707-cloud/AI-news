import type { NextApiRequest, NextApiResponse } from 'next'
import { generateRiskIndex } from '../../lib/deepseek'
import { getEvents } from '../../lib/eventsStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const risk = await generateRiskIndex(getEvents())
    res.status(200).json(risk)
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Risk index failed' })
  }
}
