import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const navItems = [
  { href: '/', label: '🌐 地球', title: '全球态势' },
  { href: '/events', label: '📡 事件', title: '事件列表' },
  { href: '/timeline', label: '📅 时间轴', title: '时间轴' },
  { href: '/daily', label: '📰 日报', title: 'AI 日报' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <Link href="/" className="nav-brand">AI World Monitor</Link>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${router.pathname === item.href ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <span>AI World Monitor · {new Date().getFullYear()}</span>
        <span className="footer-dot">·</span>
        <span>Powered by DeepSeek &amp; Next.js</span>
      </footer>
    </div>
  )
}
