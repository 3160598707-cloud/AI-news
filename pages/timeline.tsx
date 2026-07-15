import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        setEvents(data.events || [])
      } catch { /* */ }
      finally { setLoading(false) }
    })()
  }, [])

  return (
    <>
      <Head><title>时间轴 — AI World Monitor</title></Head>
      <header className="hero">
        <h1>📅 全球事件时间轴</h1>
        <p>{events.length} 个事件 · 按时间排列</p>
      </header>

      {loading && <p className="loading">⏳ 加载中...</p>}

      <div className="timeline">
        {events.map((ev: any, i: number) => (
          <div key={ev.id} className="timeline-item">
            <div className="timeline-dot" style={{ background: ev.color }} />
            <div className="timeline-card">
              <div className="timeline-header">
                <span className="event-cat" style={{ color: ev.color }}>{ev.category}</span>
                <span className="timeline-index">#{events.length - i}</span>
              </div>
              <h3>{ev.title}</h3>
              <p>{ev.summary}</p>
              <span className="event-meta">📍 {ev.city}, {ev.country}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && events.length === 0 && (
        <p className="muted" style={{ textAlign: 'center' }}>暂无事件</p>
      )}
    </>
  )
}
