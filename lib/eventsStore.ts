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

let events: EventItem[] = [
  {
    id: 'event-1',
    city: '基辅',
    country: '乌克兰',
    lat: 50.4501,
    lng: 30.5234,
    category: '战争',
    title: '前线冲突升级',
    summary: '该地区出现新的军事交火，局势仍不稳定。',
    color: '#ff4d4f'
  },
  {
    id: 'event-2',
    city: '利雅得',
    country: '沙特阿拉伯',
    lat: 24.7136,
    lng: 46.6753,
    category: '能源',
    title: '原油价格波动',
    summary: '能源供应变化引发市场关注。',
    color: '#f7b500'
  },
  {
    id: 'event-3',
    city: '深圳',
    country: '中国',
    lat: 22.5429,
    lng: 114.0596,
    category: '科技',
    title: 'AI 技术发布',
    summary: '新一代 AI 芯片获得市场认可。',
    color: '#40a9ff'
  }
];

export function getEvents() {
  return events;
}

export function addEvent(ev: EventItem) {
  events = [ev, ...events];
  return events;
}

export function replaceEvents(newEvents: EventItem[]) {
  events = newEvents;
  return events;
}
