import { useState, useEffect } from 'react'

const clocks = [
  { label: 'NYC', tz: 'America/New_York' },
  { label: 'LON', tz: 'Europe/London' },
  { label: 'BEI', tz: 'Asia/Shanghai' },
  { label: 'TYO', tz: 'Asia/Tokyo' },
  { label: 'DXB', tz: 'Asia/Dubai' },
  { label: 'UTC', tz: 'UTC' },
]

function getTime(tz: string) {
  return new Date().toLocaleTimeString('zh-CN', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' })
}

export default function WorldClock() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="sidebar-section">
      <h2>WORLD CLOCK</h2>
      <div className="clock-grid">
        {clocks.map(c => (
          <div key={c.tz} className="clock-item">
            <span className="clock-label">{c.label}</span>
            <span className="clock-time">{getTime(c.tz)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
