import { useState } from 'react'
import type { RateResult } from '@/types'

interface RateDisplayProps {
  bcvRate: RateResult
  usdtRate: RateResult
  bdvRate: RateResult
  loading: boolean
  onRefresh: () => void
  onOverride?: (source: RateResult['source'], value: number) => void
}

function formatRate(rate: RateResult): string {
  if (rate.value === null) return '—'
  return rate.value.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function RateRow({
  label,
  rate,
  unit,
  source,
  onOverride,
  valueClassName = 'text-on-background',
}: {
  label: string
  rate: RateResult
  unit: string
  source: RateResult['source']
  onOverride?: (source: RateResult['source'], value: number) => void
  valueClassName?: string
}) {
  const hasError = !!rate.error && rate.value === null
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(editValue.replace(',', '.'))
    if (!isNaN(parsed) && parsed > 0 && onOverride) {
      onOverride(source, parsed)
    }
    setEditing(false)
    setEditValue('')
  }

  return (
    <div className="flex justify-between items-center py-2 transition-colors duration-300 hover:bg-[#1a1a1a] px-2 -mx-2 rounded-lg group">
      <div className="flex items-center gap-2">
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {label}
        </span>
        {hasError && (
          <span 
            className="w-2.5 h-2.5 rounded-full bg-[#e21d2c] inline-block animate-pulse" 
            title="Error al cargar tasa de forma automática. Hacé click para ingresarla manualmente."
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-1">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditing(false)
                }
              }}
              className="w-20 bg-transparent border border-subtle rounded px-2 py-0.5 text-right font-label-mono text-label-mono text-on-background focus:border-[#e21d2c] focus:ring-0 focus:shadow-[0_0_8px_rgba(226,29,44,0.2)] transition-all duration-300"
              placeholder={rate.value?.toString() ?? '0.00'}
            />
            <button
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
              className="text-xs text-[#ffb3ae] hover:text-[#ffb3ae]/80 font-label-mono"
            >
              OK
            </button>
          </form>
        ) : (
          <>
            <span
              onClick={() => onOverride && setEditing(true)}
              className={`font-headline-md text-headline-md cursor-pointer hover:underline ${
                rate.value === null ? 'text-[#e21d2c] text-sm italic' : valueClassName
              }`}
              title="Hacé click para ingresar tasa manualmente"
            >
              {rate.value === null ? 'Ingresar Tasa' : formatRate(rate)}
            </span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">{unit}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function RateDisplay({
  bcvRate,
  usdtRate,
  loading,
  onRefresh,
  onOverride,
}: RateDisplayProps) {
  return (
    <div className="space-y-4 border-t border-subtle pt-6">
      <div className="flex justify-between items-center">
        <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Tasas en Vivo</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[#ffb3ae] hover:text-[#ffdad7] transition-all duration-300 hover:scale-105 font-label-mono text-label-mono flex items-center gap-1 group disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[16px] transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>
            refresh
          </span>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
      <div className="space-y-3">
        <RateRow
          label="Referencia BCV"
          rate={bcvRate}
          unit="VES/USD"
          source="bcv"
          onOverride={onOverride}
          valueClassName="text-on-background"
        />
        <RateRow
          label="USDT P2P"
          rate={usdtRate}
          unit="VES/USDT"
          source="binance-p2p"
          onOverride={onOverride}
          valueClassName="text-[#ffb3ae]"
        />
      </div>
    </div>
  )
}
