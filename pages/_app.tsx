import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import CursorGlow from '../components/CursorGlow';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/globals.css';

export default function App({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    // Service Worker (Safari-compatible)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/AI-news/sw.js').catch(() => {});
    }

    // Push 订阅 — 发送到 Cloudflare Worker
    async function subscribePush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub) return; // 已订阅

        // VAPID 公钥 (与 Worker 环境变量一致)
        const vapidPublic = 'BElNpGQpXoMhVhXHqJkRnYsTtWwZzAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz012345';
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublic),
        });

        // 发送到 Worker
        const workerUrl = 'https://ai-monitor-push.YOUR-SUBDOMAIN.workers.dev';
        await fetch(workerUrl + '/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
        console.log('✅ Push 订阅成功');
      } catch (e) {
        console.log('Push 订阅跳过:', e.message);
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      subscribePush();
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') subscribePush();
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>AI World Monitor</title>
        <meta charSet="utf-8" />
        <meta name="description" content="私人全球 AI 情报助手" />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=5,user-scalable=yes" />
        <meta name="theme-color" content="#050b14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Monitor" />
        <link rel="manifest" href="/AI-news/manifest.json" />
        <link rel="apple-touch-icon" href="/AI-news/icon-192.svg" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>" />
      </Head>
      <Script src="/AI-news/api-proxy.js" strategy="beforeInteractive" />
      <Layout>
        <CursorGlow />
        <ParticleBackground />
        <AnimatePresence mode="wait">
          <Component {...pageProps} key={router.route} />
        </AnimatePresence>
      </Layout>
    </>
  );
}

// Web Push 辅助: URL-safe Base64 → Uint8Array
function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
