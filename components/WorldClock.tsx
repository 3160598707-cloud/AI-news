import { useState, useEffect } from 'react'

const clocks = [
  { label: '纽约', tz: 'America/New_York', flag: '🇺🇸' },
  { label: '伦敦', tz: 'Europe/London', flag: '🇬🇧' },
  { label: '北京', tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { label: '东京', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: '迪拜', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { label: 'UTC', tz: 'UTC', flag: '🌐' },
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
      <h2>🕐 世界时钟</h2>
      <div className="clock-grid">
        {clocks.map(c => (
          <div key={c.tz} className="clock-item">
            <span className="clock-flag">{c.flag}</span>
            <span className="clock-label">{c.label}</span>
            <span className="clock-time">{getTime(c.tz)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
