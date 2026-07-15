# Open Source Registry for AI World Intelligence Monitor

## Purpose

记录适配 `AI-news` 仓库的成熟开源方案，供后续快速融合与方案选择。

## 1. Application Framework

### Next.js
- GitHub: https://github.com/vercel/next.js
- License: MIT
- 最近更新时间: 2026-07 (活跃维护)
- 兼容性: 适合 React/TypeScript/PWA、GitHub Pages、Vercel、静态站点部署
- 风险: 需要补全项目 scaffold，当前仓库无 `package.json`，但官方模板直接复用成本低
- 备注: 最优前端架构选择，和现有 `.github/workflows/nextjs.yml` 匹配

## 2. 3D 地球与地图模块

### Globe.gl
- GitHub: https://github.com/vasturiano/globe.gl
- License: MIT
- 最近更新时间: 活跃，项目历史长期维护
- 兼容性: 浏览器端 Three.js, React 可与 `react-globe.gl` 结合
- 风险: 纯 WebGL 渲染，性能取决于客户端，适合轻量情报可视化
- 备注: 直接复用点/弧线/标签/热力图，优先用于全球情报热点展示

### React Globe.gl
- GitHub: https://github.com/vasturiano/react-globe.gl
- License: MIT
- 最近更新时间: 活跃维护
- 兼容性: 与 Next.js / React 直接集成
- 风险: 依赖浏览器 WebGL，需处理 SSR 时的 `window` 问题
- 备注: 最适合作为前端地图组件封装层

### CesiumJS
- GitHub: https://github.com/CesiumGS/cesium
- License: Apache-2.0
- 最近更新时间: 活跃，最新版本 2026 年持续发布
- 兼容性: 支持高精度 3D 地球与地图分析，但体积大、学习成本高
- 风险: 可能超出个人轻量项目范围；若使用 Cesium Ion 需注意商业/付费内容
- 备注: 备用方案，适合后续需要高精度三维分析时引入

### MapLibre GL JS
- GitHub: https://github.com/maplibre/maplibre-gl-js
- License: BSD-3-Clause
- 最近更新时间: 2026 年活跃维护
- 兼容性: 2D 地图可视化、矢量图层、热力图、标记、平面地图交互
- 风险: 不是全球 3D 地球，但可作为地图基础层或备选
- 备注: 如果 3D 地球暂不必要，MapLibre 可做轻量情报地图展示

## 3. 数据采集与 RSS

### rss-parser
- GitHub: https://github.com/rbren/rss-parser
- License: MIT
- 最近更新时间: 2026 年活跃
- 兼容性: Node/浏览器可用，适合 RSS 采集
- 风险: 只负责 RSS 解析，需补数据清洗与分类逻辑
- 备注: 最简单的新闻源输入方案，可快速接入公开 RSS

### Feedly / RSS 公开订阅
- 类型: 数据源而非库
- 说明: 使用公开 RSS、官方发布源、国际组织新闻源、能源机构输出作为原始采集渠道
- 风险: 需自行维护源列表、可信度与分类策略

## 4. AI 分析与摘要

### DeepSeek API
- 说明: 项目要求固定使用 DeepSeek API 作为核心 AI 分析引擎
- 备注: 不是纯开源库，但系统架构应预留 DeepSeek 对接层

### LangChain JS (备用)
- GitHub: https://github.com/langchain-ai/langchainjs
- License: MIT
- 最近更新时间: 2026 年活跃
- 兼容性: 可作为 AI 管道抽象层，若未来需要扩展更多分析来源
- 风险: 当前项目要求禁多模型；仅作为技术架构参考

## 5. 通知与音频

### web-push
- GitHub: https://github.com/web-push-libs/web-push
- License: MIT
- 最近更新时间: 活跃维护
- 兼容性: Node.js 后端或 GitHub Actions 可用，用于 Web Push 通知
- 风险: 需用户授权、浏览器支持限制
- 备注: Web Push 是目标优先方案之一

### Telegraf
- GitHub: https://github.com/telegraf/telegraf
- License: MIT
- 最近更新时间: 2026 年活跃
- 兼容性: Node.js，可用于 Telegram Bot 通知
- 风险: 依赖 Telegram Bot API，不涉及付费
- 备注: 备用通知通道，适合私人智能助手

### Web Speech API / browser TTS
- 类型: 浏览器内置 API
- 说明: 前端可直接将日报文本转为语音播放，避免额外付费
- 风险: 仅支持浏览器客户端，不适合后端音频文件持久化
- 备注: 与 PWA 手机端结合成本最低

## 6. PWA 与移动访问

### Next.js PWA 插件
- 参考: `next-pwa`
- License: MIT
- 说明: 可为 Next.js 项目快速添加 PWA manifest、service worker、离线缓存
- 风险: 需补配置，适配手机添加到主屏幕
- 备注: 目标阶段 2 的核心实现路径

## 7. 自动化与 CI

### GitHub Actions
- 已有: `.github/workflows/nextjs.yml`, `.github/workflows/main.yml`
- 说明: 现成自动化框架，只需补业务流程作业（采集、分析、日报、通知、部署）
- 风险: 当前 workflow 与仓库内容不匹配，需要重构
- 备注: 最优自动化实现环境

## 8. 结论与推荐方案

### 核心组合建议
- 前端：`Next.js` + `react-globe.gl`
- 地图：`Globe.gl` 作为首选 3D 地球模块
- 数据采集：`rss-parser` + 公开 RSS / 官方源
- AI 分析：DeepSeek API 对接层
- PWA：`next-pwa`
- 通知：`web-push` + `telegraf`
- 自动化：GitHub Actions

### 评估结果
- 价值高、成本低：使用 Next.js + Globe.gl 快速得到全球情报可视化
- 复杂度可控：避免直接引入 Cesium 的高重量方案，先做轻量 3D Globe
- 维护友好：使用 MIT / BSD / Apache 的成熟前端库，避免许可证冲突
- 推荐后续动作：基于该注册表构建项目 scaffold，补全 `package.json`、`tsconfig.json`、`pages/` 或 `src/` 结构
