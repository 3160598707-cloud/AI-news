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
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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
