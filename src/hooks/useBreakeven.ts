import { useMemo } from 'react'
import type { FeeConfig, RateResult } from '@/types'
import { computeBreakeven } from '@/utils/calculate'

interface UseBreakevenInput {
  amountUsd: number
  fees: FeeConfig
  bcvRate: RateResult
}

export function useBreakeven({ amountUsd, fees, bcvRate }: UseBreakevenInput) {
  return useMemo(() => {
    if (amountUsd <= 0 || !bcvRate.value) return null

    const usdComprado = amountUsd / (1 - fees.bdvFee / 100)
    return computeBreakeven(bcvRate.value, fees, usdComprado)
  }, [amountUsd, fees, bcvRate.value])
}
