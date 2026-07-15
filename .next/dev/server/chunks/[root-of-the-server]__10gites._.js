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
"[project]/AI-news/pages/api/events.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$news$2f$lib$2f$eventsStore$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-news/lib/eventsStore.ts [api] (ecmascript)");
;
function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({
            events: (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$news$2f$lib$2f$eventsStore$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getEvents"])()
        });
    }
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            const id = `event-${Date.now()}`;
            const ev = {
                id,
                city: body.city || '未知',
                country: body.country || '未知',
                lat: Number(body.lat) || 0,
                lng: Number(body.lng) || 0,
                category: body.category || '其他',
                title: body.title || '未命名事件',
                summary: body.summary || '',
                color: body.color || '#ffffff'
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$news$2f$lib$2f$eventsStore$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["addEvent"])(ev);
            return res.status(201).json({
                events: (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$news$2f$lib$2f$eventsStore$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getEvents"])()
            });
        } catch (err) {
            return res.status(400).json({
                error: 'invalid body'
            });
        }
    }
    res.setHeader('Allow', [
        'GET',
        'POST'
    ]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10gites._.js.map