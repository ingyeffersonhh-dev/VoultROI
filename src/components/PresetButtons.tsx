const PRESETS = [100, 500, 1000]

interface PresetButtonsProps {
  amount: number
  onChange: (amount: number) => void
}

export function PresetButtons({ amount, onChange }: PresetButtonsProps) {
  return (
    <div className="flex gap-2 pt-2 w-full">
      {PRESETS.map((preset) => {
        const isActive = amount === preset
        if (isActive) {
          return (
            <button
              key={preset}
              onClick={() => onChange(0)}
              className="flex-1 py-2 bg-primary text-[#fff9f8] rounded-full font-label-mono text-label-mono font-bold hover:bg-primary transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(226,29,44,0.4)] relative overflow-hidden group"
            >
              <span className="relative z-10">${preset}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </button>
          )
        } else {
          return (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className="flex-1 py-2 border border-subtle rounded-full text-on-surface-variant hover:text-on-background hover:border-[#e21d2c] hover:shadow-[0_0_10px_rgba(226,29,44,0.2)] hover:scale-105 transition-all duration-300 font-label-mono text-label-mono"
            >
              ${preset}
            </button>
          )
        }
      })}
    </div>
  )
}
