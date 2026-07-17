// AI World Monitor — Push Subscription Worker
// 职责: 存储/读取 Web Push 订阅
// 实际推送由 GitHub Action (send_push.js) 发送
// 免费: Cloudflare Worker + KV

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // POST /subscribe — 手机访问时存储推送订阅
    if (url.pathname === '/subscribe' && request.method === 'POST') {
      try {
        const sub = await request.json();
        if (!sub || !sub.endpoint) {
          return Response.json({ error: 'Invalid subscription' }, { status: 400, headers: cors });
        }

        let subs = [];
        const raw = await env.PUSH_STORE.get('subscriptions');
        if (raw) subs = JSON.parse(raw);

        subs = subs.filter(s => s.endpoint !== sub.endpoint);
        subs.push({ ...sub, createdAt: new Date().toISOString() });

        await env.PUSH_STORE.put('subscriptions', JSON.stringify(subs));
        return Response.json({ success: true, total: subs.length }, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500, headers: cors });
      }
    }

    // GET /subscriptions — GitHub Action 读取订阅
    if (url.pathname === '/subscriptions' && request.method === 'GET') {
      const raw = await env.PUSH_STORE.get('subscriptions');
      const subs = raw ? JSON.parse(raw) : [];
      return Response.json({ subscriptions: subs, total: subs.length }, { headers: cors });
    }

    // POST /subscriptions — GitHub Action 清理失效订阅
    if (url.pathname === '/subscriptions' && request.method === 'POST') {
      try {
        const { subscriptions } = await request.json();
        if (!Array.isArray(subscriptions)) {
          return Response.json({ error: 'Invalid body' }, { status: 400, headers: cors });
        }
        await env.PUSH_STORE.put('subscriptions', JSON.stringify(subscriptions));
        return Response.json({ success: true, total: subscriptions.length }, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500, headers: cors });
      }
    }

    return Response.json({
      status: 'AI Monitor Push Worker',
      endpoints: ['POST /subscribe', 'GET /subscriptions', 'POST /subscriptions']
    }, { headers: cors });
  }
};
