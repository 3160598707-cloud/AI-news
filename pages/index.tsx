import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const GlobeScene = dynamic(() => import('../components/GlobeScene'), { ssr: false });

export default function Home() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze');
      const data = await res.json();
      const text = data.analysis || data.error || '';
      setAnalysis(text);
      if (text && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('AI 态势分析', { body: text.slice(0, 120) + '...' });
      }
    } catch { setAnalysis(''); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadAnalysis();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="home-fullscreen">
      {/* Globe fills the screen */}
      <section className="globe-stage">
        <GlobeScene />
      </section>

      {/* Floating sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-section">
          <h2>🤖 AI 态势</h2>
          {analysis ? (
            <p className="analysis-text">{analysis}</p>
          ) : (
            <p className="muted">分析加载中...</p>
          )}
          <button
            className="btn btn-glass btn-block"
            onClick={loadAnalysis}
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'} 刷新分析
          </button>
        </div>

        <div className="sidebar-section">
          <h2>📡 快捷入口</h2>
          <nav className="sidebar-nav">
            <a href="/events" className="sidebar-link">📡 事件列表</a>
            <a href="/daily" className="sidebar-link">📰 AI 日报</a>
          </nav>
        </div>

        <div className="sidebar-section sidebar-meta">
          <span>DeepSeek AI · Next.js 16</span>
        </div>
      </aside>
    </div>
  );
}
