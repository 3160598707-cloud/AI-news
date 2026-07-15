# PROJECT_MEMORY

> AI World Monitor 项目状态与架构决策记录。每次重大变更后更新。

## 当前架构

```
Next.js 16 (Pages Router) + TypeScript
├── Globe 可视化: globe.gl v2 + Three.js
├── 事件存储: 内存（lib/eventsStore.ts）
├── 新闻源: RSS（BBC/Reuters）+ 本地 fallback XML
└── 部署目标: GitHub Pages（待定）
```

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Next.js 16 | 成熟、PWA 支持、API Routes |
| 3D 地图 | globe.gl v2 | 免费开源、React 兼容 |
| RSS 解析 | rss-parser v3 | 成熟库、44M+ 周下载 |
| AI 分析 | DeepSeek API (deepseek-chat) | 免费额度、中文优秀、API 兼容 OpenAI |
| 语言 | TypeScript strict | 类型安全 |

## 已知限制

- 事件存储在内存中，重启后丢失
- 远程 RSS 源在中国大陆网络下不可达，依赖本地 fallback
- globe.gl 在移动端性能待优化
- 暂无认证/鉴权

## 下一步优先级

1. 日报前端页面（展示 AI 日报）
2. 地图增强（真实地理坐标映射 + 点击详情联动）
3. PWA 离线支持
4. GitHub Actions 自动部署
5. 通知推送
