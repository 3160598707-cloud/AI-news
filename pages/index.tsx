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
      setAnalysis(data.analysis || data.error || '');
    } catch {
      setAnalysis('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalysis(); }, []);

  return (
    <main>
      <header className="hero">
        <h1>AI World Intelligence Monitor</h1>
        <p>私人全球情报助手 · 3D 地球可视化 · AI 态势分析</p>
        <nav className="hero-nav">
          <a href="/daily" className="btn">📰 AI 日报</a>
          <button className="btn btn-secondary" onClick={loadAnalysis} disabled={loading}>
            {loading ? '⏳ 分析中...' : '🔄 刷新分析'}
          </button>
        </nav>
      </header>
      <section className="panel">
        <GlobeScene />
      </section>
      <section className="summary-grid">
        <div className="card">
          <h2>🤖 AI 态势分析</h2>
          {analysis ? (
            <p className="analysis-text">{analysis}</p>
          ) : (
            <p className="muted">点击上方「刷新分析」获取 AI 洞察</p>
          )}
        </div>
        <div className="card">
          <h2>📡 系统模块</h2>
          <ul>
            <li>全球 3D 地球视图</li>
            <li>RSS 新闻自动采集</li>
            <li>DeepSeek AI 分析</li>
            <li>AI 日报自动生成</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
