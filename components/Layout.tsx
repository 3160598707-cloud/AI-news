import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const navItems = [
  { href: '/', label: '地球' },
  { href: '/events', label: '事件' },
  { href: '/timeline', label: '时间轴' },
  { href: '/daily', label: '日报' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      {/* Floating liquid-glass nav */}
      <nav className="top-nav">
        <Link href="/" className="nav-brand" aria-label="首页">
          A
        </Link>
        <div className="nav-links">
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
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
          style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '4rem', left: '1rem', right: '1rem', zIndex: 199,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(24px)',
          borderRadius: '1rem', padding: '0.75rem',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${router.pathname === item.href ? 'active' : ''}`}
              style={{ display: 'block', textAlign: 'center', padding: '0.6rem' }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <main className="main-content">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`mobile-nav-link ${router.pathname === item.href ? 'active' : ''}`}>
              <span className="mobile-nav-icon">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="footer">
        <span>AI World Monitor · {new Date().getFullYear()}</span>
        <span style={{ margin: '0 0.4rem', opacity: 0.3 }}>·</span>
        <span>Powered by DeepSeek &amp; Next.js</span>
      </footer>
    </div>
  )
}
