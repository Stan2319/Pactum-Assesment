# Technical Decisions

## 2026-06-03 — Flat Design pivot (Bento Grid Showcase / ui-ux-pro-max)
globals.css: :root updated with new brand palette (bg #0F0F23, fg #F8FAFC, primary #8B5CF6, secondary #A78BFA, accent #FBBF24, muted #27273B, border #4C1D95). Dashboard tokens kept intact. [data-landing="true"] block removed (superseded). New .btn-primary (amber, border-radius 4px) and .btn-secondary (transparent + border, border-radius 4px) utility classes added. No gradients, no shadows, 150–200ms transitions.
Nav.tsx: Removed framer-motion entirely. Solid #0F0F23 background (no blur), #4C1D95 bottom border. Logo now has purple BETA badge (border-radius 2px) instead of indigo dot. Nav links use #A78BFA with hover to #F8FAFC. CTA uses .btn-primary class with href="#cta".
Hero.tsx: Removed radial glow overlay and dot-grid backgroundImage. Solid #0F0F23 section, #4C1D95 bottom border. Eyebrow tag uses #27273B background + #4C1D95 border (flat chip, radius 2px). CTAs use .btn-primary and .btn-secondary classes. fadeUp variant duration 0.4s (was 0.6s), stagger 0.08s (was 0.1s). Social proof color #4C1D95 (was rgba muted).

## 2026-06-03 — Font migration to Plus Jakarta Sans
Landing page redesign ("Obsidian" dark SaaS) replaces Inter with Plus Jakarta Sans (300–800 weights + italic 400). Import updated in globals.css, body font-family updated, @theme inline font-sans updated. Prior Inter decision below is superseded for landing pages.

## 2026-06-03 — Obsidian dark palette + landing tokens
New [data-dark="true"] tokens: canvas #09090c, surface #101016, cobalt #5c72f0 (replaces #0d74ce). Added [data-landing="true"] block with --ld-* custom properties for landing-specific palette (accent glow, raised surface, muted ink). Nav and Hero use hardcoded hex matching these tokens (no data attribute required on those elements — they are always dark).

## 2026-06-03 — Nav redesign (Obsidian)
Nav.tsx rewritten as default export (was named export `Nav`). Removed useScroll scroll-detection logic; background is always the frosted dark glass (rgba(9,9,12,0.85) + blur). Added logo accent dot with indigo glow. "Log in" moved to right side alongside "Get started" pill button (accent indigo). Import sites that used `{ Nav }` must update to default import.

## 2026-06-03 — Hero redesign (Obsidian)
Hero.tsx rewritten: dark canvas #09090c, dot-grid via backgroundImage on the section, radial accent glow overlay. Local fadeInUp/stagger variants defined inline (not imported from lib/motion) to allow custom easing values. Tally embed removed — CTAs are now anchor links (#final-cta, #how-it-works) + .btn-accent class. Export changed from `export const Hero` to `export function Hero`.

## 2026-04-19 — Font choice (SUPERSEDED for landing)
DESIGN.MD mandates Inter (weight 400–900) for Expo-inspired aesthetic. CLAUDE.MD general rule says "never use Inter." Project-specific DESIGN.MD overrides the general rule. Inter used with extreme negative letter-spacing (-0.04em on display) which is the intentional design signature, not generic usage.

## 2026-04-19 — CSS import order (Tailwind v4)
In Tailwind v4, @import "tailwindcss" generates rules, so Google Fonts @import url() must precede it to avoid CSS warning. Correct order: Google Fonts @import first, then @import "tailwindcss".

## 2026-04-19 — Tailwind v4 configuration
No tailwind.config.js in v4. Custom colors and theme tokens defined in @theme {} block inside globals.css. CSS custom properties defined in :root, then referenced in @theme inline {}.

## 2026-04-19 — Tally embed approach
Used iframe with data-tally-src (Tally's lazy-loading pattern) + inline script to load tally embed.js. The Hero iframe has no filter; FinalCTA iframe uses CSS filter: invert(1) hue-rotate(180deg) to adapt the white-background Tally form to the dark banner.

## 2026-04-19 — Project structure
Next.js app lives at /mnt/d/projects/Asses/pactum/ (not the root /mnt/d/projects/Asses/ due to npm naming restrictions on capital letters in "Asses").
