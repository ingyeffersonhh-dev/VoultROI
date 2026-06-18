# Tasks: Initial Currency Round-Trip Calculator

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650–750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation + Types + Calculation Engine | PR 1 | Base: main. Scaffolding, types, pure functions, unit tests. Self-contained, deployable skeleton. |
| 2 | API Proxy + Rate Fetching Hooks | PR 2 | Base: PR 1 branch. Serverless functions, useRates, useCalculator, useBreakeven. Tests for caching and error handling. |
| 3 | UI Components + Integration + Polish | PR 3 | Base: PR 2 branch. All React components, App.tsx, styling, responsive layout, error states. Component tests. |

## Phase 1: Foundation & Project Scaffolding

- [x] 1.1 Initialize Vite + React + TypeScript project (`npm create vite@latest . -- --template react-ts`)
- [x] 1.2 Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [x] 1.3 Configure `vite.config.ts` with React plugin, `@tailwindcss/vite`, and vitest globals
- [x] 1.4 Configure `tailwind.config.js` with dark mode, custom slate palette
- [x] 1.5 Create `src/index.css` with Tailwind directives (`@import "tailwindcss"`)
- [x] 1.6 Configure `tsconfig.json` strict mode, path aliases (`@/` → `src/`)
- [x] 1.7 Configure ESLint + Prettier (or confirm defaults from template)
- [x] 1.8 Create `vercel.json` with `/api/*` rewrite to serverless functions
- [x] 1.9 Verify: `npm run dev` serves blank page, `npm test` runs (even with no tests)

**Dependencies**: None (first phase)
**Verification**: `npm run dev` starts, `npm run build` succeeds, `npx vitest run` passes with 0 tests

## Phase 2: Types & Calculation Engine

- [x] 2.1 Create `src/types/index.ts` — interfaces: `RateResult`, `FeeConfig`, `CalculationStep`, `CalculationResult`, `CalculatorInput`
- [x] 2.2 Create `src/utils/calculate.ts` — `runFeePipeline(inputUsd, fees)` returns `CalculationStep[]` + `finalUsdt`
- [x] 2.3 **RED**: Write tests for `runFeePipeline` — standard $100 case (verify $94.30 USDT output per spec)
- [x] 2.4 **GREEN**: Implement `runFeePipeline` to pass the $100 test
- [x] 2.5 **RED**: Write edge case tests — input $0 (all zero), negative input (error), fee 100% (output 0)
- [x] 2.6 **GREEN**: Handle edge cases in `runFeePipeline`
- [x] 2.7 Add `calculateProfit(steps, bcRate, usdtVesRate, inputUsd)` → `{ profitVes, profitPercent, returnedVes, originalVes, isProfitable }`
- [x] 2.8 **RED**: Write tests for `calculateProfit` — profitable case, loss case, breakeven case
- [x] 2.9 **GREEN**: Implement `calculateProfit`
- [x] 2.10 Add `computeBreakeven(bcRate, fees, inputUsd)` → `number` (breakeven USDT/VES rate)
- [x] 2.11 **RED**: Write tests for `computeBreakeven` — standard case, Infinity case (fees = 100%), custom fee override
- [x] 2.12 **GREEN**: Implement `computeBreakeven`
- [x] 2.13 Add `DEFAULT_FEES: FeeConfig` constant (bdvFee=0.5, cardFee=1.26, bpayFee=3.3, convertFee=0.75)
- [x] 2.14 Run `npx vitest run --coverage` — verify ≥ 90% on `src/utils/calculate.ts`

**Dependencies**: Phase 1
**Verification**: `npx vitest run` — all calc tests pass, coverage ≥ 90% on calculate.ts

## Phase 3: API Proxy Functions

- [x] 3.1 **RED**: Write test for `/api/usdt` — mock fetch to upstream, verify rate returned with CORS headers
- [x] 3.2 Create `api/usdt.ts` — Vercel serverless: read `DOLARVZLA_KEY` from `process.env`, fetch upstream, return JSON
- [x] 3.3 **GREEN**: Implement `/api/usdt` to pass the test
- [x] 3.4 Add CORS handling — OPTIONS returns 204, GET includes `Access-Control-Allow-Origin: *`
- [x] 3.5 Add error cases — missing API key → 500, upstream error → 502, upstream timeout → 504
- [x] 3.6 **RED**: Write test for `/api/bdv-rate` — mock cheerio scrape, verify BDV rate returned
- [x] 3.7 Create `api/bdv-rate.ts` — Vercel serverless: scrape `api.dolarvzla.com` with cheerio, parse BDV rate
- [x] 3.8 **GREEN**: Implement `/api/bdv-rate` to pass the test
- [x] 3.9 Add error handling — HTML structure change → fallback error response
- [x] 3.10 Install `cheerio` dependency
- [x] 3.11 Verify API key never in client bundle — `grep -r "DOLARVZLA_KEY" dist/` returns empty
- [x] 3.12 Add rate limiting: max 10 requests per 10s per IP (in-memory Map with cleanup)
- [x] 3.13 Add response caching: 30s TTL per upstream URL (in-memory cache)

