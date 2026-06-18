import type { CalculationStep } from '@/types'

interface BreakdownTableProps {
  steps: CalculationStep[]
}

export function BreakdownTable({ steps }: BreakdownTableProps) {
  if (steps.length === 0) {
    return (
      <div className="card-border rounded-lg p-6 md:p-8">
        <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-4">
          Desglose de comisiones
        </h2>
        <p className="text-on-surface-variant/60 text-center py-4 font-body">
          Ingresa un monto para ver el desglose
        </p>
      </div>
    )
  }

  return (
    <div className="card-border rounded-lg p-6 md:p-8">
      <h2 className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-4">
        Desglose de comisiones
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-on-surface-variant/60 border-b border-subtle">
              <th className="text-left py-2 font-label-mono text-label-mono uppercase">Paso</th>
              <th className="text-right py-2 font-label-mono text-label-mono uppercase">Comisión</th>
              <th className="text-right py-2 font-label-mono text-label-mono uppercase">Entrada</th>
              <th className="text-right py-2 font-label-mono text-label-mono uppercase">Salida</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.name} className="border-b border-subtle last:border-b-0 hover:bg-surface transition-colors">
                <td className="py-3 text-on-surface font-body">{step.label}</td>
                <td className="py-3 text-right text-on-surface-variant font-label-mono">{step.feePercent}%</td>
                <td className="py-3 text-right text-on-surface/80 font-label-mono">
                  ${step.inputAmount.toFixed(2)}
                </td>
                <td className="py-3 text-right text-on-surface font-semibold font-label-mono">
                  ${step.outputAmount.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
