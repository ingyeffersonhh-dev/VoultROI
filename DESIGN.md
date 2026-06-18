---
name: Obsidian Flux
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e7bdb9'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#ad8885'
  outline-variant: '#5d3f3d'
  surface-tint: '#ffb3ae'
  primary: '#ffb3ae'
  on-primary: '#68000b'
  primary-container: '#e21d2c'
  on-primary-container: '#fff9f8'
  inverse-primary: '#c0001d'
  secondary: '#ffdf9e'
  on-secondary: '#3f2e00'
  secondary-container: '#fabd00'
  on-secondary-container: '#6a4e00'
  tertiary: '#79d1fd'
  on-tertiary: '#003548'
  tertiary-container: '#007ca4'
  on-tertiary-container: '#f6fbff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ae'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930014'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#fabd00'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#c1e8ff'
  tertiary-fixed-dim: '#79d1fd'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 48px
---

## Brand & Style
The design system embodies a high-end, "total black" aesthetic tailored for professional traders and fintech enthusiasts. The personality is precise, authoritative, and sophisticated, utilizing a **Minimalist** foundation with **High-Contrast** accents. 

By prioritizing deep pitch-black surfaces over traditional grays, the UI eliminates visual noise, focusing the user's attention entirely on ROI data and conversion metrics. The emotional response is one of security and premium performance—like a luxury automotive dashboard or a high-end physical vault.

## Colors
The palette is rooted in an absolute black (`#000000`) background to achieve a "true black" OLED-optimized experience. 

- **Primary:** A vibrant, aggressive Red (`#E21D2C`) derived from the reference imagery, used strictly for primary conversion actions and critical ROI indicators.
- **Secondary:** A precision Gold (`#FFC107`) used for secondary highlights, profit milestones, or "breakeven" data points to provide a luxurious contrast.
- **Neutrals:** Subtle grey borders (`#262626`) define structural boundaries without breaking the minimalist flow. Functional text uses pure white for maximum legibility, while metadata utilizes a muted zinc.

## Typography
The system utilizes **Hanken Grotesk** for its clean, Swiss-inspired geometry, providing a professional fintech feel that is highly legible against dark backgrounds. 

To reinforce the technical nature of a calculator, **JetBrains Mono** is employed for labels and micro-copy, lending a "developer-tool" precision to the data entry points. Large numeric displays (ROI percentages, USDT totals) should use the `display-lg` style with tight letter-spacing to feel impactful and modern.

## Layout & Spacing
This design system utilizes a **Fixed Grid** for desktop to maintain a centered, focused "calculator card" feel, while transitioning to a **Fluid Grid** on mobile devices. 

The layout relies on a generous 8px base scaling system. Spaciousness is a priority; internal paddings within cards are large (32px+) to prevent the dense financial data from feeling overwhelming. Grouping is handled via vertical stacking with consistent `section-gap` intervals to guide the eye from input to result.

## Elevation & Depth
In a total black environment, traditional shadows are replaced by **Low-contrast outlines** and **Tonal layering**.

- **Level 0 (Base):** Pure `#000000` background.
- **Level 1 (Cards/Inputs):** Defined by a 1px solid border of `#262626`. No background fill difference is used, maintaining the "obsidian" look.
- **Level 2 (Active States):** Elements may use a subtle inner glow or a primary-colored border to indicate focus.
- **Level 3 (Modals):** A semi-transparent overlay (`rgba(0,0,0,0.8)`) with a slightly brighter border (`#404040`) to create a sense of hovering over the void.

## Shapes
The shape language is disciplined and "Soft" (`roundedness: 1`). Buttons and input fields use a `0.25rem` (4px) corner radius to feel modern but structured. 

Avoid excessive rounding or "pill" shapes, as they detract from the professional, architectural feel of the fintech aesthetic. Only conversion results may use a slightly larger `0.5rem` radius to subtly distinguish them from input controls.

## Components
- **Buttons:** Primary buttons use a solid `#E21D2C` fill with white text. Secondary buttons are "ghost" style with a `#262626` border and white text.
- **Inputs:** Input fields are transparent with a bottom-only or all-around subtle border. Focus state triggers a white border transition.
- **ROI Chips:** Small badges showing +/- percentages. Positive ROI uses the secondary gold color for the value text.
- **Data Rows:** Use a subtle horizontal divider (`#1A1A1A`) with "JetBrains Mono" for labels on the left and bold "Hanken Grotesk" for values on the right.
- **Keypad (Mobile):** Large, rectangular touch targets with minimal borders, emphasizing a tactile, calculator-first interface.