import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BreakdownTable } from '../BreakdownTable'
import type { CalculationStep } from '@/types'

const MOCK_STEPS: CalculationStep[] = [
  { name: 'bdv', label: 'BDV USD Purchase', inputAmount: 100, feePercent: 0.5, outputAmount: 99.5 },
  { name: 'card', label: 'Card Fee', inputAmount: 99.5, feePercent: 1.26, outputAmount: 98.2463 },
  { name: 'bpay', label: 'BPay Transfer', inputAmount: 98.2463, feePercent: 3.3, outputAmount: 95.004 },
  { name: 'convert', label: 'Convert to USDT', inputAmount: 95.004, feePercent: 0.75, outputAmount: 94.291 },
]

describe('BreakdownTable', () => {
  it('shows placeholder when no steps', () => {
    render(<BreakdownTable steps={[]} />)

    expect(screen.getByText('Ingresa un monto para ver el desglose')).toBeInTheDocument()
  })

  it('renders a table header row', () => {
    render(<BreakdownTable steps={MOCK_STEPS} />)

    expect(screen.getByText('Paso')).toBeInTheDocument()
    expect(screen.getByText('Comisión')).toBeInTheDocument()
    expect(screen.getByText('Entrada')).toBeInTheDocument()
    expect(screen.getByText('Salida')).toBeInTheDocument()
  })

  it('renders all four step rows with correct labels', () => {
    render(<BreakdownTable steps={MOCK_STEPS} />)

    expect(screen.getByText('BDV USD Purchase')).toBeInTheDocument()
    expect(screen.getByText('Card Fee')).toBeInTheDocument()
    expect(screen.getByText('BPay Transfer')).toBeInTheDocument()
    expect(screen.getByText('Convert to USDT')).toBeInTheDocument()
  })

  it('displays correct fee percentages', () => {
    render(<BreakdownTable steps={MOCK_STEPS} />)

    expect(screen.getByText('0.5%')).toBeInTheDocument()
    expect(screen.getByText('1.26%')).toBeInTheDocument()
    expect(screen.getByText('3.3%')).toBeInTheDocument()
    expect(screen.getByText('0.75%')).toBeInTheDocument()
  })

  it('displays input and output amounts', () => {
    render(<BreakdownTable steps={MOCK_STEPS} />)

    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('$99.5000')).toBeInTheDocument()
    expect(screen.getByText('$94.2910')).toBeInTheDocument()
  })
})
