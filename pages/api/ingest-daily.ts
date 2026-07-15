import type { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const file = join(process.cwd(), 'daily_news.txt');
  if (!existsSync(file)) {
    return res.status(404).json({ error: 'daily_news.txt not found; run generate.py' });
  }

  try {
    const content = readFileSync(file, 'utf-8');
    return res.status(200).json({ content });
  } catch (err) {
    return res.status(500).json({ error: 'failed to read file' });
  }
}
