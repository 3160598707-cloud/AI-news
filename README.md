# AI World Intelligence Monitor

> 私人全球 AI 情报助手 — 基于 Next.js + TypeScript + DeepSeek

## 快速启动

```bash
npm install
npm run dev:local          # 启动 http://127.0.0.1:3001
```

## 项目结构

```
├── components/
│   ├── GlobeScene.tsx          # 3D 地球可视化
│   └── Layout.tsx              # 导航栏 + 页脚
├── pages/
│   ├── index.tsx               # 首页（地球 + AI 分析）
│   ├── events.tsx              # 事件列表（分类筛选）
│   ├── daily.tsx               # AI 日报（语音朗读）
│   └── api/
│       ├── events.ts           # GET/POST 事件
│       ├── rss-ingest.ts       # RSS 新闻采集
│       ├── analyze.ts          # AI 态势分析
│       ├── daily-report.ts     # AI 日报生成
│       └── ingest-daily.ts     # 读取 daily_news.txt
├── lib/
│   ├── eventsStore.ts          # 事件存储（JSON 持久化）
│   └── deepseek.ts             # DeepSeek API 客户端
├── feeds/sample-rss.xml        # 本地示例 RSS
├── scripts/                    # 测试 + 采集脚本
├── .github/workflows/          # 每日自动采集
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
- ✅ 第 7 阶段：PWA（可安装、离线缓存）
- ✅ 第 8 阶段：通知（AI 分析完成推送）
- ✅ 第 9 阶段：语音日报（Web Speech TTS）
- ✅ CI/CD：GitHub Actions + Vercel 自动部署

## 部署

### Vercel（推荐，免费）

1. 访问 [vercel.com](https://vercel.com) → 用 GitHub 登录
2. 点击 **New Project** → 导入 `3160598707-cloud/AI-news`
3. 设置环境变量：`DEEPSEEK_API_KEY` = `你的Key`
4. 点击 **Deploy** → 自动构建并上线
5. 每次 `git push` 自动重新部署

### GitHub Actions 自动化

| 工作流 | 触发条件 | 说明 |
|--------|----------|------|
| `ci.yml` | Push / PR | 构建 + 类型检查 |
| `daily-ingest.yml` | 每日 UTC 00:00 | RSS 采集 + 数据更新 |

### 所需 Secrets

在 GitHub → Settings → Secrets and variables → Actions 添加：

- `DEEPSEEK_API_KEY`：DeepSeek API 密钥

## 全部 9 阶段已完成 🎉
