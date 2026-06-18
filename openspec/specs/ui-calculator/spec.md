# UI Calculator Specification

## Purpose

Dark-themed SPA with input fields, fee editors, breakdown table, presets, and profit indicator. Mobile-first responsive design.

## Requirements

### Requirement: Dark Theme UI

The system MUST render a dark-themed interface using Tailwind CSS.

#### Scenario: Default appearance

- GIVEN the app loads
- WHEN the user sees the page
- THEN the background is dark (#0f172a or similar)
- AND text is light (#f8fafc or similar)
- AND the layout is readable in low-light conditions

### Requirement: Input Amount Field

The system MUST provide a numeric input for the USD amount.

#### Scenario: Valid numeric input

- GIVEN the user types "500" in the amount field
- WHEN the value changes
- THEN the calculator re-runs with amountUsd = 500

#### Scenario: Non-numeric input rejected

- GIVEN the user types "abc" in the amount field
- WHEN the input is processed
- THEN the field shows the previous valid value
- AND the calculator does NOT re-run

### Requirement: Editable Fee Fields

The system MUST display four editable fee percentage fields with default values.

#### Scenario: Fee field displays default

- GIVEN the app loads
- WHEN the fee fields render
- THEN bdvFee shows 0.5, cardFee shows 1.26, bpayFee shows 3.3, convertFee shows 0.75

#### Scenario: Fee override triggers recalculation

- GIVEN the user changes bpayFee from 3.3 to 4.0
- WHEN the field blur or change event fires
- THEN the calculation engine re-runs with the new fee
- AND the breakdown table updates

### Requirement: Breakdown Table

The system MUST display a table showing each calculation step.

#### Scenario: Full breakdown visible

- GIVEN a calculation has completed
- WHEN the breakdown renders
- THEN it shows 4 rows (BDV Purchase, Card Fee, BPay Transfer, Convert)
- AND each row shows: step name, fee %, input amount, output amount
- AND the final row highlights the USDT result

### Requirement: Preset Buttons

The system MUST provide three preset buttons: $100, $500, $1000.

#### Scenario: Preset click updates input

- GIVEN the user clicks the "$500" button
- WHEN the click event fires
- THEN the amount input field shows 500
- AND the calculator re-runs automatically
- AND the active preset is visually highlighted

#### Scenario: Manual input deselects presets

- GIVEN a preset is active
- WHEN the user types a custom amount
- THEN the preset highlight is removed
- AND the calculator uses the typed value

### Requirement: Profit/Loss Visual Indicator

The system MUST display a visual indicator showing profit or loss.

#### Scenario: Loss indicator

- GIVEN profit is negative
- WHEN the indicator renders
- THEN it shows red color and "−XX VES (−X.XX%)" format
- AND a down arrow or loss icon is displayed

#### Scenario: Profit indicator

- GIVEN profit is positive
- WHEN the indicator renders
- THEN it shows green color and "+XX VES (+X.XX%)" format
- AND an up arrow or profit icon is displayed

#### Scenario: Breakeven indicator

- GIVEN profit is exactly 0
- WHEN the indicator renders
- THEN it shows neutral color and "Breakeven" text

### Requirement: Breakeven Rate Display

The system MUST show the calculated breakeven USDT/VES rate.

#### Scenario: Breakeven displayed

- GIVEN the calculation has completed
- WHEN the breakeven section renders
- THEN it shows "Breakeven USDT/VES: XX.XX"
- AND a note: "Minimum USDT rate needed to profit"

#### Scenario: Breakeven is Infinity

- GIVEN input is 0 or fees consume 100%
- WHEN breakeven is computed
- THEN the display shows "N/A" instead of Infinity

### Requirement: Mobile Responsive Layout

The system MUST be usable on screens ≥ 375px wide.

#### Scenario: Mobile viewport (375px)

- GIVEN the device width is 375px
- WHEN the app renders
- THEN all elements are visible without horizontal scroll
- AND inputs are tappable (min 44px touch target)
- AND the breakdown table stacks or scrolls vertically

#### Scenario: Desktop viewport (1024px+)

- GIVEN the device width is 1024px or more
- WHEN the app renders
- THEN the layout uses a centered max-width container
- AND the breakdown table displays in full width

### Requirement: Rate Status Display

The system MUST show the current status of each rate source.

#### Scenario: Rates loaded successfully

- GIVEN all rates are fetched
- WHEN the status section renders
- THEN it shows "BCV: 36.50 ✓", "USDT/VES: 38.00 ✓", "BDV: 36.80 ✓"
- AND each with a green checkmark

#### Scenario: Rate fetch failed

- GIVEN a rate fetch failed
- WHEN the status section renders
- THEN it shows the failed rate with a red ✗
- AND a "Retry" button or manual input prompt

## Data Structures

```typescript
interface CalculatorState {
  amountUsd: number;
  fees: FeeConfig;
  rates: {
    bcRate: RateResult;
    usdtVesRate: RateResult;
    bdvRate: RateResult;
  };
  result: CalculationResult | null;
  activePreset: number | null;
}

interface PresetButton {
  amount: number;
  label: string;
}
```

## Edge Cases

- User rapidly clicks presets → debounce recalculation (300ms)
- All rates fail → show full error state with manual input options
- Very long breakdown text → truncate with ellipsis on mobile
- Screen reader accessibility → all inputs have labels, table has headers

## Error Handling

| Error | Behavior |
|-------|----------|
| Invalid fee input | Revert to last valid value |
| Rate fetch error | Show red status, allow manual input |
| Calculation error | Show "Calculation error" in result area |
| Empty input | Treat as 0, show "Enter an amount" prompt |

## Acceptance Criteria

- [ ] Dark theme renders correctly on all viewports
- [ ] All inputs are editable and trigger recalculation
- [ ] Breakdown table shows all 4 steps with correct values
- [ ] Preset buttons update input and highlight correctly
- [ ] Profit/loss indicator changes color based on sign
- [ ] Breakeven rate displays or shows N/A
- [ ] Mobile layout works at 375px width
- [ ] Rate status shows success/failure per source
