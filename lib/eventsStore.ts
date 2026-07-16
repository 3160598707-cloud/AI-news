type EventItem = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  category: string;
  title: string;
  summary: string;
  color: string;
  timestamp?: string;
  source?: string;
  riskLevel?: string;
  impact?: number;
  tags?: string[];
  link?: string;
};

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_FILE = join(process.cwd(), 'data', 'events.json')

function loadFromDisk(): EventItem[] {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch { /* ignore corrupt file */ }
  return []
}

function saveToDisk(items: EventItem[]) {
  try {
    const dir = join(process.cwd(), 'data')
    if (!existsSync(dir)) {
      const { mkdirSync } = require('fs')
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8')
  } catch { /* ignore write error */ }
}

// Initialize: load from disk only — no seed data (news_engine.js handles this)
let events: EventItem[] = loadFromDisk()

export function getEvents() {
  return events;
}

export function addEvent(ev: EventItem) {
  events = [ev, ...events];
  saveToDisk(events)
  return events;
}

export function replaceEvents(newEvents: EventItem[]) {
  events = newEvents;
  saveToDisk(events)
  return events;
}

export function searchEvents(query: string): EventItem[] {
  const q = query.toLowerCase()
  return events.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.summary.toLowerCase().includes(q) ||
    e.country.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    e.city.toLowerCase().includes(q)
  )
}

export function getStats() {
  const countryCount: Record<string, number> = {}
  const categoryCount: Record<string, number> = {}
  for (const e of events) {
    countryCount[e.country] = (countryCount[e.country] || 0) + 1
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1
  }
  const countryRanking = Object.entries(countryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
  const categoryDistribution = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
  return { total: events.length, countryRanking, categoryDistribution }
}
