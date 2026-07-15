import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'

const categories = ['全部', '战争', '能源', '科技', '政治', '商业', '自然灾害', '网络安全']
const catColors: Record<string, string> = {
  '战争': '#ff4d4f', '能源': '#f7b500', '科技': '#40a9ff',
  '政治': '#e74c3c', '商业': '#9b59b6', '自然灾害': '#ff6b35', '网络安全': '#ff0044'
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [filter, setFilter] = useState('全部')
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | null>(null)

  const loadEvents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.events || [])
      setCount((data.events || []).length)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadEvents() }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch { setSearchResults([]) }
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  const displayEvents = searchResults !== null ? searchResults
    : filter === '全部' ? events
    : events.filter((e: any) => e.category === filter)

  const displayCount = searchResults !== null ? searchResults.length : count

  return (
    <>
      <Head><title>事件列表 — AI World Monitor</title></Head>
      <header className="hero">
        <h1>📡 全球事件</h1>
        <p>共 {displayCount} 个事件 · 搜索或筛选</p>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索事件、国家、城市..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
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
        {displayEvents.map((ev: any, i: number) => (
          <motion.div
            key={ev.id}
            className="event-item"
            style={{ borderLeftColor: ev.color }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <span className="event-cat" style={{ color: ev.color }}>{ev.category}</span>
            <h3>{ev.title}</h3>
            <p>{ev.summary}</p>
            <div className="event-meta">
              <span>📍 {ev.city}, {ev.country}</span>
            </div>
          </motion.div>
        ))}
        {!loading && displayEvents.length === 0 && (
          <p className="muted" style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
            暂无 {filter === '全部' ? '事件' : filter + ' 类事件'}
          </p>
        )}
      </div>
    </>
  )
}
