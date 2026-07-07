export interface RateResult {
  value: number | null
  source: 'bcv' | 'binance-p2p' | 'bdv-scrape' | 'manual'
  timestamp: string // ISO-8601
  error?: string
}

export interface FeeConfig {
  bdvFee: number // percent, default 0.5
  cardFee: number // percent, default 1.5
  bpayFee: number // percent, default 3.6
  convertFee: number // percent, default 0.0
}

export interface CalculationStep {
  name: string
  label: string
  inputAmount: number
  feePercent: number
  outputAmount: number
}

export interface CalculationResult {
  inputUsd: number
  steps: CalculationStep[]
  finalUsdt: number
  originalVes: number
  returnedVes: number
  profitVes: number
  profitPercent: number
  breakevenRate: number
  isProfitable: boolean
}

export interface CalculatorInput {
  montoBs: number
  tasaBcv: number
  tasaUsdtVes: number
  fees: FeeConfig
}
