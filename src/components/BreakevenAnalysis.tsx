interface BreakevenAnalysisProps {
  breakevenRate: number | null
  currentUsdtRate: number | null
  finalUsdt: number | null
  originalVes: number | null
  returnedVes: number | null
  bcvRate: number | null
}

export function BreakevenAnalysis({
  breakevenRate,
  currentUsdtRate,
  finalUsdt,
  originalVes,
  returnedVes,
  bcvRate,
}: BreakevenAnalysisProps) {
  if (breakevenRate === null || finalUsdt === null || originalVes === null || returnedVes === null) {
    return (
      <div className="bg-[#0e0e0e] border border-subtle rounded-lg p-6 mt-6">
        <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-4">
          Análisis de Punto de Equilibrio
        </h2>
        <p className="text-on-surface-variant/60 text-center py-4 font-body">
          Ingresá un monto para ver el análisis
        </p>
      </div>
    )
  }

  const isFinite_ = isFinite(breakevenRate)
  const isBelowCurrent =
    currentUsdtRate !== null && isFinite_ && currentUsdtRate < breakevenRate

  return (
    <div className="bg-[#0e0e0e] border border-subtle rounded-lg p-6 mt-6 transition-all duration-300 hover:border-[#444] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
      <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-4">
        Análisis de Punto de Equilibrio
      </h2>

      <div className="flex flex-col items-center justify-center py-4">
        <span className="font-label-mono text-label-mono text-on-surface-variant mb-2">
          Tasa mínima USDT/VES necesaria
        </span>
        <span className="font-display-lg text-display-lg text-[#fabd00] transition-transform duration-300 hover:scale-105 cursor-default">
          {isFinite_ ? breakevenRate.toFixed(2) : 'N/A'}
        </span>

        {isFinite_ && currentUsdtRate !== null && (
          <div className="mt-3 text-label-mono font-label-mono text-xs">
            {isBelowCurrent ? (
              <span className="text-[#e21d2c] font-bold">
                Tasa actual ({currentUsdtRate.toFixed(2)}) está por debajo del equilibrio
              </span>
            ) : (
              <span className="text-[#fabd00] font-bold">
                Tasa actual ({currentUsdtRate.toFixed(2)}) está por encima del equilibrio
              </span>
            )}
          </div>
        )}

        {/* Resumen de Montos Finales */}
        <div className="space-y-2.5 border-t border-subtle pt-4 mt-6 w-full text-sm">
          <div className="flex justify-between items-center">
            <span className="font-label-mono text-on-surface-variant">Inversión Inicial (BCV)</span>
            <div className="text-right">
              <span className="font-semibold text-white">
                {originalVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
              </span>
              {bcvRate && bcvRate > 0 && (
                <span className="text-xs text-on-surface-variant/60 ml-2">
                  (${ (originalVes / bcvRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } USD)
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-label-mono text-on-surface-variant">USDT Finales Obtenidos</span>
            <span className="font-semibold text-[#ffb3ae]">
              {finalUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-label-mono text-on-surface-variant">Retorno en Mercado (P2P)</span>
            <div className="text-right">
              <span className={`font-semibold ${returnedVes > originalVes ? 'text-[#fabd00]' : 'text-[#e21d2c]'}`}>
                {returnedVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
              </span>
              {bcvRate && bcvRate > 0 && (
                <span className="text-xs text-on-surface-variant/60 ml-2">
                  (${ (returnedVes / bcvRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } USD)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button className="w-full mt-4 bg-[#e21d2c] text-[#fff9f8] py-4 rounded-xl font-headline-md text-headline-md hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 group animate-pulse-glow relative overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
          Calcular Arbitraje <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
      </button>
    </div>
  )
}
