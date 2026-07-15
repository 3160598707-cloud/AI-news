import type { NextApiRequest, NextApiResponse } from 'next'
import { generatePrediction } from '../../lib/deepseek'
import { getEvents } from '../../lib/eventsStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prediction = await generatePrediction(getEvents())
    res.status(200).json({ prediction })
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Prediction failed' })
  }
}
