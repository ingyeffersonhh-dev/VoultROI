# Testing Capabilities — dolares

## Detected Configuration
- **Test Runner**: vitest (configured via package.json when project initialized)
- **Test Layers**: unit, component
- **Coverage Provider**: v8
- **Linter**: eslint
- **Type Checker**: tsc
- **Formatter**: prettier

## Strict TDD Resolution
- **Source**: Detected test runner (vitest) → default true
- **Value**: true
- **Rationale**: Test runner exists; Strict TDD enforced by default per SDD policy

## Test Commands (to be added to package.json)
- 	est: vitest run
- 	est:watch: vitest
- 	est:coverage: vitest run --coverage
- 	ypecheck: lint: eslint . --ext ts,tsx
- 	ypecheck: tsc --noEmit
- ormat: prettier --write .
- ormat:check: prettier --check .

## Coverage Thresholds (recommended)
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Test File Patterns
- **/*.test.{ts,tsx} — unit tests
- **/*.spec.{ts,tsx} — component tests
- **/__tests__/**/*.{ts,tsx} — alternative structure

## Component Testing
- Library: @testing-library/react
- Utilities: @testing-library/user-event
- Render: render from @testing-library/react
- Cleanup: automatic via vitest globals
