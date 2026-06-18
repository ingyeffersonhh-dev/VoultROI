# Rate Fetching Specification

## Purpose

Retrieve real-time exchange rates from three sources: BCV official rate, Binance P2P USDT/VES rate (via proxy), and BDV rate (scrape or manual). These rates feed the calculation engine.

## Requirements

### Requirement: Fetch BCV Official Rate

The system MUST fetch the current BCV official USD/VES rate from `rates.dolarvzla.com`.

#### Scenario: Successful BCV rate fetch

- GIVEN the BCV API is reachable
- WHEN the system requests the BCV rate
- THEN it returns a `RateResult` with `value > 0`, `source: "bcv"`, and a ISO-8601 timestamp
- AND the rate is cached for 60 seconds

#### Scenario: BCV API unreachable

- GIVEN the BCV API returns an error or times out (5s timeout)
- WHEN the system requests the BCV rate
- THEN it returns a `RateResult` with `error` populated
- AND the UI displays "BCV rate unavailable — enter manually"
- AND the app does NOT crash

### Requirement: Fetch USDT/VES via Proxy

The system MUST fetch the Binance P2P USDT/VES rate through the `/api/usdt` serverless proxy.

#### Scenario: Successful USDT/VES fetch

- GIVEN the API proxy is reachable
- WHEN the system requests the USDT/VES rate
- THEN it returns a `RateResult` with `value > 0`, `source: "binance-p2p"`, and a timestamp

#### Scenario: Proxy returns error

- GIVEN the proxy returns a non-200 status
- WHEN the system requests the USDT/VES rate
- THEN it returns a `RateResult` with `error` populated
- AND the UI shows "USDT/VES rate unavailable — enter manually"

#### Scenario: Network timeout

- GIVEN the proxy call exceeds 5 seconds
- WHEN the request times out
- THEN the system returns an error result
- AND does NOT retry automatically (manual retry via UI button)

### Requirement: BDV Rate (Manual + Auto Scrape)

The system MUST support both manual BDV rate input and optional auto-fetch via BCV HTML scraping.

#### Scenario: Manual BDV rate entry

- GIVEN the user selects manual mode or auto-fetch is unavailable
- WHEN the user enters a BDV rate value
- THEN the system uses that value directly as the BDV rate

#### Scenario: Auto-fetch BDV rate via cheerio scrape

- GIVEN the auto-fetch feature is enabled
- WHEN the system scrapes `api.dolarvzla.com` with cheerio
- THEN it parses the BDV rate from the HTML response
- AND returns a `RateResult` with `source: "bdv-scrape"`

#### Scenario: Scrape fails gracefully

- GIVEN the scraped HTML structure changes or endpoint is down
- WHEN the scrape parse fails
- THEN the system falls back to manual input mode
- AND shows a warning: "Auto-fetch failed — enter BDV rate manually"

### Requirement: Rate Caching

The system MUST cache fetched rates to avoid redundant calls.

#### Scenario: Cached rate within TTL

- GIVEN a rate was fetched less than 60 seconds ago
- WHEN the system needs the rate again
- THEN it returns the cached value without a network call

#### Scenario: Cache expired

- GIVEN a rate was fetched more than 60 seconds ago
- WHEN the system needs the rate again
- THEN it triggers a fresh fetch

### Requirement: Manual Rate Override

The system MUST allow the user to override any fetched rate with a manual value.

#### Scenario: User overrides fetched rate

- GIVEN a fetched rate is displayed
- WHEN the user types a new value in the rate input field
- THEN the system uses the manual value for calculations
- AND the fetched rate remains available as a reference

## Data Structures

```typescript
interface RateResult {
  value: number | null;
  source: "bcv" | "binance-p2p" | "bdv-scrape" | "manual";
  timestamp: string; // ISO-8601
  error?: string;
}

interface RateCache {
  [key: string]: {
    result: RateResult;
    fetchedAt: number; // Date.now()
  };
}

type RateSource = "bcv" | "binance-p2p" | "bdv" | "manual";
```

## Edge Cases

- BCV API returns negative or zero rate → treat as error
- Proxy returns non-JSON response → parse error, show message
- Multiple rapid requests → debounce or cache-first to prevent flooding
- Rate value exceeds sanity bounds (> 100,000 VES/USD) → warn user, still allow

## Error Handling

| Error | Behavior |
|-------|----------|
| Network timeout (5s) | Return error result, show manual input prompt |
| Non-200 HTTP status | Return error result with status code |
| Invalid JSON/HTML | Return error result, log to console |
| Rate ≤ 0 | Treat as error, prompt manual entry |
| Rate > sanity bound | Warn but allow (user may know better) |

## Acceptance Criteria

- [ ] BCV rate fetches and caches correctly
- [ ] USDT/VES fetches through proxy, never exposes API key
- [ ] BDV rate works in both manual and auto-fetch modes
- [ ] All error states show friendly UI messages, no crashes
- [ ] Cache TTL prevents redundant requests
- [ ] Manual override always takes precedence
