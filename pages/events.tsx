import { useState, useEffect } from 'react'
import Head from 'next/head'

const categories = ['全部', '战争', '能源', '科技', '政治', '商业', '跨境电商']
const catColors: Record<string, string> = {
  '战争': '#ff4d4f', '能源': '#f7b500', '科技': '#40a9ff',
  '政治': '#ff4d4f', '商业': '#9b59b6', '跨境电商': '#2ecc71'
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [filter, setFilter] = useState('全部')
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  const loadEvents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.events || [])
      setCount((data.events || []).length)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { loadEvents() }, [])

  const filtered = filter === '全部'
    ? events
    : events.filter((e: any) => e.category === filter)

  return (
    <>
      <Head><title>事件列表 — AI World Monitor</title></Head>
      <header className="hero">
        <h1>📡 全球事件</h1>
        <p>共 {count} 个事件 · 点击分类筛选</p>
      </header>

      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
            style={cat !== '全部' ? { borderColor: catColors[cat] || '#555' } : {}}
          >
            {cat}
          </button>
        ))}
        <button className="filter-chip" onClick={loadEvents} title="刷新">
          🔄
        </button>
      </div>

      {loading && <p className="loading">⏳ 加载中...</p>}

      <div className="events-grid">
        {filtered.map((ev: any) => (
          <div key={ev.id} className="event-item" style={{ borderLeftColor: ev.color }}>
            <span className="event-cat" style={{ color: ev.color }}>{ev.category}</span>
            <h3>{ev.title}</h3>
            <p>{ev.summary}</p>
            <div className="event-meta">
              <span>📍 {ev.city}, {ev.country}</span>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="muted" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
            暂无 {filter === '全部' ? '事件' : filter + ' 类事件'}
          </p>
        )}
      </div>
    </>
  )
}