**Dependencies**: Phase 1
**Verification**: `npx vitest run` — all API proxy tests pass, build output contains no API key

## Phase 4: Custom Hooks

- [x] 4.1 Create `src/hooks/useRates.ts` — fetches BCV rate from `rates.dolarvzla.com` (direct), USDT/VES from `/api/usdt`, BDV from `/api/bdv-rate`
- [x] 4.2 Add in-memory cache with fixed 60s TTL (Map<string, { result, fetchedAt }>)
- [x] 4.3 **RED**: Write test for `useRates` — mock fetch, verify cache hit within TTL, cache miss after 60s
- [x] 4.4 **GREEN**: Implement caching logic
- [x] 4.5 Add manual rate override — user value takes precedence over fetched value
- [x] 4.6 Create `src/hooks/useCalculator.ts` — wraps `runFeePipeline` + `calculateProfit`, returns `CalculationResult`
- [x] 4.7 **RED**: Write test for `useCalculator` — passes rates/fees to calc engine, returns result
- [x] 4.8 **GREEN**: Implement `useCalculator`
- [x] 4.9 Create `src/hooks/useBreakeven.ts` — wraps `computeBreakeven`, derives from current fees and BC rate
- [x] 4.10 **RED**: Write test for `useBreakeven` — returns correct breakeven rate
- [x] 4.11 **GREEN**: Implement `useBreakeven`
- [x] 4.12 Add 5s timeout to BCV fetch in useRates to prevent hanging requests

**Dependencies**: Phase 2, Phase 3
**Verification**: `npx vitest run` — all hook tests pass

## Phase 5: UI Components

- [x] 5.1 Create `src/components/RateDisplay.tsx` — shows BCV, USDT/VES, BDV rates with source, timestamp, error states
- [x] 5.2 Create `src/components/FeeEditor.tsx` — four editable percentage inputs, blur-triggered recalculation
- [x] 5.3 Create `src/components/BreakdownTable.tsx` — four-row table: step name, fee %, input, output amounts
- [x] 5.4 Create `src/components/ResultCard.tsx` — final USDT result, profit/loss VES + %, green/red indicator
- [x] 5.5 Create `src/components/PresetButtons.tsx` — $100/$500/$1000 buttons, active highlight, manual deselect
- [x] 5.6 Create `src/components/BreakevenAnalysis.tsx` — minimum USDT/VES rate, "N/A" for Infinity
- [x] 5.7 **RED**: Write component test for `PresetButtons` — click updates amount, active highlight
- [x] 5.8 **GREEN**: Verify `PresetButtons` test passes
- [x] 5.9 **RED**: Write component test for `ResultCard` — color changes on profit vs loss
- [x] 5.10 **GREEN**: Verify `ResultCard` test passes
- [x] 5.11 **RED**: Write component test for `BreakdownTable` — renders 4 rows with correct values
- [x] 5.12 **GREEN**: Verify `BreakdownTable` test passes
- [x] 5.13 Wire onOverride prop in RateDisplay with Edit button and inline input fields
- [x] 5.14 Wire onOverride from Calculator → RateDisplay for manual rate entry

**Dependencies**: Phase 2, Phase 4
**Verification**: `npx vitest run` — all component tests pass

## Phase 6: Integration & App Shell

- [x] 6.1 Create `src/components/Calculator.tsx` — main container, composes all children, manages `amountUsd` + `fees` state via hooks
- [x] 6.2 Wire `useRates` → `useCalculator` → `useBreakeven` data flow in Calculator
- [x] 6.3 Create `src/App.tsx` — renders Calculator with dark background
- [x] 6.4 Create `src/main.tsx` — `ReactDOM.createRoot` entry point
- [x] 6.5 Apply dark theme styling — `bg-slate-900`, `text-slate-100`, card backgrounds
- [x] 6.6 **RED**: Write component test for `Calculator` — renders all children, updates on input change
- [x] 6.7 **GREEN**: Verify `Calculator` test passes
- [x] 6.8 Verify full integration — `npm run build` succeeds, `npm run preview` serves app

**Dependencies**: Phase 5
**Verification**: `npm run build && npm run preview` — app loads, calculator works end-to-end

## Phase 7: Polish & Responsive

- [x] 7.1 Add mobile responsive layout — flex-col on small screens, max-w container on desktop
- [x] 7.2 Ensure min 44px touch targets on all interactive elements
- [x] 7.3 Add loading states — spinner/skeleton while rates fetch
- [x] 7.4 Add error state UI — red status per rate source, retry prompts, manual input fallbacks
- [x] 7.5 Add "Enter an amount" prompt when input is empty
- [x] 7.6 Verify mobile at 375px — no horizontal scroll, all elements visible
- [x] 7.7 Final test run — `npx vitest run --coverage` — overall ≥ 80%, calc engine ≥ 90%
- [x] 7.8 Final type check — `npx tsc --noEmit` passes
- [x] 7.9 Final lint — `npx eslint src/` passes
- [x] 7.10 Final build — `npm run build` succeeds, inspect output for no API key leak

**Dependencies**: Phase 6
**Verification**: All tests pass, build clean, responsive on 375px, no `DOLARVZLA_KEY` in bundle
