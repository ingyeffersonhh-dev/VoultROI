# Project Context — dolares

## Overview
React + Vite + Tailwind SPA calculator for BDV USD → BPay → USDT margin calculation, deployed on Vercel.

## Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel
- **Testing**: Vitest (unit + component), @testing-library/react, v8 coverage

## Architecture
- Single-page application (SPA)
- Calculator logic for currency conversion margins
- BDV (Banco de Venezuela) USD → BPay → USDT conversion pipeline
- Client-side only (no backend)

## Conventions
- Component-driven development
- Atomic design patterns
- Strict TDD enabled
- ESLint + Prettier + TypeScript strict mode

## SDD Configuration
- **Persistence Mode**: openspec
- **Artifact Root**: openspec/
- **PR Strategy**: ask-on-risk
- **Review Budget**: 400 lines
- **Execution Mode**: interactive

## Testing Capabilities
- **Runner**: vitest
- **Layers**: unit, component
- **Coverage**: v8 (statements, branches, functions, lines)
- **Linter**: eslint (react, typescript, prettier)
- **Type Checker**: tsc --noEmit
- **Formatter**: prettier
- **Strict TDD**: true (test runner detected)

## Skill Registry
- Location: .atl/skill-registry.md
- Auto-generated from global skill sources
