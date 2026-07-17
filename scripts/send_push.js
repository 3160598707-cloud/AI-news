/**
 * Web Push 发送 — 从 Cloudflare Worker 读取订阅 + web-push 发送
 * GitHub Actions 日报完成后调用
 *
 * Secrets: PUSH_WORKER_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */
const https = require('https');
const webpush = require('web-push');

const WORKER = process.env.PUSH_WORKER_URL || '';
const VPUB = process.env.VAPID_PUBLIC_KEY || '';
const VPRIV = process.env.VAPID_PRIVATE_KEY || '';

if (!WORKER || !VPUB || !VPRIV) {
  console.log('Push config missing, skipping.');
  process.exit(0);
}

webpush.setVapidDetails('mailto:push@ai-monitor.local', VPUB, VPRIV);

function getJSON(url) {
  return new Promise((ok, fail) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { ok(JSON.parse(d)); } catch (e) { fail(e); } });
    }).on('error', fail);
  });
}

function postJSON(url, body) {
  return new Promise((ok, fail) => {
    const b = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => ok(JSON.parse(d)));
    });
    req.on('error', fail);
    req.write(b);
    req.end();
  });
}

async function main() {
  console.log('📡 获取订阅列表...');
  let subs;
  try { subs = (await getJSON(WORKER + '/subscriptions')).subscriptions || []; }
  catch (e) { console.error('获取失败:', e.message); process.exit(1); }

  if (subs.length === 0) { console.log('暂无订阅'); process.exit(0); }

  console.log(`📨 向 ${subs.length} 设备推送...`);
  let evs = 0;
  try { evs = require('../data/events.json').length; } catch {}

  const p = JSON.stringify({
    title: '🌍 AI World Monitor 日报',
    body: `全球 AI 态势: ${evs} 条最新事件`,
    icon: '/AI-news/icon-192.svg',
    badge: '/AI-news/icon-192.svg',
    tag: 'daily',
    data: { url: '/AI-news/daily/' },
  });

  let sent = 0, failed = 0, valid = [];
  for (const s of subs) {
    try { await webpush.sendNotification(s, p); sent++; valid.push(s); }
    catch (e) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        console.log(`  ✕ 失效: ${s.endpoint.slice(0, 60)}`);
      } else { valid.push(s); }
      failed++;
    }
  }
  console.log(`✅ ${sent} 成功, ${failed} 失败`);

  if (valid.length < subs.length) {
    try { await postJSON(WORKER + '/subscriptions', { subscriptions: valid }); }
    catch (e) { console.error('清理失败:', e.message); }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
