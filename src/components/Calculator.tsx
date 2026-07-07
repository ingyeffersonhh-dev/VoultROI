import { useState, useCallback } from 'react'
import { DEFAULT_FEES } from '@/utils/calculate'
import type { FeeConfig } from '@/types'
import { useRates } from '@/hooks/useRates'
import { useCalculator } from '@/hooks/useCalculator'
import { useBreakeven } from '@/hooks/useBreakeven'
import { RateDisplay } from './RateDisplay'
import { PresetButtons } from './PresetButtons'
import { BreakevenAnalysis } from './BreakevenAnalysis'
import { MarketSummary } from './MarketSummary'
import { FeeEditor } from './FeeEditor'

export function Calculator() {
  const [amountUsd, setAmountUsd] = useState<number>(500)
  const [fees, setFees] = useState<FeeConfig>(DEFAULT_FEES)

  const { bcvRate, usdtRate, bdvRate, loading, refetch, override } = useRates()

  const result = useCalculator({
    amountUsd,
    fees,
    bcvRate,
    usdtRate,
    bdvRate,
  })

  const breakevenRate = useBreakeven({
    amountUsd,
    fees,
    bcvRate,
  })

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
    const value = parseFloat(raw)
    setAmountUsd(isNaN(value) ? 0 : value)
  }, [])

  return (
    <div className="min-h-screen bg-black text-[#e21d2c] flex flex-col justify-center items-center py-12 px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold text-white tracking-tight title-glow cursor-default select-none">
          VaultROI
        </h1>
      </div>

      {/* Main Calculator Card */}
      <div className="w-full max-w-2xl bg-[#131313] border border-[#262626] rounded-xl p-6 md:p-8 space-y-8 transition-all duration-300 hover:border-[#333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        
        {/* Input Section */}
        <div className="space-y-4">
          <label className="font-label-mono text-label-mono text-on-surface-variant block transition-colors duration-300 uppercase tracking-wider">
            Monto (USD)
          </label>
          <div className="relative group">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-semibold text-on-surface-variant transition-colors duration-300 group-focus-within:text-white">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amountUsd || ''}
              onChange={handleAmountChange}
              className="w-full bg-transparent border-b border-[#262626] border-t-0 border-l-0 border-r-0 focus:border-[#e21d2c] focus:ring-0 text-5xl font-bold text-white pl-6 py-2 pb-4 outline-none transition-all duration-300"
            />
          </div>
          {/* Quick Select */}
          <PresetButtons amount={amountUsd} onChange={setAmountUsd} />
        </div>

        {/* Live Rates */}
        <RateDisplay
          bcvRate={bcvRate}
          usdtRate={usdtRate}
          bdvRate={bdvRate}
          loading={loading}
          onRefresh={refetch}
          onOverride={override}
        />



        {/* Market Summary: brecha + USDT para recuperar + margen neto */}
        <MarketSummary
          bcvRate={bcvRate.value}
          usdtRate={usdtRate.value}
          originalVes={result.originalVes}
          finalUsdt={result.finalUsdt}
        />

        {/* Breakeven Analysis */}
        <BreakevenAnalysis
          breakevenRate={breakevenRate}
          currentUsdtRate={usdtRate.value}
          finalUsdt={result.finalUsdt}
          originalVes={result.originalVes}
          returnedVes={result.returnedVes}
          bcvRate={bcvRate.value}
        />

        {/* Fee Configuration */}
        <FeeEditor fees={fees} onChange={setFees} amountUsd={amountUsd} />

      </div>
    </div>
  )
}
