interface ResultCardProps {
  finalUsdt: number
  profitVes: number
  profitPercent: number
  returnedVes: number
  originalVes: number
  isProfitable: boolean
}

export function ResultCard({
  finalUsdt,
  profitVes,
  profitPercent,
  returnedVes,
  originalVes,
  isProfitable,
}: ResultCardProps) {
  if (originalVes === 0) {
    return (
      <div className="card-border rounded-lg p-6 md:p-8 text-center">
        <p className="text-on-surface-variant/60 font-body">Ingresa un monto para calcular</p>
      </div>
    )
  }

  return (
    <div className={`card-border rounded-lg p-6 md:p-8 ${isProfitable ? 'card-border-focus' : ''}`}>
      <div className="text-center mb-6">
        <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-2">
          USDT Final
        </div>
        <div className="text-display-lg-mobile font-display font-bold text-on-surface">
          {finalUsdt.toFixed(4)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`w-3 h-3 rounded-full animate-pulse ${
            isProfitable ? 'bg-secondary' : 'bg-primary'
          }`}
        />
        <span
          className={`font-label-mono text-label-mono uppercase tracking-wider ${
            isProfitable ? 'text-secondary' : 'text-primary'
          }`}
        >
          {isProfitable ? 'Rentable' : 'No rentable'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-subtle rounded p-4">
          <div className="font-label-mono text-label-mono text-on-surface-variant/60 uppercase tracking-wider mb-1">
            Inversión
          </div>
          <div className="text-on-surface font-semibold font-body">
            {originalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} VES
          </div>
        </div>
        <div className="bg-surface border border-subtle rounded p-4">
          <div className="font-label-mono text-label-mono text-on-surface-variant/60 uppercase tracking-wider mb-1">
            Retorno
          </div>
          <div className="text-on-surface font-semibold font-body">
            {returnedVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} VES
          </div>
        </div>
        <div className="bg-surface border border-subtle rounded p-4">
          <div className="font-label-mono text-label-mono text-on-surface-variant/60 uppercase tracking-wider mb-1">
            Ganancia/Pérdida
          </div>
          <div
            className={`font-semibold font-body ${
              isProfitable ? 'text-secondary' : 'text-primary'
            }`}
          >
            {profitVes >= 0 ? '+' : ''}
            {profitVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} VES
          </div>
        </div>
        <div className="bg-surface border border-subtle rounded p-4">
          <div className="font-label-mono text-label-mono text-on-surface-variant/60 uppercase tracking-wider mb-1">
            Retorno %
          </div>
          <div
            className={`font-semibold font-body ${
              isProfitable ? 'text-secondary' : 'text-primary'
            }`}
          >
            {profitPercent >= 0 ? '+' : ''}
            {profitPercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}
