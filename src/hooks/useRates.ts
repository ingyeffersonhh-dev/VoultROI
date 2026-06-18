import { useState, useEffect, useCallback } from 'react'
import type { RateResult } from '@/types'

interface RateCache {
  result: RateResult
  fetchedAt: number
}

const CACHE_TTL_MS = 60_000

const cache = new Map<string, RateCache>()

function getCached(key: string): RateResult | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.result
}

function setCache(key: string, result: RateResult) {
  cache.set(key, { result, fetchedAt: Date.now() })
}

function makeResult(
  value: number | null,
  source: RateResult['source'],
  error?: string,
): RateResult {
  return {
    value,
    source,
    timestamp: new Date().toISOString(),
    ...(error ? { error } : {}),
  }
}

export function useRates() {
  const [bcvRate, setBcvRate] = useState<RateResult>(() => getCached('bcv') ?? makeResult(null, 'bcv'))
  const [usdtRate, setUsdtRate] = useState<RateResult>(() => getCached('usdt') ?? makeResult(null, 'binance-p2p'))
  const [bdvRate, setBdvRate] = useState<RateResult>(() => getCached('bdv') ?? makeResult(null, 'bdv-scrape'))
  const [loading, setLoading] = useState(true)
  const manualOverrides = useState(new Set<string>)[0]

  const fetchRates = useCallback(async () => {
    setLoading(true)

    const fetchOne = async (
      url: string,
      source: RateResult['source'],
      cacheKey: string,
      extractor: (data: unknown) => number,
    ): Promise<RateResult> => {
      // Skip fetch if manually overridden
      if (manualOverrides.has(cacheKey)) {
        return getCached(cacheKey) ?? makeResult(null, source)
      }

      const cached = getCached(cacheKey)
      if (cached) return cached

      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5_000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const value = extractor(data)
        const result = makeResult(value, source)
        setCache(cacheKey, result)
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return makeResult(null, source, msg)
      }
    }

    const [bcv, usdt, bdv] = await Promise.all([
      Promise.resolve(
        getCached('bcv') ?? makeResult(null, 'bcv', 'Se requiere ingresar la tasa manualmente')
      ),
      fetchOne(
        '/api/usdt',
        'binance-p2p',
        'usdt',
        (d) => (d as { rate: number }).rate,
      ),
      fetchOne(
        '/api/bdv-rate',
        'bdv-scrape',
        'bdv',
        (d) => (d as { rate: number }).rate,
      ),
    ])

    setBcvRate(bcv)
    setUsdtRate(usdt)
    setBdvRate(bdv)
    setLoading(false)
  }, [manualOverrides])

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, CACHE_TTL_MS)
    return () => clearInterval(interval)
  }, [fetchRates])

  const override = useCallback((source: RateResult['source'], value: number) => {
    const result = makeResult(value, 'manual')
    const cacheKey = source === 'binance-p2p' ? 'usdt' : source
    manualOverrides.add(cacheKey)
    setCache(cacheKey, result)
    if (source === 'bcv') {
      setBcvRate(result)
    } else if (source === 'binance-p2p') {
      setUsdtRate(result)
    } else if (source === 'bdv-scrape') {
      setBdvRate(result)
    }
  }, [manualOverrides])

  return { bcvRate, usdtRate, bdvRate, loading, refetch: fetchRates, override }
}
