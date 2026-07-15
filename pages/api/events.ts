import type { NextApiRequest, NextApiResponse } from 'next'
import { getEvents, addEvent } from '../../lib/eventsStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ events: getEvents() })
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const id = `event-${Date.now()}`;
      const ev = {
        id,
        city: body.city || '未知',
        country: body.country || '未知',
        lat: Number(body.lat) || 0,
        lng: Number(body.lng) || 0,
        category: body.category || '其他',
        title: body.title || '未命名事件',
        summary: body.summary || '',
        color: body.color || '#ffffff'
      };
      addEvent(ev);
      return res.status(201).json({ events: getEvents() });
    } catch (err) {
      return res.status(400).json({ error: 'invalid body' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
