import { describe, it, expect } from 'vitest'
import {
  runFeePipeline,
  calculateProfit,
  computeBreakeven,
  DEFAULT_FEES,
} from '@/utils/calculate'
import type { FeeConfig } from '@/types'

describe('runFeePipeline', () => {
  it('applies all four fees sequentially on $100 USD', () => {
    const steps = runFeePipeline(100, DEFAULT_FEES)

    expect(steps).toHaveLength(4)

    // BDV fee: 0.5% → 100 * 0.995 = 99.5
    expect(steps[0]!.name).toBe('bdv')
    expect(steps[0]!.feePercent).toBe(0.5)
    expect(steps[0]!.inputAmount).toBe(100)
    expect(steps[0]!.outputAmount).toBeCloseTo(99.5, 2)

    // Card fee: 2.5% → 99.5 * 0.975 = 97.0125
    expect(steps[1]!.name).toBe('card')
    expect(steps[1]!.feePercent).toBe(2.5)
    expect(steps[1]!.inputAmount).toBeCloseTo(99.5, 4)
    expect(steps[1]!.outputAmount).toBeCloseTo(97.0125, 4)

    // BPay fee: 3.6% → 97.0125 * 0.964 = 93.52005
    expect(steps[2]!.name).toBe('bpay')
    expect(steps[2]!.feePercent).toBe(3.6)
    expect(steps[2]!.inputAmount).toBeCloseTo(97.0125, 4)
    expect(steps[2]!.outputAmount).toBeCloseTo(93.52005, 4)

    // Convert fee: 0.0% → 93.52005 * 1.0 = 93.52005
    expect(steps[3]!.name).toBe('convert')
    expect(steps[3]!.feePercent).toBe(0.0)
    expect(steps[3]!.inputAmount).toBeCloseTo(93.52005, 4)
    expect(steps[3]!.outputAmount).toBeCloseTo(93.52005, 4)
  })

  it('returns $0 USDT output for $0 input', () => {
    const steps = runFeePipeline(0, DEFAULT_FEES)
    const finalUsdt = steps[steps.length - 1]!.outputAmount
    expect(finalUsdt).toBe(0)
  })

  it('throws or returns 0 output for negative input', () => {
    const steps = runFeePipeline(-100, DEFAULT_FEES)
    const finalUsdt = steps[steps.length - 1]!.outputAmount
    expect(finalUsdt).toBe(0)
  })

  it('returns 0 output when all fees are 100%', () => {
    const maxFees: FeeConfig = { bdvFee: 100, cardFee: 100, bpayFee: 100, convertFee: 100 }
    const steps = runFeePipeline(100, maxFees)
    const finalUsdt = steps[steps.length - 1]!.outputAmount
    expect(finalUsdt).toBe(0)
  })

  it('applies no fee when all fees are 0%', () => {
    const noFees: FeeConfig = { bdvFee: 0, cardFee: 0, bpayFee: 0, convertFee: 0 }
    const steps = runFeePipeline(100, noFees)
    const finalUsdt = steps[steps.length - 1]!.outputAmount
    expect(finalUsdt).toBe(100)
  })
})

describe('calculateProfit', () => {
  it('calculates loss when P2P rate is not high enough', () => {
    // montoBs = 3650 VES, tasaBcv = 36.5, tasaUsdtVes = 38.2, finalUsdt = 93.52005
    const result = calculateProfit(3650, 36.5, 38.2, 93.52005, DEFAULT_FEES)

    // originalVes = 3650
    expect(result.originalVes).toBeCloseTo(3650, 1)
    // returnedVes = 93.52005 * 38.2 = 3572.47
    expect(result.returnedVes).toBeCloseTo(3572.47, 1)
    // profitVes = 3572.47 - 3650 = -77.53
    expect(result.profitVes).toBeCloseTo(-77.53, 1)
    expect(result.isProfitable).toBe(false)
  })

  it('calculates profit when P2P rate is high enough', () => {
    const result = calculateProfit(3650, 36.5, 42, 93.52005, DEFAULT_FEES)

    // returnedVes = 93.52005 * 42 = 3927.84
    expect(result.returnedVes).toBeCloseTo(3927.84, 1)
    // profitVes = 3927.84 - 3650 = 277.84
    expect(result.profitVes).toBeCloseTo(277.84, 1)
    expect(result.isProfitable).toBe(true)
    expect(result.profitPercent).toBeGreaterThan(0)
  })

  it('returns zero profit at breakeven', () => {
    const breakeven = computeBreakeven(36.5, DEFAULT_FEES, 100)
    const originalVes = 100 * 36.5
    const steps = runFeePipeline(100, DEFAULT_FEES)
    const finalUsdt = steps[steps.length - 1]!.outputAmount
    const result = calculateProfit(originalVes, 36.5, breakeven, finalUsdt, DEFAULT_FEES)

    expect(result.profitVes).toBeCloseTo(0, 0)
    expect(result.isProfitable).toBe(false)
  })

  it('returns zero profit for zero input', () => {
    const result = calculateProfit(0, 36.5, 38.2, 0, DEFAULT_FEES)
    expect(result.profitVes).toBe(0)
    expect(result.profitPercent).toBe(0)
  })
})

describe('computeBreakeven', () => {
  it('returns the USDT/VES rate where profit is zero', () => {
    const rate = computeBreakeven(36.5, DEFAULT_FEES, 100)

    // At this rate, 93.52005 * rate === 100 * 36.5
    // rate = 3650 / 93.52005 ≈ 39.029
    expect(rate).toBeCloseTo(39.029, 1)
  })

  it('returns Infinity when all fees are 100%', () => {
    const maxFees: FeeConfig = { bdvFee: 100, cardFee: 100, bpayFee: 100, convertFee: 100 }
    const rate = computeBreakeven(36.5, maxFees, 100)
    expect(rate).toBe(Infinity)
  })

  it('returns BCV rate when all fees are 0%', () => {
    const noFees: FeeConfig = { bdvFee: 0, cardFee: 0, bpayFee: 0, convertFee: 0 }
    const rate = computeBreakeven(36.5, noFees, 100)
    expect(rate).toBeCloseTo(36.5, 2)
  })

  it('handles custom fee override', () => {
    const customFees: FeeConfig = { bdvFee: 1, cardFee: 2, bpayFee: 3, convertFee: 1 }
    const rate = computeBreakeven(36.5, customFees, 500)
    expect(rate).toBeGreaterThan(0)
    expect(Number.isFinite(rate)).toBe(true)
  })
})

describe('DEFAULT_FEES', () => {
  it('has correct default values', () => {
    expect(DEFAULT_FEES.bdvFee).toBe(0.5)
    expect(DEFAULT_FEES.cardFee).toBe(2.5)
    expect(DEFAULT_FEES.bpayFee).toBe(3.6)
    expect(DEFAULT_FEES.convertFee).toBe(0.0)
  })
})
