import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

interface EventItem {
  id: string; city: string; country: string;
  lat: number; lng: number; category: string;
  title: string; summary: string; color: string;
}

export default function GlobeScene() {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!globeEl.current) return;

    (async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        const evs = (data.events || []) as EventItem[];
        setEvents(evs);
        if (evs.length === 0) return;
        setSelected(evs[0]);

        const el = globeEl.current!;
        const globe = new Globe(el)
          .width(el.clientWidth)
          .height(el.clientHeight)
          .backgroundColor('#000000')
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .atmosphereColor('#1a3a5c')
          .atmosphereAltitude(0.25)
          .pointsData(evs)
          .pointLat('lat')
          .pointLng('lng')
          .pointColor('color')
          .pointAltitude(0.015)
          .pointRadius(0.35)
          .pointLabel((d: any) =>
            `<b>${d.category}</b><br/>${d.title}<br/><small>📍 ${d.city}, ${d.country}</small>`
          )
          .onPointClick((point: any) => {
            setSelected(point);
            setInsight('');
            globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
          });

        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.4;
        globe.controls().enableZoom = true;
        globe.controls().minDistance = 150;
        globe.controls().maxDistance = 600;

        globeRef.current = globe;

        const handleResize = () => {
          if (globeEl.current) {
            globe.width(globeEl.current.clientWidth);
            globe.height(globeEl.current.clientHeight);
          }
        };
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          globe._destructor?.();
        };
      } catch (err) {
        console.error('Failed to load events', err);
      }
    })();
  }, []);

  const resetView = () => {
    globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 3.5 }, 800);
  };

  const analyzeEvent = async () => {
    if (!selected) return;
    setInsightLoading(true);
    setInsight('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([selected])
      });
      const data = await res.json();
      setInsight(data.analysis || data.error || '');
    } catch {
      setInsight('');
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="globe-wrapper">
      <div ref={globeEl} className="globe-canvas" />

      {/* Top bar */}
      <div className="globe-topbar">
        <span className="globe-title">AI World Monitor</span>
        <span className="globe-subtitle">{events.length} 个全球热点</span>
      </div>

      {/* Reset view button */}
      <button className="globe-reset" onClick={resetView} title="重置视角">
        🌍
      </button>

      {/* Event card */}
      {selected ? (
        <div className="event-card glass">
          <span className="event-badge" style={{ background: selected.color }}>
            {selected.category}
          </span>
          <h2>{selected.title}</h2>
          <p>{selected.summary}</p>
          <div className="event-meta-row">
            <span>📍 {selected.city}, {selected.country}</span>
          </div>
          <button
            className="btn btn-glass"
            onClick={analyzeEvent}
            disabled={insightLoading}
          >
            {insightLoading ? '⏳ AI 分析中...' : '🤖 AI 深度分析'}
          </button>
          {insight && <p className="event-insight">{insight}</p>}
        </div>
      ) : (
        <div className="event-card glass">
          <p className="muted">正在加载全球事件...</p>
        </div>
      )}

      {/* Bottom legend */}
      <div className="globe-legend">
        <span className="legend-dot" style={{ '--c': '#ff4d4f' } as any}>战争</span>
        <span className="legend-dot" style={{ '--c': '#f7b500' } as any}>能源</span>
        <span className="legend-dot" style={{ '--c': '#40a9ff' } as any}>科技</span>
        <span className="legend-dot" style={{ '--c': '#9b59b6' } as any}>商业</span>
        <span className="legend-dot" style={{ '--c': '#e74c3c' } as any}>政治</span>
      </div>
    </div>
  );
}
