# Proposal: Initial Currency Round-Trip Calculator

## Intent

Venezuelan users doing the USD round-trip (BS → BDV → Binance BPay → USDT → P2P → BS) can't quickly determine if a cycle is profitable after all fees. Currently they calculate manually or use spreadsheets, losing time and often miscalculating. This SPA gives instant, transparent profit/loss visibility.

## Scope

### In Scope
- React + Vite + Tailwind SPA (single page, no router)
- Sequential fee calculation engine (BDV purchase 0.5%, card 1.26%, BPay 3.3%, Convert 0.75%)
- Live rate fetching: BCV official rate (direct), Binance P2P USDT/VES (via Vercel proxy)
- BDV rate auto-fetch from BCV scraping (cheerio) as optional feature with manual fallback
- Editable fee fields (user can override defaults)
- Breakdown table showing each step's output
- Breakeven USDT/VES rate calculation
- Visual profit indicator (green/red)
- Preset buttons ($100, $500, $1000 equivalents)
- Dark, minimal UI, mobile responsive
- Vitest unit + component tests (strict TDD)
- Vercel deployment with `/api/usdt` serverless proxy

### Out of Scope
- Fee impact ranking / comparison across brokers
- Rate trend analysis or historical data
- User accounts, persistence, or multi-currency selection
- Backend database or user state

## Capabilities

### New Capabilities
- `rate-fetching`: Live rate retrieval from BCV API, Binance P2P proxy, and optional BCV scraping
- `calculation-engine`: Sequential fee pipeline with editable percentages and breakeven solver
- `ui-calculator`: Dark-themed SPA with inputs, breakdown table, presets, and profit indicator
- `api-proxy`: Vercel serverless function shielding `DOLARVZLA_KEY` from client bundle

### Modified Capabilities
None — new project.

## Approach

1. Scaffold Vite + React + TS + Tailwind
2. Build calculation engine with pure functions (unit-testable, no side effects)
3. Implement API proxy in `/api/usdt.js`
4. Fetch BCV rate directly from `rates.dolarvzla.com`
5. Build UI components: InputForm, BreakdownTable, ProfitIndicator, PresetButtons, BreakevenDisplay
6. Add BCV scraping with cheerio (optional, manual input always available)
7. TDD: write tests first for calc engine, then component tests

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/calculator.ts` | New | Pure fee calculation functions |
| `src/lib/fees.ts` | New | Default fee constants and types |
| `api/usdt.js` | New | Vercel serverless proxy for Binance P2P rate |
| `src/components/` | New | All UI components |
| `src/hooks/` | New | useRates (fetch + cache), useCalculator |
| `vite.config.ts` | New | Vite config with Vercel adapter |
| `vercel.json` | New | Vercel routes config |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| BCV scraping breaks (HTML changes) | Med | Manual input always works; cheerio parse is isolated |
| API key leaks to client | Low | Proxy pattern; key only in `process.env` on server |
| Rate sources go down | Med | Graceful error states; show last-known rates with timestamp |
| Fee percentages change frequently | Low | Editable fields with sane defaults |

## Rollback Plan

Vercel deployment — rollback to previous deploy via Vercel dashboard or `vercel rollback`. No database migrations to revert. Git revert if needed.

## Dependencies

- `cheerio` (for BCV HTML scraping)
- `@vercel/node` runtime (for serverless function)
- External APIs: `rates.dolarvzla.com`, `api.dolarvzla.com`

## Success Criteria

- [ ] Calculator outputs correct profit/loss for known test cases (manual verification against spreadsheet)
- [ ] All fee steps visible in breakdown table
- [ ] Breakeven rate matches manual calculation
- [ ] Rate fetch errors show user-friendly message, don't crash app
- [ ] Mobile layout usable on 375px width
- [ ] Test coverage ≥ 90% on `src/lib/` (calc engine)
- [ ] API key not present in client bundle (verified via build output inspection)
