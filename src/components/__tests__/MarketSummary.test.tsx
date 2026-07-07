import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarketSummary } from '../MarketSummary'

describe('MarketSummary', () => {
  it('shows placeholder when data is missing', () => {
    render(
      <MarketSummary bcvRate={null} usdtRate={null} originalVes={null} finalUsdt={null} />,
    )
    expect(screen.getByText('Ingresá un monto para ver el resumen')).toBeInTheDocument()
  })

  it('renders the brecha, USDT to recover and net margin', () => {
    // BCV 36.5, P2P 38.2 → brecha = (38.2-36.5)/36.5 = 4.66%
    // originalVes 3650, usdtRate 38.2 → usdtParaRecuperar = 3650/38.2 = 95.5497
    // finalUsdt 94.291 → margen = 94.291 - 95.5497 = -1.2587
    render(
      <MarketSummary bcvRate={36.5} usdtRate={38.2} originalVes={3650} finalUsdt={94.291} />,
    )

    expect(screen.getByText('Brecha BCV vs P2P')).toBeInTheDocument()
    expect(screen.getByText('+4.66%')).toBeInTheDocument()
    expect(screen.getByText(/95\.54/)).toBeInTheDocument()
    expect(screen.getByText(/-1\.25/)).toBeInTheDocument()
  })

  it('colors the margin red when in deficit', () => {
    render(
      <MarketSummary bcvRate={36.5} usdtRate={38.2} originalVes={3650} finalUsdt={94.291} />,
    )
    const marginRow = screen.getByText('Margen neto USDT').parentElement
    const marginValue = marginRow?.querySelector('span:last-child')
    expect(marginValue?.className).toContain('text-[#e21d2c]')
  })
})
