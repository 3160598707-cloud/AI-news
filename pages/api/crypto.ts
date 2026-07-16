import type { NextApiRequest, NextApiResponse } from 'next'

const COINGECKO = 'https://api.coingecko.com/api/v3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const resp = await fetch(
      `${COINGECKO}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,cny&include_24hr_change=true`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!resp.ok) throw new Error(`CoinGecko ${resp.status}`)
    const data = await resp.json()
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(data)
  } catch (err: any) {
    res.status(200).json({
      bitcoin: { usd: 0, usd_24h_change: 0 },
      ethereum: { usd: 0, usd_24h_change: 0 },
      solana: { usd: 0, usd_24h_change: 0 },
      _error: err?.message
    })
  }
}
