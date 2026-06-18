# API Proxy Specification

## Purpose

Vercel serverless function at `/api/usdt` that proxies Binance P2P rate requests, shielding the `DOLARVZLA_KEY` from the client bundle.

## Requirements

### Requirement: Proxy Endpoint

The system MUST expose a GET endpoint at `/api/usdt` on Vercel.

#### Scenario: Successful proxy request

- GIVEN the client calls `GET /api/usdt`
- WHEN the serverless function executes
- THEN it fetches the Binance P2P rate using `DOLARVZLA_KEY` from `process.env`
- AND returns a JSON response with the rate data
- AND sets `Access-Control-Allow-Origin` header

#### Scenario: Missing API key

- GIVEN `DOLARVZLA_KEY` is not set in environment
- WHEN the function executes
- THEN it returns HTTP 500 with `{ error: "API key not configured" }`
- AND logs the error to server logs

### Requirement: CORS Configuration

The system MUST allow cross-origin requests from the deployed domain.

#### Scenario: CORS preflight

- GIVEN the client sends an OPTIONS request
- WHEN the function handles it
- THEN it returns 204 with appropriate CORS headers
- AND allows `GET` method

#### Scenario: CORS headers on GET

- GIVEN the client sends a GET request
- WHEN the function responds
- THEN it includes `Access-Control-Allow-Origin: *` (or specific domain)
- AND `Access-Control-Allow-Methods: GET`

### Requirement: Rate Limiting

The system MUST enforce basic rate limiting to prevent abuse.

#### Scenario: Normal usage

- GIVEN a client makes requests at normal intervals (> 1s apart)
- WHEN the function receives requests
- THEN it processes all requests normally

#### Scenario: Rapid fire requests

- GIVEN a client makes > 10 requests in 10 seconds
- WHEN the function receives a request
- THEN it returns HTTP 429 with `{ error: "Rate limit exceeded" }`
- AND includes `Retry-After` header

### Requirement: Response Caching

The system MUST cache upstream responses briefly to reduce load.

#### Scenario: Cached response within TTL

- GIVEN a request was made within the last 30 seconds
- WHEN another request arrives
- THEN the function returns the cached response
- AND does NOT call the upstream API

#### Scenario: Cache expired

- GIVEN the cache is older than 30 seconds
- WHEN a new request arrives
- THEN the function fetches fresh data from upstream

### Requirement: Error Handling

The system MUST handle upstream errors gracefully.

#### Scenario: Upstream returns error

- GIVEN the upstream API returns 500
- WHEN the proxy receives the error
- THEN it returns HTTP 502 with `{ error: "Upstream service unavailable" }`

#### Scenario: Upstream timeout

- GIVEN the upstream API takes > 5 seconds
- WHEN the request times out
- THEN the proxy returns HTTP 504 with `{ error: "Upstream timeout" }`

#### Scenario: Invalid upstream response

- GIVEN the upstream returns non-JSON
- WHEN the proxy parses the response
- THEN it returns HTTP 502 with `{ error: "Invalid upstream response" }`

### Requirement: API Key Security

The system MUST NEVER expose `DOLARVZLA_KEY` to the client.

#### Scenario: Key not in response

- GIVEN the function processes a request
- WHEN the response is sent
- THEN no API key is included in any response header or body

#### Scenario: Key not in bundle

- GIVEN the Vite build completes
- WHEN the client bundle is inspected
- THEN `DOLARVZLA_KEY` is NOT present anywhere in the output

## Data Structures

```typescript
interface ProxyResponse {
  rate?: number;
  currency?: string;
  source?: string;
  timestamp?: string;
  error?: string;
}

interface ProxyConfig {
  upstreamUrl: string;
  cacheTtlMs: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  requestTimeoutMs: number;
}
```

## Edge Cases

- Upstream API changes response format → proxy returns parse error, doesn't crash
- Multiple concurrent requests → each is independent, no shared mutable state
- Cold start on Vercel → first request may be slower, no special handling needed
- Function runtime limit (10s on Hobby) → upstream timeout set to 5s

## Error Handling

| Error | HTTP Status | Response |
|-------|-------------|----------|
| Missing API key | 500 | `{ error: "API key not configured" }` |
| Rate limit exceeded | 429 | `{ error: "Rate limit exceeded" }` + `Retry-After` |
| Upstream error | 502 | `{ error: "Upstream service unavailable" }` |
| Upstream timeout | 504 | `{ error: "Upstream timeout" }` |
| Invalid response | 502 | `{ error: "Invalid upstream response" }` |
| CORS preflight | 204 | Empty body with CORS headers |

## Acceptance Criteria

- [ ] Endpoint responds at `/api/usdt` on Vercel
- [ ] API key is read from `process.env`, never exposed to client
- [ ] CORS headers allow cross-origin GET requests
- [ ] Rate limiting returns 429 after threshold
- [ ] Response caching reduces upstream calls
- [ ] All error states return proper HTTP status codes
- [ ] Client bundle does NOT contain the API key (verified at build time)
