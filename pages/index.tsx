import dynamic from 'next/dynamic';

const GlobeScene = dynamic(() => import('../components/GlobeScene'), { ssr: false });

export default function Home() {
  return (
    <main>
      <header className="hero">
        <h1>AI World Intelligence Monitor</h1>
        <p>私人全球情报助手：3D 地球可视化与热点事件演示。</p>
      </header>
      <section className="panel">
        <GlobeScene />
      </section>
      <section className="summary">
        <div>
          <h2>当前模块</h2>
          <ul>
            <li>全球 3D 地球视图</li>
            <li>事件热区标记</li>
            <li>点击可视化热点</li>
            <li>后续集成 RSS、DeepSeek 与通知</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
