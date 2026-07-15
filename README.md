# AI World Intelligence Monitor

> 私人全球 AI 情报助手 — 基于 Next.js + TypeScript + DeepSeek

## 快速启动

```bash
npm install
npm run dev:local          # 启动 http://127.0.0.1:3001
```

## 项目结构

```
├── components/GlobeScene.tsx   # 3D 地球可视化
├── pages/
│   ├── index.tsx               # 首页
│   └── api/
│       ├── events.ts           # GET/POST 事件
│       ├── rss-ingest.ts       # RSS 新闻采集
│       └── ingest-daily.ts     # 读取 daily_news.txt
├── lib/eventsStore.ts          # 共享事件存储
├── feeds/sample-rss.xml        # 本地示例 RSS
├── scripts/                    # 测试脚本
└── styles/globals.css
```

## API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analyze` | AI 态势分析（DeepSeek） |
| GET | `/api/daily-report` | AI 日报生成（Markdown） |
| GET | `/api/events` | 获取所有事件 |
| POST | `/api/events` | 添加事件（JSON body） |
| GET | `/api/rss-ingest` | 抓取 RSS 并转为事件 |
| GET | `/api/ingest-daily` | 读取 `daily_news.txt` |

## 当前阶段

- ✅ 第 1 阶段：项目环境
- ✅ 第 2 阶段：网站框架（Next.js + Globe）
- ✅ 第 3 阶段：新闻采集（RSS + 本地 fallback）
- ✅ 第 4 阶段：DeepSeek 分析（态势分析 + 日报）
- ✅ 第 5 阶段：日报前端（`/daily` 页面）
- ✅ 第 6 阶段：地图增强（6 事件 + AI 深度分析按钮）
- ⬜ 第 7 阶段：PWA
- ⬜ 第 7 阶段：PWA
- ⬜ 第 8 阶段：通知
- ⬜ 第 9 阶段：语音日报
