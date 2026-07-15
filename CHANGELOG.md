# CHANGELOG

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
