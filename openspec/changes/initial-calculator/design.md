# Design: Initial Currency Round-Trip Calculator

## Technical Approach

Single-page React + Vite + Tailwind SPA. Pure-function calculation engine (zero side effects) feeds into a component tree driven by `useState` for input/fees and custom hooks for rate fetching. Two Vercel serverless functions (`/api/usdt`, `/api/bdv-rate`) proxy external APIs, keeping `DOLARVZLA_KEY` server-side only. No router, no backend database.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| State management | useState vs Zustand vs useReducer | useState keeps deps minimal for a single-page calc; Zustand adds bundle for no benefit | **useState** + custom hooks |
| Calculation location | Client-only vs serverless | Client = instant feedback, no cold starts; serverless = can hide logic but adds latency | **Client pure functions** |
| Fee pipeline design | Sequential chain vs parallel map | Chain mirrors real-world order, each step depends on previous output | **Sequential chain** |
| API proxy pattern | Vercel `/api/` folder vs middleware | `/api/` folder is zero-config with Vercel, middleware adds complexity | **Vercel `/api/` folder** |
| Rate caching | Client localStorage vs in-memory vs none | In-memory Map with TTL is simplest, no persistence needed for a calculator | **In-memory Map (60s TTL)** |
| BDV scrape | Cheerio server-side vs client HTML parse | Server-side avoids CORS, keeps scrape logic testable in isolation | **Cheerio in `/api/bdv-rate`** |

## Data Flow

```
┌─────────────────────────────────────────────────┐
│                    App.tsx                       │
│                                                  │
│  useRates() ──→ rates: { bcv, usdt, bdv }       │
│       │                                          │
│       ▼                                          │
│  useCalculator(rates) ──→ result: CalculationResult │
│       │                                          │
│       ▼                                          │
│  useBreakeven(rates, fees) ──→ breakevenRate     │
│                                                  │
│  Calculator (container)                          │
│   ├── RateDisplay ← rates                       │
│   ├── FeeEditor ← fees, setFees                 │
│   ├── PresetButtons ← amount, setAmount         │
│   ├── BreakdownTable ← result.steps             │
│   ├── ResultCard ← result.profitVes, .isProfitable │
│   └── BreakevenAnalysis ← breakevenRate         │
└─────────────────────────────────────────────────┘

API calls:
  Client ──GET──→ /api/usdt ──→ Binance P2P API (DOLARVZLA_KEY)
  Client ──GET──→ /api/bdv-rate ──→ api.dolarvzla.com (cheerio)
  Client ──GET──→ rates.dolarvzla.com (BCV rate, direct)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `api/usdt.ts` | Create | Vercel serverless: proxy USDT/VES rate from Binance P2P via dolarvzla API |
| `api/bdv-rate.ts` | Create | Vercel serverless: scrape BDV rate from BCV HTML with cheerio |
| `src/types/index.ts` | Create | TypeScript interfaces: `RateResult`, `FeeConfig`, `CalculationStep`, `CalculationResult`, `CalculatorInput` |
| `src/utils/calculate.ts` | Create | Pure functions: `runFeePipeline()`, `calculateProfit()`, `computeBreakeven()` |
| `src/hooks/useRates.ts` | Create | Fetch BCV + USDT + BDV rates with in-memory cache and manual override |
| `src/hooks/useCalculator.ts` | Create | Wraps `runFeePipeline()` + `calculateProfit()`, returns `CalculationResult` |
| `src/hooks/useBreakeven.ts` | Create | Wraps `computeBreakeven()`, derives from current fees and BC rate |
| `src/components/Calculator.tsx` | Create | Main container, composes all child components, manages `amountUsd` + `fees` state |
| `src/components/RateDisplay.tsx` | Create | Shows live rates with source, timestamp, error states, retry |
| `src/components/FeeEditor.tsx` | Create | Four editable percentage inputs with blur-triggered recalculation |
| `src/components/BreakdownTable.tsx` | Create | Four-row table: step name, fee %, input, output amounts |
| `src/components/ResultCard.tsx` | Create | Final USDT result, profit/loss VES + %, green/red indicator |
| `src/components/PresetButtons.tsx` | Create | $100 / $500 / $1000 buttons, active highlight, manual deselect |
| `src/components/BreakevenAnalysis.tsx` | Create | Displays minimum USDT/VES rate needed, shows N/A for Infinity |
| `src/App.tsx` | Create | Root component, renders Calculator |
| `src/main.tsx` | Create | ReactDOM.createRoot entry point |
| `src/index.css` | Create | Tailwind directives (`@tailwind base/components/utilities`) |
| `tailwind.config.js` | Create | Tailwind config with dark mode, custom colors |
| `vite.config.ts` | Create | Vite config with React plugin |
| `vercel.json` | Create | Vercel routes: rewrite `/api/*` to serverless functions |
| `package.json` | Create | Dependencies, scripts (`test`, `test:coverage`, `typecheck`) |

## Interfaces / Contracts

```typescript
// types/index.ts
interface RateResult {
  value: number | null;
  source: 'bcv' | 'binance-p2p' | 'bdv-scrape' | 'manual';
  timestamp: string; // ISO-8601
  error?: string;
}

interface FeeConfig {
  bdvFee: number;    // percent, default 0.5
  cardFee: number;   // percent, default 1.26
  bpayFee: number;   // percent, default 3.3
  convertFee: number; // percent, default 0.75
}

interface CalculationStep {
  name: string;
  label: string;
  inputAmount: number;
  feePercent: number;
  outputAmount: number;
}

interface CalculationResult {
  inputUsd: number;
  steps: CalculationStep[];
  finalUsdt: number;
  originalVes: number;
  returnedVes: number;
  profitVes: number;
  profitPercent: number;
  breakevenRate: number;
  isProfitable: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `calculate.ts` — fee pipeline, profit, breakeven, edge cases (0, negative, 100% fee) | Vitest, pure function calls, assert against known spreadsheet values |
| Unit | `useRates.ts` — cache TTL, manual override, error propagation | Mock `fetch`, verify caching behavior |
| Component | `Calculator.tsx` — renders all children, updates on input change | `@testing-library/react`, `userEvent.type` for inputs |
| Component | `PresetButtons.tsx` — click updates amount, active highlight | `@testing-library/react`, `userEvent.click` |
| Component | `ResultCard.tsx` — color changes on profit vs loss | Snapshot or class assertion |

Coverage target: ≥ 90% on `src/utils/calculate.ts`, ≥ 80% overall.

## Migration / Rollout

No migration required — greenfield project. Vercel auto-deploys from git. Set `DOLARVZLA_KEY` in Vercel environment variables before first deploy.

## Open Questions

- [ ] Should BDV scrape be in a separate `/api/bdv-rate` endpoint or combined with `/api/usdt`? (Design assumes separate for modularity)
- [ ] Is the 60s cache TTL on client-side rates sufficient, or should it be configurable?
