# CHANGELOG

## 0.7.0 — 2026-07-15

### Added
- AI 语音朗读（Web Speech API，`/daily` 页「🔊 AI 语音朗读」按钮）
- 浏览器通知（AI 分析完成后自动推送）
- 通知权限自动请求

### Changed
- `/daily` 页增加 TTS 朗读控制（播放/停止）

## 0.6.0 — 2026-07-15

### Added
- PWA 支持：`manifest.json` + Service Worker + 安装元标签
- `next.config.js`（SW 缓存头配置）
- 应用图标（emoji favicon）

## 0.5.0 — 2026-07-15

### Added
- 种子事件扩展至 6 条（政治、商业、跨境电商）+ 精确地理坐标
- 地球事件卡片「AI 深度分析」按钮（单击事件→单事件 AI 分析）
- `/api/analyze` 支持 POST body 传入指定事件

### Changed
- `GlobeScene` 事件卡片增强：位置图标、分析按钮、AI 洞察展示

## 0.4.0 — 2026-07-15

### Added
- `/daily` 日报页面（Markdown 渲染 + 加载/错误状态）
- 首页 AI 态势分析卡片 +「刷新分析」按钮
- 页面导航（首页 ↔ 日报）
- 响应式卡片布局（`summary-grid`）

### Changed
- `pages/index.tsx` 重构：动态加载分析、模块卡片
- `styles/globals.css` 新增日报样式、按钮、响应式

## 0.3.0 — 2026-07-15

### Added
- DeepSeek AI 集成（`lib/deepseek.ts`）
  - `chat()` — 通用单轮对话
  - `analyzeEvents()` — 全局态势分析
  - `generateDailyReport()` — Markdown 日报生成
- `/api/analyze` — AI 态势分析 API（返回中文分析）
- `/api/daily-report` — AI 日报生成 API（返回 Markdown）
- 测试脚本：`scripts/test_analyze.js`、`scripts/test_daily_report.js`
- `.env.local` 支持（DEEPSEEK_API_KEY）

### Changed
- `.gitignore` 添加 `.env.local`

## 0.2.0 — 2026-07-15

### Added
- RSS 新闻采集 API（`/api/rss-ingest`）
  - 支持多 RSS 源并发抓取（BBC、Reuters）
  - `Promise.race` 硬超时保护（5s/源）
  - 本地示例 RSS 自动 fallback（`feeds/sample-rss.xml`）
- 共享事件存储（`lib/eventsStore.ts`）
- 脚本：`scripts/test_rss_api.js`、`scripts/run_rss_ingest.js`

### Changed
- 重构 `pages/api/events.ts` 使用共享存储
- `GlobeScene.tsx` 从 API 拉取事件（加载态提示）
- `package.json` 添加 `rss-parser` 依赖和 `dev:local` 脚本

### Fixed
- `Globe` 构造器类型错误（宽/高/背景色改用方法链）
- RSS API 远程源挂起导致超时

## 0.1.0 — 2026-07-14

### Added
- Next.js 16 项目骨架
- 3D Globe 可视化（`globe.gl` + Three.js）
- 示例事件 API（`/api/events`）
- 日报文本读取 API（`/api/ingest-daily`）
- TypeScript 配置
