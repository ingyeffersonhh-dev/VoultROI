interface MarketSummaryProps {
  bcvRate: number | null
  usdtRate: number | null
  originalVes: number | null
  finalUsdt: number | null
}

export function MarketSummary({ bcvRate, usdtRate, originalVes, finalUsdt }: MarketSummaryProps) {
  const hasData =
    bcvRate !== null && bcvRate > 0 &&
    usdtRate !== null && usdtRate > 0 &&
    originalVes !== null && originalVes > 0 &&
    finalUsdt !== null

  if (!hasData) {
    return (
      <div className="bg-[#0e0e0e] border border-subtle rounded-lg p-6 transition-all duration-300 hover:border-[#444]">
        <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-4">
          Resumen de Arbitraje
        </h2>
        <p className="text-on-surface-variant/60 text-center py-4 font-body">
          Ingresá un monto para ver el resumen
        </p>
      </div>
    )
  }

  // #1 — Brecha cambiaria BCV vs P2P
  const brechaPercent = ((usdtRate - bcvRate) / bcvRate) * 100

  // #2 — USDT necesarios para recuperar el capital invertido
  const usdtParaRecuperar = originalVes / usdtRate

  // #3 — Margen neto en USDT (superávit/déficit tras recuperar capital)
  const margenUsdt = finalUsdt - usdtParaRecuperar
  const isSurplus = margenUsdt >= 0

  return (
    <div className="bg-[#0e0e0e] border border-subtle rounded-lg p-6 transition-all duration-300 hover:border-[#444] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
      <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-4">
        Resumen de Arbitraje
      </h2>

      {/* Brecha cambiaria */}
      <div className="flex flex-col items-center justify-center py-2">
        <span className="font-label-mono text-label-mono text-on-surface-variant mb-2">
          Brecha BCV vs P2P
        </span>
        <span
          className={`font-display-lg text-display-lg transition-transform duration-300 hover:scale-105 cursor-default ${
            brechaPercent >= 0 ? 'text-[#fabd00]' : 'text-[#e21d2c]'
          }`}
        >
          {brechaPercent >= 0 ? '+' : ''}
          {brechaPercent.toFixed(2)}%
        </span>
        <span className="font-label-mono text-[10px] text-on-surface-variant/60 mt-1">
          BCV {bcvRate.toFixed(2)} · P2P {usdtRate.toFixed(2)}
        </span>
      </div>

      {/* Resumen de capital */}
      <div className="space-y-2.5 border-t border-subtle pt-4 mt-4 w-full text-sm">
        <div className="flex justify-between items-center">
          <span className="font-label-mono text-on-surface-variant">
            USDT para recuperar capital
          </span>
          <span className="font-semibold text-white">
            {usdtParaRecuperar.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}{' '}
            USDT
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-label-mono text-on-surface-variant">
            Margen neto USDT
          </span>
          <span className={`font-semibold ${isSurplus ? 'text-[#fabd00]' : 'text-[#e21d2c]'}`}>
            {isSurplus ? '+' : ''}
            {margenUsdt.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}{' '}
            USDT
          </span>
        </div>
      </div>
    </div>
  )
}
