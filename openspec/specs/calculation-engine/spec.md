# Calculation Engine Specification

## Purpose

Pure-function pipeline that takes an input USD amount and rates, applies sequential fees, and produces a breakdown with profit/loss and breakeven analysis. No side effects — fully unit-testable.

## Requirements

### Requirement: Sequential Fee Pipeline

The system MUST apply fees in this exact order:

1. **BDV Purchase**: input USD × (1 − bdvFee)
2. **Card Fee**: step1 × (1 − cardFee)
3. **BPay Transfer**: step2 × (1 − bpayFee)
4. **Convert to USDT**: step3 × (1 − convertFee)

Each step produces a `CalculationStep` record.

#### Scenario: Standard $100 calculation

- GIVEN input = $100, bcRate = 36.5, usdtVesRate = 38.0
- AND bdvFee = 0.5%, cardFee = 1.26%, bpayFee = 3.3%, convertFee = 0.75%
- WHEN the pipeline runs
- THEN step 1 = 100 × 0.995 = $99.50
- AND step 2 = 99.50 × 0.9874 = $98.25
- AND step 3 = 98.25 × 0.967 = $95.01
- AND step 4 = 95.01 × 0.9925 = $94.30 USDT

#### Scenario: Zero input

- GIVEN input = $0
- WHEN the pipeline runs
- THEN all steps return 0
- AND no division-by-zero occurs

#### Scenario: Negative input

- GIVEN input = -$50
- WHEN the pipeline runs
- THEN the system returns an error: "Input must be positive"

### Requirement: Profit/Loss Calculation

The system MUST compute profit/loss by comparing the final USDT value converted back to VES against the original VES amount spent.

#### Scenario: Profitable cycle

- GIVEN final USDT = 94.30, usdtVesRate = 38.0, bcRate = 36.5, inputUsd = 100
- WHEN profit is calculated
- THEN returnedVes = 94.30 × 38.0 = 3,583.40
- AND originalVes = 100 × 36.5 = 3,650.00
- AND profit = 3,583.40 − 3,650.00 = −66.60 VES (loss)
- AND profitPercent = −66.60 / 3,650.00 × 100 = −1.82%

#### Scenario: Breakeven (zero profit)

- GIVEN rates where returnedVes equals originalVes
- WHEN profit is calculated
- THEN profit = 0 and profitPercent = 0

### Requirement: Breakeven USDT/VES Rate

The system MUST solve for the USDT/VES rate where profit equals zero.

#### Scenario: Breakeven rate computation

- GIVEN input = $100, bcRate = 36.5, fees as defaults
- WHEN breakeven is computed
- THEN breakevenRate = originalVes / finalUsdtAfterFees
- AND the UI displays this as the minimum USDT/VES rate needed to profit

#### Scenario: Breakeven with custom fees

- GIVEN user overrides bpayFee to 5%
- WHEN breakeven is recomputed
- THEN breakevenRate increases (higher fees need higher USDT rate to compensate)

### Requirement: Editable Fee Percentages

The system MUST accept fee values as parameters with sane defaults.

#### Scenario: Default fees applied

- GIVEN no user overrides
- WHEN calculation runs
- THEN bdvFee = 0.5, cardFee = 1.26, bpayFee = 3.3, convertFee = 0.75 (all in %)

#### Scenario: User overrides a fee

- GIVEN user sets bpayFee = 4.0%
- WHEN calculation runs
- THEN the pipeline uses 4.0% for the BPay step
- AND all other fees remain at defaults

### Requirement: Preset Amounts

The system MUST provide preset input buttons for $100, $500, and $1000 equivalents.

#### Scenario: Preset button click

- GIVEN the user clicks the $500 preset
- WHEN the input field updates
- THEN inputUsd = 500
- AND the calculation re-runs automatically

## Data Structures

```typescript
interface FeeConfig {
  bdvFee: number;    // percent, e.g. 0.5
  cardFee: number;   // percent, e.g. 1.26
  bpayFee: number;   // percent, e.g. 3.3
  convertFee: number; // percent, e.g. 0.75
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

interface CalculatorInput {
  amountUsd: number;
  bcRate: number;
  usdtVesRate: number;
  fees: FeeConfig;
}
```

## Edge Cases

- Input = 0 → all outputs 0, profit = 0, breakeven = 0
- Negative input → reject with error string
- Fee = 100% → step output = 0, pipeline short-circuits
- Fee > 100% → reject as invalid (fees are 0–100 range)
- BC rate = 0 → profit calc uses 0 for originalVes (show warning)
- Extremely large input (> $1M) → allow but warn

## Error Handling

| Error | Behavior |
|-------|----------|
| Negative input | Return `error: "Input must be positive"` |
| Fee out of range (0–100) | Return `error: "Fee must be between 0 and 100"` |
| BC rate ≤ 0 | Return `warning` with profit still computed |
| Division by zero in breakeven | Return `breakevenRate: Infinity`, UI shows "N/A" |

## Acceptance Criteria

- [ ] Sequential pipeline matches spreadsheet for known test cases
- [ ] Profit/loss sign is correct (positive = profit, negative = loss)
- [ ] Breakeven rate matches manual algebraic solution
- [ ] All fee overrides propagate correctly
- [ ] Edge cases (0, negative, extreme) handled without crashes
- [ ] Pure functions — no network calls, no DOM access
- [ ] ≥ 90% test coverage on `src/lib/`
