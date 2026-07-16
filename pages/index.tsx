import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const GlobeScene = dynamic(() => import('../components/GlobeScene'), { ssr: false });
const WorldClock = dynamic(() => import('../components/WorldClock'), { ssr: false });
const ChartsPanel = dynamic(() => import('../components/ChartsPanel'), { ssr: false });
const CryptoTicker = dynamic(() => import('../components/CryptoTicker'), { ssr: false });

export default function Home() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState<any>(null);
  const [prediction, setPrediction] = useState('');
  const [rankings, setRankings] = useState<any[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const [eventCount, setEventCount] = useState(0);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze');
      const data = await res.json();
      setAnalysis(data.analysis || '');
      if (data.analysis && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('AI 态势分析', { body: data.analysis.slice(0, 120) + '...' });
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    loadAnalysis();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // Load risk index
    fetch('/api/risk-index').then(r => r.json()).then(setRisk).catch(() => {});
    // Load prediction
    fetch('/api/prediction').then(r => r.json()).then(d => setPrediction(d.prediction || '')).catch(() => {});
    // Load stats
    fetch('/api/stats').then(r => r.json()).then(d => {
      setRankings(d.countryRanking?.slice(0, 5) || []);
      setCategoryDist(d.categoryDistribution || []);
      setEventCount(d.total || 0);
    }).catch(() => {});
  }, []);

  return (
    <div className="home-fullscreen">
      <section className="globe-stage">
        <GlobeScene />
      </section>

      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>态势感知</h2>
            <span className="live-dot" />
          </div>
          <p style={{
            fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)',
            marginTop: '0.25rem', fontFamily: 'var(--font-body)', fontWeight: 300,
          }}>
            AI World Monitor · 实时监控
          </p>
        </div>

        {/* AI Analysis */}
        <div className="sidebar-section">
          <h2>AI 分析</h2>
          {analysis ? <p className="analysis-text">{analysis}</p> : <p className="analysis-text" style={{color:'rgba(255,255,255,0.25)'}}>正在加载态势分析...</p>}
          <button className="btn btn-glass btn-block" onClick={loadAnalysis} disabled={loading}>
            {loading ? '分析中...' : '刷新分析'}
          </button>
        </div>

        {/* Risk Index */}
        {risk && (
          <div className="sidebar-section">
            <h2>风险指数</h2>
            <div className="risk-meter">
              <span className="risk-score" style={{ color: risk.score > 70 ? '#ff6b6b' : risk.score > 40 ? '#fbbf24' : '#4ade80' }}>
                {risk.score}
              </span>
              <span className="risk-level">{risk.level}</span>
            </div>
            <p className="analysis-text">{risk.summary}</p>
          </div>
        )}

        {categoryDist.length > 0 && <ChartsPanel data={categoryDist} />}

        {/* Country Ranking */}
        {rankings.length > 0 && (
          <div className="sidebar-section">
            <h2>国家热度</h2>
            <div className="rank-list">
              {rankings.map((r: any, i: number) => (
                <div key={r.name} className="rank-item">
                  <span className="rank-num">#{i + 1}</span>
                  <span className="rank-name">{r.name}</span>
                  <span className="rank-count">{r.count}事件</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prediction */}
        {prediction && (
          <div className="sidebar-section">
            <h2>AI 预测</h2>
            <p className="analysis-text" style={{ whiteSpace: 'pre-wrap' }}>{prediction}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="sidebar-section">
          <h2>导航</h2>
          <nav className="sidebar-nav">
            <a href="/events" className="sidebar-link">事件列表</a>
            <a href="/timeline" className="sidebar-link">时间轴</a>
            <a href="/daily" className="sidebar-link">AI 日报</a>
          </nav>
        </div>

        <WorldClock />
        <CryptoTicker />

        <div className="sidebar-meta" style={{ padding: '0.5rem' }}>
          <span>DeepSeek AI · Next.js 16</span>
        </div>
      </aside>
    </div>
  );
}
