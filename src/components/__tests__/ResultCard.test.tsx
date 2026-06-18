import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultCard } from '../ResultCard'

describe('ResultCard', () => {
  it('shows placeholder when no amount entered', () => {
    render(
      <ResultCard
        finalUsdt={0}
        profitVes={0}
        profitPercent={0}
        returnedVes={0}
        originalVes={0}
        isProfitable={false}
      />,
    )

    expect(screen.getByText('Ingresa un monto para calcular')).toBeInTheDocument()
  })

  it('displays green styling when profitable', () => {
    const { container } = render(
      <ResultCard
        finalUsdt={94.291}
        profitVes={310.22}
        profitPercent={8.5}
        returnedVes={3960.22}
        originalVes={3650}
        isProfitable={true}
      />,
    )

    expect(screen.getByText('Rentable')).toBeInTheDocument()
    expect(container.querySelector('.card-border-focus')).toBeInTheDocument()
  })

  it('displays red styling when not profitable', () => {
    const { container } = render(
      <ResultCard
        finalUsdt={94.291}
        profitVes={-48.08}
        profitPercent={-1.32}
        returnedVes={3601.92}
        originalVes={3650}
        isProfitable={false}
      />,
    )

    expect(screen.getByText('No rentable')).toBeInTheDocument()
    expect(container.querySelector('.card-border')).toBeInTheDocument()
  })

  it('displays VES amounts with locale formatting', () => {
    render(
      <ResultCard
        finalUsdt={94.291}
        profitVes={310.22}
        profitPercent={8.5}
        returnedVes={3960.22}
        originalVes={3650}
        isProfitable={true}
      />,
    )

    expect(screen.getByText(/3\.650,00 VES/)).toBeInTheDocument()
    expect(screen.getByText(/3\.960,22 VES/)).toBeInTheDocument()
  })

  it('displays final USDT with 4 decimal places', () => {
    render(
      <ResultCard
        finalUsdt={94.291}
        profitVes={0}
        profitPercent={0}
        returnedVes={0}
        originalVes={1000}
        isProfitable={false}
      />,
    )

    expect(screen.getByText('94.2910')).toBeInTheDocument()
  })
})
