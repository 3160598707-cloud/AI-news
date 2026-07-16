import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

interface EventItem {
  id: string; city: string; country: string;
  lat: number; lng: number; category: string;
  title: string; summary: string; color: string;
}

/** Build arc connections between events of same category for visual links */
function buildArcs(events: EventItem[]) {
  const arcs: { startLat: number; startLng: number; endLat: number; endLng: number; color: string }[] = []
  const byCat: Record<string, EventItem[]> = {}
  for (const e of events) {
    (byCat[e.category] ||= []).push(e)
  }
  for (const items of Object.values(byCat)) {
    for (let i = 0; i < items.length - 1; i++) {
      arcs.push({
        startLat: items[i].lat, startLng: items[i].lng,
        endLat: items[i + 1].lat, endLng: items[i + 1].lng,
        color: items[i].color
      })
    }
  }
  return arcs
}

export default function GlobeScene() {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [globeStatus, setGlobeStatus] = useState('initializing');
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const retryCount = useRef(0);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aim_favorites');
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch { }
  }, []);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFavorites(next);
    localStorage.setItem('aim_favorites', JSON.stringify([...next]));
  };

  const shareEvent = async () => {
    if (!selected) return;
    const text = `[${selected.category}] ${selected.title} — ${selected.summary} 📍 ${selected.city}, ${selected.country}`;
    if (navigator.share) {
      try { await navigator.share({ title: selected.title, text }) } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    }
  };

  useEffect(() => {
    if (!globeEl.current) return;
    let destroyed = false;

    const initGlobe = async () => {
      if (destroyed || !globeEl.current) return;
      // Force dimensions on mobile — use window if container is 0
      const w = globeEl.current.clientWidth || window.innerWidth;
      const h = globeEl.current.clientHeight || window.innerHeight;
      if (w < 10 || h < 10) {
        retryCount.current++;
        if (retryCount.current > 20 || isMobile) {
          setGlobeStatus(isMobile ? 'no-webgl' : 'failed');
          return;
        }
        setTimeout(initGlobe, 500);
        return;
      }
      if (isMobile) { setGlobeStatus('no-webgl'); return; }
      setGlobeStatus('loading');
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        const evs = (data.events || []) as EventItem[];
        setEvents(evs);
        if (evs.length === 0) { setGlobeStatus('failed'); return; }
        setSelected(evs[0]);

        // Check WebGL support
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!gl) {
          setGlobeStatus('no-webgl');
          return;
        }

        const el = globeEl.current!;
        el.style.width = w + 'px';
        el.style.height = h + 'px';

        // Build enhanced arc connections — link all events of same category
        const arcs = buildArcs(evs);

        const globe = new Globe(el)
          .width(w)
          .height(h)
          .backgroundColor('#020408')
          // 陆地/海洋灰阶分明 — 陆地亮灰、海洋暗黑
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .showGraticules(false)
          .globeMaterial({
            color: 0x888888,
            emissive: 0x010203,
            roughness: 0.5,
            metalness: 0.08,
            bumpScale: 0.02,
            opacity: 0.9,
            transparent: true,
          })
          .atmosphereColor('#050d18')
          .atmosphereAltitude(0.18)
          // 弧线 — 蓝绿色科技质感
          .arcsData(arcs)
          .arcColor((d: any) => {
            const cat = d.category || '';
            if (cat.includes('军事')) return '#ff5566';
            if (cat.includes('财经')) return '#ffb347';
            if (cat.includes('科技')) return '#4dc9f6';
            return '#88ccff';
          })
          .arcAltitude(0.4)
          .arcStroke(1.6)
          .arcDashLength(0.6)
          .arcDashGap(0.04)
          .arcDashAnimateTime(1600)
          .arcsTransitionDuration(600)
          .arcLabel((d: any) => `${d.category || ''} · 事件链路`)
          // 事件点 — 发光标记
          .pointsData(evs)
          .pointLat('lat')
          .pointLng('lng')
          .pointColor((d: any) => {
            const cat = d.category || '';
            if (cat.includes('军事')||cat.includes('战争')) return '#ff4455';
            if (cat.includes('财经')||cat.includes('金融')) return '#ffaa33';
            if (cat.includes('科技')) return '#44bbff';
            if (cat.includes('民生')) return '#44dd88';
            return '#aaccff';
          })
          .pointAltitude(0.03)
          .pointRadius((d: any) => {
            const cat = d.category || '';
            return ['军事','战争'].some(c => cat.includes(c)) ? 0.55 : 0.4;
          })
          .pointLabel((d: any) =>
            `<div style="background:rgba(5,10,25,0.92);padding:6px 12px;border-radius:8px;border:1px solid rgba(100,180,255,0.2);color:#e0ecff;font-size:12px;line-height:1.4;max-width:220px">
              <b style="color:#4dc9f6">${d.category}</b><br/>
              ${d.title}<br/>
              <small style="opacity:0.5">📍 ${d.city}, ${d.country}</small>
            </div>`
          )
          .onPointClick((point: any) => {
            setSelected(point);
            setInsight('');
            globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
          });

        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.35;
        globe.controls().enableZoom = true;
        globe.controls().minDistance = 160;
        globe.controls().maxDistance = 550;

        // 高像素比渲染 — 清晰锐利
        try {
          const renderer = (globe as any).renderer();
          if (renderer) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }
        } catch {}

        globeRef.current = globe;
        setGlobeStatus('ready');

        // Load country polygons with clear labels
        try {
          const geoRes = await fetch('/countries.geojson');
          if (geoRes.ok) {
            const countries = await geoRes.json();
            (globe as any)
              .polygonsData(countries.features)
              .polygonCapColor((d: any) => {
                const name = d.properties?.name || '';
                const hasEvent = evs.some(e => (e.country||'').includes(name)||name.includes(e.country||''));
                return hasEvent ? 'rgba(40,40,40,0.35)' : 'rgba(15,15,18,0.1)';
              })
              .polygonSideColor(() => 'rgba(10,10,14,0.04)')
              .polygonStrokeColor((d: any) => {
                const name = d.properties?.name || '';
                const hasEvent = evs.some(e => (e.country||'').includes(name)||name.includes(e.country||''));
                return hasEvent ? 'rgba(120,180,210,0.45)' : 'rgba(70,80,90,0.25)';
              })
              .polygonAltitude(0.003)
              .polygonLabel((d: any) => {
                const name = d.properties?.name || '';
                const count = evs.filter(e => (e.country||'').includes(name)||name.includes(e.country||'')).length;
                const ev = evs.find(e => (e.country||'').includes(name)||name.includes(e.country||''));
                const city = ev?.city || '';
                const label = city && city !== name ? `${name} · ${city}` : name;
                if (count > 0) {
                  return `<div style="background:rgba(8,8,8,0.92);padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.12);color:#ccc;font-size:11px;font-weight:500;white-space:nowrap;letter-spacing:0.02em">
                    ${label}<br><span style="font-size:9px;color:#888">${count} 事件</span></div>`;
                }
                return `<div style="color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:0.04em">${name}</div>`;
              });
          }
        } catch { /* graceful */ }

        // Add city/capital name labels floating on the globe
        try {
          const cityLabels = evs.map(e => ({
            lat: e.lat, lng: e.lng, city: e.city, country: e.country,
          }));
          (globe as any)
            .htmlElementsData(cityLabels)
            .htmlElement((d: any) => {
              const el = document.createElement('div');
              el.innerHTML = `<div style="
                background:rgba(12,12,12,0.88);color:#aaa;font-size:9px;
                padding:2px 7px;border-radius:3px;white-space:nowrap;
                border:1px solid rgba(255,255,255,0.08);
                pointer-events:none;font-weight:400;letter-spacing:0.05em;
                transform:translate(-50%,-130%);
              ">${d.city}</div>`;
              return el;
            })
            .htmlLat('lat')
            .htmlLng('lng')
            .htmlAltitude(0.05);
        } catch {}

        // Add ring effects around event points
        const ringData = evs.map(e => ({ ...e, ringRadius: 0.9 + Math.random() * 1.5 }));
        (globe as any)
          .ringsData(ringData)
          .ringLat('lat')
          .ringLng('lng')
          .ringColor(() => 'rgba(180,190,200,0.12)')
          .ringMaxRadius('ringRadius')
          .ringPropagationSpeed(0.5)
          .ringRepeatPeriod(2200);

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
        console.error('Globe init failed', err);
        setGlobeStatus('failed');
      }
    };

    const cleanup = () => { destroyed = true; };
    initGlobe();
    return cleanup;
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
        <span className="globe-title">全球情报</span>
        <span className="globe-subtitle">{events.length} 事件</span>
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
            <span style={{ display: 'flex', gap: '0.3rem' }}>
              <button className="fav-btn" onClick={() => toggleFavorite(selected.id)} title="收藏">
                {favorites.has(selected.id) ? '★' : '☆'}
              </button>
              <button className="fav-btn" onClick={shareEvent} title="分享">分享</button>
            </span>
          </div>
          <button
            className="btn btn-glass"
            onClick={analyzeEvent}
            disabled={insightLoading}
          >
            {insightLoading ? '分析中...' : 'AI 分析'}
          </button>
          {insight && <p className="event-insight">{insight}</p>}
        </div>
      ) : globeStatus === 'no-webgl' ? (
        <div className="event-card glass" style={{ maxHeight: '70vh', overflowY: 'auto', position: 'absolute', top: '3.5rem', left: '0.8rem', right: '0.8rem', bottom: '3.5rem', maxWidth: 'none', width: 'auto' }}>
          <span className="event-badge" style={{ background: 'var(--accent)' }}>📱 MOBILE</span>
          <h2>全球热点 · {events.length} 事件</h2>
          {events.slice(0, 12).map(ev => (
            <div key={ev.id} className="mobile-event-item"
                 onClick={() => { setSelected(ev); setInsight(''); }}
                 style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
              <span style={{ color: ev.color, fontSize: '0.65rem', textTransform: 'uppercase' }}>{ev.category}</span>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0.15rem 0' }}>{ev.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>📍 {ev.city}, {ev.country}</div>
            </div>
          ))}
          {selected && (
            <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,200,220,0.05)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <span style={{ color: (selected as EventItem).color, fontSize: '0.65rem' }}>{(selected as EventItem).category}</span>
              <h3 style={{ margin: '0.3rem 0', fontSize: '1rem' }}>{(selected as EventItem).title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{(selected as EventItem).summary}</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                <button className="btn btn-glass" onClick={analyzeEvent} disabled={insightLoading} style={{ flex: 1 }}>
                  {insightLoading ? '...' : '分析'} AI
                </button>
                <button className="btn btn-glass" onClick={() => toggleFavorite((selected as EventItem).id)} style={{ flex: 1 }}>
                  {favorites.has((selected as EventItem).id) ? '★' : '☆'} 收藏
                </button>
                <button className="btn btn-glass" onClick={shareEvent} style={{ flex: 1 }}>分享</button>
              </div>
              {insight && <p style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--accent)' }}>{insight}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="event-card glass">
          <p className="muted">
            {globeStatus === 'failed' ? '⚠️ 地球渲染失败，请检查 WebGL 支持' : '正在初始化 3D 地球...'}
          </p>
        </div>
      )}

      {/* Bottom legend */}
      <div className="globe-legend">
        <span className="legend-dot" style={{ '--c': '#ff4d4f' } as any}>战争</span>
        <span className="legend-dot" style={{ '--c': '#f7b500' } as any}>能源</span>
        <span className="legend-dot" style={{ '--c': '#40a9ff' } as any}>科技</span>
        <span className="legend-dot" style={{ '--c': '#9b59b6' } as any}>商业</span>
        <span className="legend-dot" style={{ '--c': '#e74c3c' } as any}>政治</span>
        <span className="legend-dot" style={{ '--c': '#ff6b35' } as any}>灾害</span>
        <span className="legend-dot" style={{ '--c': '#ff0044' } as any}>网安</span>
      </div>

      {/* HUD corner */}
      <div className="globe-hud">
        <div className="globe-hud-item">NODES <span className="globe-hud-val">{events.length}</span></div>
        <div className="globe-hud-item">LAT <span className="globe-hud-val">{selected?.lat?.toFixed(2) || '--'}</span></div>
        <div className="globe-hud-item">LNG <span className="globe-hud-val">{selected?.lng?.toFixed(2) || '--'}</span></div>
      </div>
    </div>
  );
}
