import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
  '战争': '#ffffff', '能源': '#cccccc', '科技': '#00c8dc',
  '政治': '#999999', '商业': '#aaaaaa', '自然灾害': '#888888', '网络安全': '#666666'
};

interface Props {
  data: { name: string; count: number }[];
}

export default function ChartsPanel({ data }: Props) {
  if (!data || data.length === 0) return null;
  const chartData = data.map(d => ({ name: d.name, value: d.count, fill: COLORS[d.name] || '#666' }));

  return (
    <div className="sidebar-section">
      <h2>DISTRIBUTION</h2>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%" innerRadius={40} outerRadius={65}
              dataKey="value" stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        {chartData.map(d => (
          <span key={d.name} className="chart-legend-item">
            <span className="chart-dot" style={{ background: d.fill }} /> {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}
