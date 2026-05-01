# Technical Decisions

## 2026-04-19 — Font choice
DESIGN.MD mandates Inter (weight 400–900) for Expo-inspired aesthetic. CLAUDE.MD general rule says "never use Inter." Project-specific DESIGN.MD overrides the general rule. Inter used with extreme negative letter-spacing (-0.04em on display) which is the intentional design signature, not generic usage.

## 2026-04-19 — CSS import order (Tailwind v4)
In Tailwind v4, @import "tailwindcss" generates rules, so Google Fonts @import url() must precede it to avoid CSS warning. Correct order: Google Fonts @import first, then @import "tailwindcss".

## 2026-04-19 — Tailwind v4 configuration
No tailwind.config.js in v4. Custom colors and theme tokens defined in @theme {} block inside globals.css. CSS custom properties defined in :root, then referenced in @theme inline {}.

## 2026-04-19 — Tally embed approach
Used iframe with data-tally-src (Tally's lazy-loading pattern) + inline script to load tally embed.js. The Hero iframe has no filter; FinalCTA iframe uses CSS filter: invert(1) hue-rotate(180deg) to adapt the white-background Tally form to the dark banner.

## 2026-04-19 — Project structure
Next.js app lives at /mnt/d/projects/Asses/pactum/ (not the root /mnt/d/projects/Asses/ due to npm naming restrictions on capital letters in "Asses").
