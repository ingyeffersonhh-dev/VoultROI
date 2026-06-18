import { useState } from 'react'
import type { FeeConfig } from '@/types'

interface FeeEditorProps {
  fees: FeeConfig
  onChange: (fees: FeeConfig) => void
  amountUsd: number
}

interface FeeField {
  key: keyof FeeConfig
  label: string
  description: string
}

const FEE_FIELDS: FeeField[] = [
  { key: 'bdvFee', label: 'Comisión BDV', description: 'Comisión de compra USD en BDV' },
  { key: 'cardFee', label: 'Comisión de Tarjeta', description: 'Comisión por transacción con tarjeta' },
  { key: 'bpayFee', label: 'Comisión BPay', description: 'Comisión por transferencia BPay' },
  { key: 'convertFee', label: 'Comisión de Conversión USDT', description: 'Comisión de conversión a USDT' },
]

export function FeeEditor({ fees, onChange, amountUsd }: FeeEditorProps) {
  const [editing, setEditing] = useState<Record<string, string>>({})

  const handleBlur = (key: keyof FeeConfig) => {
    const raw = editing[key]
    if (raw === undefined) return

    const parsed = parseFloat(raw)
    const newValue = isNaN(parsed) ? fees[key] : Math.max(0, Math.min(100, parsed))

    setEditing((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })

    if (newValue !== fees[key]) {
      onChange({ ...fees, [key]: newValue })
    }
  }

  const handleKeyDown = (_key: keyof FeeConfig, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="space-y-4 border-t border-subtle pt-6">
      <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
        Configuración de Comisiones
      </h2>

      <div className="space-y-4">
        {FEE_FIELDS.map((field) => {
          const absoluteValue = (amountUsd * fees[field.key]) / 100
          return (
            <div
              key={field.key}
              className="flex justify-between items-center group transition-colors duration-300 hover:bg-[#1a1a1a] p-2 -mx-2 rounded-lg border-t border-[#1A1A1A] first:border-t-0 first:pt-2"
            >
              <div>
                <div className="font-label-mono text-label-mono text-on-surface">
                  {field.label}
                </div>
                <div className="font-label-mono text-[10px] text-on-surface-variant">
                  {field.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant/80 font-label-mono mr-1">
                  (${absoluteValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={editing[field.key] ?? fees[field.key]}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  onBlur={() => handleBlur(field.key)}
                  onKeyDown={(e) => handleKeyDown(field.key, e)}
                  className="w-16 bg-transparent border border-subtle rounded px-2 py-1 text-right font-label-mono text-label-mono text-on-background focus:border-primary focus:ring-0 focus:shadow-[0_0_8px_rgba(226,29,44,0.2)] transition-all duration-300"
                />
                <span className="font-label-mono text-label-mono text-on-surface-variant group-hover:text-on-background transition-colors duration-300">
                  %
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
