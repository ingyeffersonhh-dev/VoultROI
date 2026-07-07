import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calculator } from '../Calculator'

// Mock all hooks to isolate the component
vi.mock('@/hooks/useRates', () => ({
  useRates: () => ({
    bcvRate: { value: 36.5, source: 'bcv', timestamp: new Date().toISOString() },
    usdtRate: { value: 38.2, source: 'binance-p2p', timestamp: new Date().toISOString() },
    bdvRate: { value: 36.8, source: 'bdv-scrape', timestamp: new Date().toISOString() },
    loading: false,
    refetch: vi.fn(),
    override: vi.fn(),
  }),
}))

vi.mock('@/hooks/useCalculator', () => ({
  useCalculator: () => ({
    steps: [
      { name: 'bdv', label: 'BDV USD Purchase', inputAmount: 100, feePercent: 0.5, outputAmount: 99.5 },
      { name: 'card', label: 'Card Fee', inputAmount: 99.5, feePercent: 1.26, outputAmount: 98.2463 },
      { name: 'bpay', label: 'BPay Transfer', inputAmount: 98.2463, feePercent: 3.3, outputAmount: 95.004 },
      { name: 'convert', label: 'Convert to USDT', inputAmount: 95.004, feePercent: 0.75, outputAmount: 94.291 },
    ],
    finalUsdt: 94.291,
    originalVes: 3650,
    returnedVes: 3601.92,
    profitVes: -48.08,
    profitPercent: -1.32,
    breakevenRate: 38.712,
    isProfitable: false,
  }),
}))

vi.mock('@/hooks/useBreakeven', () => ({
  useBreakeven: () => 38.712,
}))

describe('Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title', () => {
    render(<Calculator />)
    expect(screen.getByText('VaultROI')).toBeInTheDocument()
  })

  it('renders the rate display section', () => {
    render(<Calculator />)
    expect(screen.getByText('Tasas en Vivo')).toBeInTheDocument()
    expect(screen.getByText('Referencia BCV')).toBeInTheDocument()
    expect(screen.getByText('USDT P2P')).toBeInTheDocument()
  })

  it('renders the fee editor', () => {
    render(<Calculator />)
    expect(screen.getByText('Configuración de Comisiones')).toBeInTheDocument()
  })

  it('renders preset buttons', () => {
    render(<Calculator />)
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('$500')).toBeInTheDocument()
    expect(screen.getByText('$1000')).toBeInTheDocument()
  })

  it('allows typing an amount in the input field', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    const input = screen.getByPlaceholderText('0.00')
    await user.clear(input)
    await user.type(input, '5000')

    expect(input).toHaveValue('5000')
  })
})
