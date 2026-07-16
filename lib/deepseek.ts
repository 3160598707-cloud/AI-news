/**
 * DeepSeek API 客户端
 * 最小封装：单轮对话、流式可选、超时保护
 */
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

function getApiKey(): string {
  // 环境变量优先，否则使用硬编码（MVP 阶段）
  return process.env.DEEPSEEK_API_KEY || ''
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

/** 发送单轮对话，返回 AI 回复文本 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000)

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        stream: false
      }),
      signal: controller.signal
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`DeepSeek API ${res.status}: ${err}`)
    }

    const data: any = await res.json()
    return data.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * 批量分析事件并返回摘要
 * 输入：事件数组
 * 输出：AI 生成的全局态势分析
 */
export async function analyzeEvents(events: Array<{ title: string; category: string; summary: string }>) {
  if (events.length === 0) return '暂无事件可分析。'

  const eventList = events
    .map((e, i) => `${i + 1}. [${e.category}] ${e.title}: ${e.summary}`)
    .join('\n')

  const prompt = `你是一个全球情报分析助手。以下是最近采集的新闻事件：

${eventList}

请用中文生成一份简洁的全球态势分析（200字以内），包括：
1. 当前最值得关注的趋势
2. 潜在风险提示
3. 简短建议`

  return chat([
    { role: 'system', content: '你是专业的全球情报分析师。回答简洁、有洞察力、用中文。' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5, maxTokens: 512 })
}

/**
 * 生成每日 AI 日报
 */
export async function generateDailyReport(events: Array<{ title: string; category: string; summary: string }>) {
  if (events.length === 0) return '今日无事件，无法生成日报。'

  const eventList = events
    .map((e, i) => `${i + 1}. [${e.category}] ${e.title}`)
    .join('\n')

  const prompt = `你是 AI World Monitor 的日报生成器。今日事件：

${eventList}

请生成一份 Markdown 格式的日报，包含：

## 今日概览
（2-3句话总结今日全球态势，客观权威）

## 分类热点
按军事、财经、科技、民生、国际分类总结，每条30-50字

## 大白话解读 👂
用最简单直白的话翻译今天最重要的3件事，像跟朋友聊天一样。每条要有：
- 发生了啥
- 对普通人意味着什么

## 明日关注
3条需要持续关注的要点

## AI 洞察
简短的前瞻性分析`

  return chat([
    { role: 'system', content: '你是 AI World Monitor 日报生成器。用中文输出结构化 Markdown。' },
    { role: 'user', content: prompt }
  ], { temperature: 0.6, maxTokens: 1024 })
}

/**
 * 生成风险指数（0-100）
 */
export async function generateRiskIndex(events: Array<{ title: string; category: string }>) {
  if (events.length === 0) return { score: 0, level: '低', summary: '暂无数据' }

  const eventList = events.map((e, i) => `${i + 1}. [${e.category}] ${e.title}`).join('\n')
  const prompt = `基于以下全球事件，评估当前全球风险指数（0-100）。返回JSON格式：{"score":数字,"level":"低/中/高/极高","summary":"一句话总结"}

事件：
${eventList}`

  const text = await chat([
    { role: 'system', content: '你是风险评估专家。只返回JSON，不要其他文字。' },
    { role: 'user', content: prompt }
  ], { temperature: 0.3, maxTokens: 200 })

  try { return JSON.parse(text) }
  catch { return { score: 50, level: '中', summary: text.slice(0, 100) } }
}

/**
 * AI 预测（明确标注为预测）
 */
export async function generatePrediction(events: Array<{ title: string; category: string; summary: string }>) {
  if (events.length === 0) return '暂无足够数据生成预测。'

  const eventList = events.map((e, i) => `${i + 1}. [${e.category}] ${e.title}: ${e.summary}`).join('\n')
  const prompt = `基于以下事件趋势，生成3条未来24-72小时可能发生的事件预测。每条标注置信度（高/中/低）。

事件：
${eventList}

格式：
1. [类别] 预测内容 — 置信度：高/中/低
（首行标注：⚠️ 以下为AI预测，仅供参考，不构成任何建议）`

  return chat([
    { role: 'system', content: '你是趋势预测分析师。回答前必须标注预测性质。' },
    { role: 'user', content: prompt }
  ], { temperature: 0.7, maxTokens: 512 })
}
