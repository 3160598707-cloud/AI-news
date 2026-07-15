module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/AI-news/lib/eventsStore.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addEvent",
    ()=>addEvent,
    "getEvents",
    ()=>getEvents,
    "replaceEvents",
    ()=>replaceEvents
]);
let events = [
    {
        id: 'event-1',
        city: '基辅',
        country: '乌克兰',
        lat: 50.4501,
        lng: 30.5234,
        category: '战争',
        title: '前线冲突升级',
        summary: '该地区出现新的军事交火，局势仍不稳定。',
        color: '#ff4d4f'
    },
    {
        id: 'event-2',
        city: '利雅得',
        country: '沙特阿拉伯',
        lat: 24.7136,
        lng: 46.6753,
        category: '能源',
        title: '原油价格波动',
        summary: '能源供应变化引发市场关注。',
        color: '#f7b500'
    },
    {
        id: 'event-3',
        city: '深圳',
        country: '中国',
        lat: 22.5429,
        lng: 114.0596,
        category: '科技',
        title: 'AI 技术发布',
        summary: '新一代 AI 芯片获得市场认可。',
        color: '#40a9ff'
    }
];
function getEvents() {
    return events;
}
function addEvent(ev) {
    events = [
        ev,
        ...events
    ];
    return events;
}
function replaceEvents(newEvents) {
    events = newEvents;
    return events;
}
}),
"[project]/AI-news/pages/api/rss-ingest.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$rss$2d$parser__$5b$external$5d$__$28$rss$2d$parser$2c$__cjs$2c$__$5b$project$5d2f$AI$2d$news$2f$node_modules$2f$rss$2d$parser$29$__ = __turbopack_context__.i("[externals]/rss-parser [external] (rss-parser, cjs, [project]/AI-news/node_modules/rss-parser)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$news$2f$lib$2f$eventsStore$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-news/lib/eventsStore.ts [api] (ecmascript)");
;
;
const parser = new __TURBOPACK__imported__module__$5b$externals$5d2f$rss$2d$parser__$5b$external$5d$__$28$rss$2d$parser$2c$__cjs$2c$__$5b$project$5d2f$AI$2d$news$2f$node_modules$2f$rss$2d$parser$29$__["default"]({
    requestOptions: {
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AI-news/1.0; +https://example.com)'
        }
    }
});
const feeds = [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.reuters.com/reuters/worldNews'
];
function colorForCategory(cat) {
    if (!cat) return '#999999';
    const c = cat.toLowerCase();
    if (c.includes('polit') || c.includes('gov')) return '#ff4d4f';
    if (c.includes('tech') || c.includes('science')) return '#40a9ff';
    if (c.includes('energy') || c.includes('oil')) return '#f7b500';
    return '#9b59b6';
}
async function handler(req, res) {
    try {
        const added = [];
        const errors = [];
        for (const feedUrl of feeds){
            try {
                const feed = await parser.parseURL(feedUrl);
                for (const item of (feed.items || []).slice(0, 5)){
                    const ev = {
                        id: `rss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        city: item.categories?.[0] || '未知',
                        country: item.creator || '未知',
                        lat: 0,
                        lng: 0,
                        category: item.categories?.[0] || (item.categories ? item.categories.join(',') : '新闻'),
                        title: item.title || '无标题',
                        summary: item.contentSnippet || item.content || item.summary || '',
                        color: colorForCategory(item.categories?.[0] || item.title || '')
                    };
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$news$2f$lib$2f$eventsStore$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["addEvent"])(ev);
                    added.push(ev);
                }
            } catch (feedError) {
                errors.push(`Feed failed: ${feedUrl} -> ${feedError?.message || feedError}`);
            }
        }
        if (added.length === 0 && errors.length > 0) {
            return res.status(500).json({
                error: 'No feeds ingested',
                details: errors
            });
        }
        return res.status(200).json({
            added,
            total: added.length,
            warnings: errors
        });
    } catch (err) {
        return res.status(500).json({
            error: String(err && err.message ? err.message : err)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1hnkb4g._.js.map