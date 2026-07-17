// 生成静态 API JSON 数据文件
// 每次 GitHub Action 运行时调用此脚本
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PUBLIC_API = path.join(__dirname, '..', 'public', 'api');

// 确保目录存在
if (!fs.existsSync(PUBLIC_API)) {
  fs.mkdirSync(PUBLIC_API, { recursive: true });
}

// 读取事件数据
let events = [];
try {
  const eventsPath = path.join(DATA_DIR, 'events.json');
  if (fs.existsSync(eventsPath)) {
    events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
  }
} catch (e) {
  console.error('Failed to read events.json:', e.message);
}

// 1. events.json
fs.writeFileSync(path.join(PUBLIC_API, 'events.json'), JSON.stringify({ events }));

// 2. stats.json
const countryCount = {};
const categoryCount = {};
for (const e of events) {
  countryCount[e.country] = (countryCount[e.country] || 0) + 1;
  categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
}
const countryRanking = Object.entries(countryCount)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);
const categoryDistribution = Object.entries(categoryCount)
  .map(([name, count]) => ({ name, count }));
fs.writeFileSync(path.join(PUBLIC_API, 'stats.json'), JSON.stringify({
  total: events.length,
  countryRanking,
  categoryDistribution,
}));

// 3. risk-index.json
const riskLevels = { '军事': 85, '政治': 70, '安全': 80, '网络': 65, '经济': 55, '科技': 30, '环境': 40, '社会': 45, '健康': 35 };
let totalRisk = 0, riskCount = 0;
const riskBreakdown = {};
for (const e of events) {
  const r = riskLevels[e.category] || 30;
  totalRisk += r;
  riskCount++;
  riskBreakdown[e.category] = (riskBreakdown[e.category] || 0) + r;
}
const overall = riskCount > 0 ? Math.round(totalRisk / riskCount) : 30;
const topRisks = Object.entries(riskBreakdown)
  .map(([cat, score]) => ({ category: cat, score: Math.round(score / (categoryCount[cat] || 1)) }))
  .sort((a, b) => b.score - a.score);
fs.writeFileSync(path.join(PUBLIC_API, 'risk-index.json'), JSON.stringify({
  overall,
  level: overall > 70 ? 'high' : overall > 40 ? 'medium' : 'low',
  breakdown: topRisks,
  updatedAt: new Date().toISOString(),
}));

// 4. prediction.json
const predictions = [
  'AI 技术竞争将在未来30天内进一步加剧，重点关注算力基础设施和人才争夺。',
  '亚太地区科技监管政策趋于严格，可能影响跨国AI企业市场策略。',
  '网络安全事件频率上升，关键基础设施防护需求持续增长。',
  '环境科技投资将成为下一个热点，清洁能源AI应用前景广阔。',
];
fs.writeFileSync(path.join(PUBLIC_API, 'prediction.json'), JSON.stringify({
  prediction: predictions[Math.floor(Math.random() * predictions.length)],
  generatedAt: new Date().toISOString(),
}));

// 5. analyze.json
const analysisTemplates = [
  '当前全球AI态势呈现多点博弈格局。亚太地区活跃度最高，欧洲侧重监管框架建设，北美聚焦技术创新突破。建议重点关注跨境数据流动政策和AI军事化应用趋势。',
  '全球AI情报网络监测显示，技术民族主义抬头趋势明显。各国加速布局自主AI生态链，供应链安全成为核心议题。预计未来两周将有重大政策发布。',
  '多区域AI事件密集发生，反映出技术扩散加速。地缘政治因素对AI发展的影响持续深化，建议关注半导体出口管制新动向。',
];
fs.writeFileSync(path.join(PUBLIC_API, 'analyze.json'), JSON.stringify({
  analysis: analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)],
  eventCount: events.length,
}));

// 6. daily-report.json
fs.writeFileSync(path.join(PUBLIC_API, 'daily-report.json'), JSON.stringify({
  date: new Date().toISOString().split('T')[0],
  summary: `今日全球AI领域共监测到 ${events.length} 起重要事件。`,
  highlights: events.slice(0, 5).map(e => ({ title: e.title, country: e.country, category: e.category })),
  totalEvents: events.length,
}));

// 7. crypto.json (简化版 - 真实数据需要API)
fs.writeFileSync(path.join(PUBLIC_API, 'crypto.json'), JSON.stringify({
  btc: { price: '—', change: '—' },
  eth: { price: '—', change: '—' },
  note: '静态部署模式下加密货币数据不可用',
}));

// 8. rss-ingest.json
fs.writeFileSync(path.join(PUBLIC_API, 'rss-ingest.json'), JSON.stringify({
  status: 'ok',
  message: `已加载 ${events.length} 条事件数据`,
  lastUpdated: new Date().toISOString(),
}));

console.log(`✅ 已生成 ${events.length} 条事件的静态 API 数据`);
console.log(`📁 输出目录: ${PUBLIC_API}`);
