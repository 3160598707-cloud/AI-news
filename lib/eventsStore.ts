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

// Seed data — only used when no disk data exists
const seedEvents: EventItem[] = [
  { id: 'event-1', city: '基辅', country: '乌克兰', lat: 50.4501, lng: 30.5234, category: '战争', title: '乌克兰前线冲突升级', summary: '东部战区出现新一轮军事交火，双方投入重型装备，局势持续紧张。', color: '#ffffff' },
  { id: 'event-2', city: '利雅得', country: '沙特阿拉伯', lat: 24.7136, lng: 46.6753, category: '能源', title: '布伦特原油价格波动超3%', summary: '受中东局势与OPEC+供应不确定性影响，国际油价日内大幅震荡。', color: '#cccccc' },
  { id: 'event-3', city: '深圳', country: '中国', lat: 22.5429, lng: 114.0596, category: '科技', title: '新一代 AI 芯片发布', summary: '国产 AI 训练芯片性能首次超越国际主流产品。', color: '#00c8dc' },
  { id: 'event-4', city: '华盛顿', country: '美国', lat: 38.9072, lng: -77.0369, category: '政治', title: '美中半导体谈判新进展', summary: '双方就出口管制达成初步框架协议。', color: '#999999' },
  { id: 'event-5', city: '东京', country: '日本', lat: 35.6762, lng: 139.6503, category: '商业', title: '日元贬值创34年新低', summary: '日本央行维持宽松政策，日元兑美元跌破160关口。', color: '#aaaaaa' },
  { id: 'event-6', city: '新加坡', country: '新加坡', lat: 1.3521, lng: 103.8198, category: '商业', title: '东南亚电商GMV增长40%', summary: 'Shopee与Lazada跨境订单激增，中国卖家占主导。', color: '#aaaaaa' },
  { id: 'event-7', city: '伦敦', country: '英国', lat: 51.5074, lng: -0.1278, category: '商业', title: '英镑回升至1.30关口', summary: '英国央行鹰派言论推动英镑走强。', color: '#aaaaaa' },
  { id: 'event-8', city: '布鲁塞尔', country: '比利时', lat: 50.8503, lng: 4.3517, category: '政治', title: '欧盟通过AI监管法案', summary: '全球首部全面AI法规落地。', color: '#999999' },
  { id: 'event-9', city: '台北', country: '中国台湾', lat: 25.0330, lng: 121.5654, category: '科技', title: '台积电2nm工艺试产成功', summary: '先进制程良率超预期。', color: '#00c8dc' },
  { id: 'event-10', city: '新德里', country: '印度', lat: 28.6139, lng: 77.2090, category: '科技', title: '印度航天器成功着陆月球南极', summary: '成为第四个实现月球软着陆的国家。', color: '#00c8dc' },
  { id: 'event-11', city: '莫斯科', country: '俄罗斯', lat: 55.7558, lng: 37.6173, category: '能源', title: '俄中天然气管道全线贯通', summary: '年输气量达380亿立方米。', color: '#cccccc' },
  { id: 'event-12', city: '开普敦', country: '南非', lat: -33.9249, lng: 18.4241, category: '政治', title: '金砖峰会通过扩员方案', summary: '新增6个成员国。', color: '#999999' },
  { id: 'event-13', city: '首尔', country: '韩国', lat: 37.5665, lng: 126.9780, category: '科技', title: '三星发布AI手机Galaxy S26', summary: '端侧大模型实时翻译。', color: '#00c8dc' },
  { id: 'event-14', city: '纽约', country: '美国', lat: 40.7128, lng: -74.0060, category: '商业', title: '比特币突破12万美元', summary: '机构资金持续流入，ETF净申购创纪录。', color: '#aaaaaa' },
  { id: 'event-15', city: '日内瓦', country: '瑞士', lat: 46.2044, lng: 6.1432, category: '政治', title: '联合国气候变化大会达成新协议', summary: '195国同意2035年前减排60%目标。', color: '#999999' },
  { id: 'event-16', city: '洛杉矶', country: '美国', lat: 34.0522, lng: -118.2437, category: '自然灾害', title: '加州7.2级地震引发山火', summary: '震中位于洛杉矶北部，已触发海啸预警。', color: '#888888' },
  { id: 'event-17', city: '孟买', country: '印度', lat: 19.0760, lng: 72.8777, category: '网络安全', title: '南亚金融机构遭勒索软件攻击', summary: '超过20家银行系统被加密。', color: '#666666' },
  { id: 'event-18', city: '东京', country: '日本', lat: 35.6762, lng: 139.6503, category: '自然灾害', title: '超强台风"天鹰"逼近日本', summary: '预计明日登陆九州，最大风速65m/s。', color: '#888888' },
];

// Initialize: load from disk or seed
let events: EventItem[] = loadFromDisk()
if (events.length === 0) {
  events = [...seedEvents]
  saveToDisk(events)
}

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
