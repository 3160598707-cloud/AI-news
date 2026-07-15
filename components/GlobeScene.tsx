import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
// events are now provided by the server API at /api/events

export default function GlobeScene() {
  const globeEl = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    let globeInstance: any | null = null;
    if (!globeEl.current) return;

    (async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data.events || []);
        if (!data.events || data.events.length === 0) return;

        setSelected(data.events[0]);

        globeInstance = new Globe(globeEl.current as HTMLDivElement)
          .width(globeEl.current!.clientWidth)
          .height(globeEl.current!.clientHeight)
          .backgroundColor('#02070e')
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
          .pointsData(data.events)
          .pointLat((d: any) => d.lat)
          .pointLng((d: any) => d.lng)
          .pointColor((d: any) => d.color)
          .pointAltitude(0.02)
          .pointRadius(0.25)
          .pointLabel((d: any) => `${d.category} - ${d.title}`)
          .onPointClick((point: any) => {
            setSelected(point);
            setInsight('');
          });

        globeInstance.controls().autoRotate = true;
        globeInstance.controls().autoRotateSpeed = 0.3;

        const handleResize = () => {
          if (globeEl.current) {
            globeInstance.width(globeEl.current.clientWidth);
            globeInstance.height(globeEl.current.clientHeight);
          }
        };

        window.addEventListener('resize', handleResize);

        // cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          globeInstance?._destructor?.();
        };
      } catch (err) {
        // ignore fetch errors for now
        console.error('Failed to load events', err);
      }
    })();
  }, []);

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
      <div className="event-card">
        {selected ? (
          <>
            <h3>{selected.category} 热点</h3>
            <h4>{selected.title}</h4>
            <p>{selected.summary}</p>
            <p className="event-location">
              📍 {selected.city}, {selected.country}
            </p>
            <button
              className="btn btn-small"
              onClick={analyzeEvent}
              disabled={insightLoading}
            >
              {insightLoading ? '⏳ AI 分析中...' : '🤖 AI 深度分析'}
            </button>
            {insight && <p className="event-insight">{insight}</p>}
          </>
        ) : (
          <p>正在加载事件...</p>
        )}
      </div>
    </div>
  );
}
