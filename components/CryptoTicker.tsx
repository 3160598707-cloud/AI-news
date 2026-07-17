import { useState, useEffect } from 'react'

const coins = [
  { id: 'bitcoin', label: 'BTC', symbol: '₿' },
  { id: 'ethereum', label: 'ETH', symbol: 'Ξ' },
  { id: 'solana', label: 'SOL', symbol: '◎' },
]

export default function CryptoTicker() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/AI-news/api/crypto.json')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
    const id = setInterval(() => {
      fetch('/AI-news/api/crypto.json').then(r => r.json()).then(setData).catch(() => {})
    }, 60000)
    return () => clearInterval(id)
  }, [])

  if (!data) return null

  return (
    <div className="sidebar-section">
      <h2>加密货币</h2>
      <div className="crypto-list">
        {coins.map(c => {
          const d = data[c.id]
          if (!d) return null
          const change = d.usd_24h_change || 0
          const sign = change >= 0 ? '+' : ''
          return (
            <div key={c.id} className="crypto-item">
              <span className="crypto-symbol">{c.symbol}</span>
              <span className="crypto-label">{c.label}</span>
              <span className="crypto-price">${d.usd?.toLocaleString() || '--'}</span>
              <span className="crypto-change" style={{ color: change >= 0 ? '#2ecc71' : '#e74c3c' }}>
                {sign}{change.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
