import { useState, useEffect } from 'react'
import Head from 'next/head'

/** 极简 Markdown → HTML：支持 ## ### ** - 列表 */
function md2html(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huo])(.+)$/gm, '<p>$1</p>')
}

export default function DailyPage() {
  const [report, setReport] = useState('')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/AI-news/api/daily-report.json')
        const data = await res.json()
        if (data.report) {
          setRawText(data.report)
          setReport(md2html(data.report))
        } else if (data.error) {
          setError(data.error)
        }
      } catch (e: any) {
        setError(e?.message || '加载失败')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const speak = () => {
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    if (speaking) { synth.cancel(); setSpeaking(false); return }

    // 去掉 Markdown 标记，保留纯文本
    const text = rawText
      .replace(/[#*\-]/g, '')
      .replace(/\n+/g, '。')
      .slice(0, 2000)

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = 0.9
    utter.onend = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(utter)
  }

  return (
    <>
      <Head><title>AI 日报 — AI World Monitor</title></Head>
      <header className="hero">
        <h1>AI 日报</h1>
        <p>DeepSeek 实时分析</p>
        {report && (
          <button className="btn" onClick={speak}>
            {speaking ? 'STOP' : 'TTS'}
          </button>
        )}
      </header>

      <div className="report-container">
        {loading && <p className="loading">⏳ 正在生成 AI 日报...</p>}
        {error && <p className="error">❌ {error}</p>}
        {report && (
          <article
            className="report-content"
            dangerouslySetInnerHTML={{ __html: report }}
          />
        )}
      </div>
    </>
  )
}
