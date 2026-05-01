# Active Project: Pactum Landing Page

## Product
Pactum — AI hiring assessment platform. Tests how well candidates use AI tools to complete real work tasks, not whether they can memorize algorithms.

## Tech Stack
- Next.js 16.2.4 (App Router), React 19, TypeScript
- Tailwind CSS v4 (config via @theme in globals.css, no tailwind.config.js)
- Framer Motion v12
- Lucide React v1

## Design System
- Based on DESIGN.MD (Expo-inspired)
- Font: Inter (400–900 weights) — DESIGN.MD explicitly mandates this despite CLAUDE.MD's general "no Inter" rule
- Background: Cloud Gray (#f0f0f3), Cards: Pure White (#ffffff)
- Primary CTAs: Black pill buttons (9999px radius)
- Body text: Near Black (#1c2024) + Slate Gray (#60646c)
- Section spacing: 120px vertical padding (≈ DESIGN.MD's 96–144px gallery spacing)
- No gradients, strictly monochromatic interface

## Tally Form
- URL: https://tally.so/r/ODBEQg
- Embed ID: ODBEQg
- Used in: Hero section and FinalCTA section

## Sections (in order)
1. Nav — sticky, blur backdrop on scroll
2. Hero — headline + Tally embed
3. HowItWorks — 3-step cards
4. Problem — LeetCode/take-home comparison table
5. Pricing — Starter $99/mo, Pro $599/mo, Enterprise custom
6. FinalCTA — dark banner + Tally embed
7. Footer
