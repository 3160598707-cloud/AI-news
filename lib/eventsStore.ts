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
    title: '乌克兰前线冲突升级',
    summary: '东部战区出现新一轮军事交火，双方投入重型装备，局势持续紧张。国际社会呼吁停火。',
    color: '#ff4d4f'
  },
  {
    id: 'event-2',
    city: '利雅得',
    country: '沙特阿拉伯',
    lat: 24.7136,
    lng: 46.6753,
    category: '能源',
    title: '布伦特原油价格波动超3%',
    summary: '受中东局势与OPEC+供应不确定性影响，国际油价日内大幅震荡。',
    color: '#f7b500'
  },
  {
    id: 'event-3',
    city: '深圳',
    country: '中国',
    lat: 22.5429,
    lng: 114.0596,
    category: '科技',
    title: '新一代 AI 芯片发布',
    summary: '国产 AI 训练芯片性能首次超越国际主流产品，带动科技股上涨。',
    color: '#40a9ff'
  },
  {
    id: 'event-4',
    city: '华盛顿',
    country: '美国',
    lat: 38.9072,
    lng: -77.0369,
    category: '政治',
    title: '美中贸易谈判新进展',
    summary: '双方就半导体出口管制达成初步框架协议，市场情绪回暖。',
    color: '#ff4d4f'
  },
  {
    id: 'event-5',
    city: '东京',
    country: '日本',
    lat: 35.6762,
    lng: 139.6503,
    category: '商业',
    title: '日元贬值创34年新低',
    summary: '日本央行维持宽松政策，日元兑美元跌破160关口，出口企业受益。',
    color: '#9b59b6'
  },
  {
    id: 'event-6',
    city: '新加坡',
    country: '新加坡',
    lat: 1.3521,
    lng: 103.8198,
    category: '跨境电商',
    title: '东南亚电商GMV增长40%',
    summary: 'Shopee与Lazada季度报告显示跨境订单激增，中国卖家占主导。',
    color: '#2ecc71'
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
