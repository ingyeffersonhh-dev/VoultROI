import type { FeeConfig, CalculationStep } from '@/types'

export const DEFAULT_FEES: FeeConfig = {
  bdvFee: 0.5,
  cardFee: 2.5,
  bpayFee: 3.6,
  convertFee: 0.0,
}

const FEE_PIPELINE: Array<{ name: string; label: string; key: keyof FeeConfig }> = [
  { name: 'bdv', label: 'BDV USD Purchase', key: 'bdvFee' },
  { name: 'card', label: 'Card Fee', key: 'cardFee' },
  { name: 'bpay', label: 'BPay Transfer', key: 'bpayFee' },
  { name: 'convert', label: 'Convert to USDT', key: 'convertFee' },
]

/**
 * Apply all fees sequentially on an input USD amount.
 * Returns an array of CalculationStep objects showing each step's details.
 */
export function runFeePipeline(
  inputUsd: number,
  fees: FeeConfig,
): CalculationStep[] {
  if (inputUsd <= 0) {
    return FEE_PIPELINE.map((item) => ({
      name: item.name,
      label: item.label,
      inputAmount: 0,
      feePercent: fees[item.key],
      outputAmount: 0,
    }))
  }

  let current = inputUsd
  const steps: CalculationStep[] = []

  for (const item of FEE_PIPELINE) {
    const feePercent = fees[item.key]
    const multiplier = 1 - feePercent / 100
    const output = current * multiplier

    steps.push({
      name: item.name,
      label: item.label,
      inputAmount: current,
      feePercent,
      outputAmount: output,
    })

    current = output
  }

  return steps
}

/**
 * Calculate profit/loss after converting through the fee pipeline and selling USDT at P2P rate.
 */
export function calculateProfit(
  montoBs: number,
  _tasaBcv: number,
  tasaUsdtVes: number,
  finalUsdt: number,
  _fees: FeeConfig,
): {
  originalVes: number
  returnedVes: number
  profitVes: number
  profitPercent: number
  isProfitable: boolean
} {
  if (montoBs <= 0) {
    return { originalVes: 0, returnedVes: 0, profitVes: 0, profitPercent: 0, isProfitable: false }
  }

  const originalVes = montoBs
  const returnedVes = finalUsdt * tasaUsdtVes
  const profitVes = returnedVes - originalVes
  const profitPercent = (returnedVes / originalVes - 1) * 100

  return {
    originalVes,
    returnedVes,
    profitVes,
    profitPercent,
    isProfitable: profitVes > 0,
  }
}

/**
 * Compute the minimum USDT/VES rate needed to break even (profit = 0).
 * At breakeven: finalUsdt * rate = originalVes → rate = originalVes / finalUsdt
 */
export function computeBreakeven(
  tasaBcv: number,
  fees: FeeConfig,
  inputUsd: number,
): number {
  if (inputUsd <= 0) return 0

  const steps = runFeePipeline(inputUsd, fees)
  const finalUsdt = steps[steps.length - 1]?.outputAmount ?? 0

  if (finalUsdt === 0) return Infinity

  const originalVes = inputUsd * tasaBcv
  return originalVes / finalUsdt
}
