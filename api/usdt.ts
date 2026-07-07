import type { VercelRequest, VercelResponse } from '@vercel/node'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// --- Rate Limiting: max 10 requests per 10s per IP ---
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 10_000

const rateLimitMap = new Map<string, number[]>()

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0]!.trim()
  if (Array.isArray(forwarded)) return forwarded[0]!.trim()
  return req.socket.remoteAddress ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  rateLimitMap.set(ip, recent)
  if (recent.length >= RATE_LIMIT_MAX) return true
  recent.push(now)
  return false
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (recent.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, recent)
    }
  }
}, RATE_LIMIT_WINDOW_MS)

// --- Response Caching: 5 min TTL (matches Cotizave refresh interval) ---
const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  data: unknown
  timestamp: number
}

const responseCache = new Map<string, CacheEntry>()

function getCachedResponse(url: string): unknown | null {
  const entry = responseCache.get(url)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(url)
    return null
  }
  return entry.data
}

function setCachedResponse(url: string, data: unknown): void {
  responseCache.set(url, { data, timestamp: Date.now() })
}

interface CotizaveRate {
  market: string
  type: string
  mid?: number
  ask?: number
  bid?: number
  updated_at: string
}

interface CotizaveRatesResponse {
  country: string
  base: string
  rates: CotizaveRate[]
  fetched_at: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(204).send('')
  }

  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' })
  }

  const apiKey = process.env.COTIZAVE_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing COTIZAVE_KEY environment variable' })
  }

  const upstreamUrl = 'https://api.cotizave.com/v1/fx/rates'

  const cached = getCachedResponse(upstreamUrl)
  if (cached !== null) {
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(key, value)
    }
    return res.status(200).json(cached)
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return res.status(502).json({ error: `Upstream API returned ${response.status}` })
    }

    const data = (await response.json()) as CotizaveRatesResponse

    // Extract Binance P2P mid rate (most popular exchange)
    const binanceP2p = data.rates.find((r) => r.market === 'binance')
    const rate = binanceP2p?.mid ?? 0

    if (rate === 0) {
      return res.status(502).json({ error: 'No Binance P2P rate found in Cotizave response' })
    }

    const resultData = { rate, source: 'binance-p2p', updated_at: binanceP2p?.updated_at }

    setCachedResponse(upstreamUrl, resultData)

    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(key, value)
    }
    return res.status(200).json(resultData)
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Upstream API timed out' })
    }
    return res.status(502).json({ error: 'Failed to fetch USDT rate from Cotizave' })
  }
}
