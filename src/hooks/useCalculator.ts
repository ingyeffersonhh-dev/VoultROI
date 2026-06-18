import { useMemo } from 'react'
import type { FeeConfig, CalculationResult, RateResult } from '@/types'
import { runFeePipeline, calculateProfit } from '@/utils/calculate'

interface UseCalculatorInput {
  amountUsd: number
  fees: FeeConfig
  bcvRate: RateResult
  usdtRate: RateResult
  bdvRate: RateResult
}

export function useCalculator({ amountUsd, fees, bcvRate, usdtRate, bdvRate }: UseCalculatorInput) {
  return useMemo<CalculationResult>(() => {
    if (amountUsd <= 0 || !bcvRate.value || !usdtRate.value) {
      return {
        inputUsd: 0,
        steps: [],
        finalUsdt: 0,
        originalVes: 0,
        returnedVes: 0,
        profitVes: 0,
        profitPercent: 0,
        breakevenRate: 0,
        isProfitable: false,
      }
    }

    const tasaBcv = bcvRate.value
    const tasaUsdtVes = usdtRate.value

    // Run fee pipeline on the purchased USD
    const usdComprado = amountUsd / (1 - fees.bdvFee / 100)
    const steps = runFeePipeline(usdComprado, fees)

    const pipelineSteps = steps.filter((s) => s.name !== 'bdv')
    const finalUsdt = pipelineSteps.length > 0
      ? pipelineSteps[pipelineSteps.length - 1]!.outputAmount
      : amountUsd

    // Original VES investment = usdComprado * tasaBcv
    const originalVes = usdComprado * tasaBcv
    
    // Calculate profit using shared helper
    const profit = calculateProfit(originalVes, tasaBcv, tasaUsdtVes, finalUsdt, fees)

    // Compute breakeven rate: rate = originalVes / finalUsdt
    const breakevenRate = finalUsdt > 0 ? originalVes / finalUsdt : Infinity

    return {
      inputUsd: amountUsd,
      steps: pipelineSteps,
      finalUsdt,
      ...profit,
      breakevenRate,
    }
  }, [amountUsd, fees, bcvRate.value, usdtRate.value, bdvRate.value])
}
