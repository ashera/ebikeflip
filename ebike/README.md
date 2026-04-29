# Handoff: Voltra Design System (eBikeFlip)

## Overview
This handoff documents the **Voltra design system** — a complete visual + component language for a peer-to-peer eBike marketplace (eBikeFlip). It covers color, typography, spacing, elevation, motion, and the marketplace-specific components that power the browse, detail, and seller-profile experiences.

## About the Design Files
The files in this bundle are **design references created in HTML/React** — prototypes showing intended look and behavior, **not production code to copy directly**. Your job is to **recreate this design system in the eBikeFlip codebase's existing environment** (whatever framework + styling approach is already in use — React + CSS Modules, Tailwind, Vue, SwiftUI, etc.) using its established patterns. If no environment is set up yet, pick the framework that best fits the project (the reference is React, so React + a CSS solution like Tailwind or vanilla-extract is a natural choice).

The HTML prototype is canonical for **visual and behavioral intent**. The CSS file (`tokens.css`, `system.css`) is canonical for **exact token values**.

## Fidelity
**High-fidelity.** Every color, font size, radius, shadow, and spacing value in the references is a deliberate token decision. Reproduce them exactly. The reference uses oklch() color values — these can be pasted as-is into any modern browser, or converted to hex/HSL if your toolchain requires it.

---

## Step-by-step: applying this system to your codebase

### 1. Install the typography
The system uses three Google Fonts. Add them to your app's HTML head or load via your font system:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
```

- **Archivo Black** — display, headlines, prices
- **Inter** — UI body, labels, all interface text
- **JetBrains Mono** — eyebrows, spec callouts, data values, metadata

### 2. Drop in the design tokens
Copy `tokens.css` into your global stylesheet (or convert into your token system — Tailwind config, CSS Modules variables, Style Dictionary, Tokens Studio JSON, etc.). The full token map lives in [`tokens.css`](./tokens.css). Key categories:

- **Color** — `--volt-50…800` (orange accent), `--ink-1…4` (text), `--paper`/`--surface`/`--surface-sunken`/`--hairline`, status (`--ok`, `--warn`, `--danger`, `--info`)
- **Type** — `--font-display`, `--font-sans`, `--font-mono`; size ramp `--t-display-xl` through `--t-eyebrow`
- **Space** — 4px base scale, `--s-1` (4px) → `--s-11` (96px)
- **Radius** — `--r-1` (4px) → `--r-pill` (999px)
- **Elevation** — `--e-1` through `--e-4`
- **Motion** — `--ease-out`, `--ease-in-out`, `--dur-fast`/`--dur`/`--dur-slow`

### 3. Recreate the components
Each component below has a CSS class block in `system.css` and a React reference in `components/`. Recreate them in your framework. The full component list:

**Primitives**
- `Button` — pill shape, four variants (primary/dark/ghost/quiet), three sizes
- `Badge` — pill, six variants (default/volt/volt-soft/ok/warn/info/ink)
- `Spec` — small data chip with display-font value + mono unit + uppercase label
- `Segmented` — pill-shaped segmented control
- `Input` — pill input with optional leading icon
- `Topbar` — brand mark + nav + actions

**Marketplace**
- `ListingCard` — image + favorite + condition/badge flags + seller row + title + spec chips + price row
- `FilterPanel` — sticky rail with chip filters, range inputs, checkbox lists
- `SellerCard` — avatar, name, stars, stat row (sold/reply/response), trust list, CTA
- `MessageThread` — two-pane: thread list with listing tag + conversation pane with bubbles + composer

**Screens (compositions)**
- Browse (filter rail + toolbar + 3-up grid)
- Listing detail (gallery + price + spec grid + escrow callout)
- Seller profile (header + active listings + about + reviews)

### 4. Wire up imagery
Listings render real photography on a 4:3 image. Use the codebase's existing CDN/image pipeline. The reference uses Unsplash photos via `images.unsplash.com/photo-{id}?auto=format&fit=crop`. Image area has a subtle hover zoom (`transform: scale(1.04)` over 360ms ease-out) — keep this.

### 5. Apply the screen patterns
The three sample screens (Browse, Detail, Profile) define the system's layout vocabulary. Use them as templates when adding new pages. Section structure:
- 1280px max page width, 32px gutters
- Sticky filter rails at `top: 32px`
- Section dividers via `border-top: 1px solid var(--hairline)` plus 96px vertical padding
- 280px label column + content column for documentation-style layouts

---

## Design Tokens — exact values

### Color (oklch)
```
--volt-500   oklch(70% 0.18 50)    /* primary accent */
--volt-100   oklch(93% 0.06 50)
--volt-700   oklch(54% 0.16 40)

--ink-1      oklch(18% 0.01 60)    /* headlines */
--ink-2      oklch(32% 0.008 60)   /* body */
--ink-3      oklch(48% 0.006 60)   /* secondary */
--ink-4      oklch(64% 0.005 60)   /* tertiary */

--paper            oklch(98.5% 0.005 70)
--surface          oklch(100% 0 0)
--surface-sunken   oklch(96% 0.006 70)
--hairline         oklch(91% 0.005 70)
--hairline-strong  oklch(85% 0.005 70)

--ok-500     oklch(65% 0.15 150)
--warn-500   oklch(75% 0.15 85)
--danger-500 oklch(60% 0.18 25)
--info-500   oklch(60% 0.13 240)
```

### Typography
| Token | Family | Size | Line | Weight | Use |
|---|---|---|---|---|---|
| display-xl | Archivo Black | 96 | 0.9 | 900 | hero headlines |
| display-l | Archivo Black | 56 | 1.0 | 900 | section heroes |
| h1 | Archivo Black | 40 | 1.1 | 900 | page titles |
| h2 | Archivo Black | 28 | 1.1 | 900 | subsection |
| h3 (card title) | Archivo Black | 22 | 1.05 | 900 | card titles, prices |
| body-l | Inter | 18 | 1.55 | 400 | intro paragraphs |
| body | Inter | 15 | 1.5 | 400 | UI default |
| body-s | Inter | 13 | 1.45 | 400 | secondary UI |
| caption | Inter | 12 | 1.4 | 600 uppercase | field labels |
| eyebrow | JetBrains Mono | 11 | 1.4 | 500 uppercase 0.16em | labels above headlines |
| mono-data | JetBrains Mono | 11 | 1.4 | 500 uppercase 0.12em | spec keys, metadata |

### Spacing (4px base)
4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96

### Radii
4, 8, 12, 16, 20, 28, 999 (pill)

### Elevation
- `--e-1` resting card — `0 1px 2px / 0.06`
- `--e-2` chip / hover — `0 4px 12px / 0.06`
- `--e-3` listing hover — `0 12px 32px / 0.10`
- `--e-4` modal — `0 24px 64px / 0.14`

### Motion
- Fast: 120ms (state changes)
- Default: 200ms (hover, focus rings)
- Slow: 360ms (image zoom, modal entrance)
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` for out, `cubic-bezier(0.65, 0.05, 0.36, 1)` for in/out

---

## Files in this handoff

- `Design System.html` — entry point of the prototype
- `tokens.css` — the token layer (paste into your global stylesheet)
- `system.css` — the component CSS (reference for class structure + values)
- `app.jsx` — composition / sections layout
- `components/primitives.jsx` — Button, Badge, Spec, Segmented, Topbar, Icon
- `components/marketplace.jsx` — ListingCard, FilterPanel, TrustPanel (SellerCard), MessageThread
- `components/screens.jsx` — BrowseScreen, DetailScreen, ProfileScreen
- `components/photos.jsx` — Unsplash photo URL constants

## Recommended order of work
1. Add fonts + tokens to your global stylesheet → confirm body text + ink colors render.
2. Build `Button`, `Badge`, `Spec`, `Input`, `Segmented` — the primitives unblock everything else.
3. Build `ListingCard` — it's the highest-leverage component on the marketplace.
4. Build `FilterPanel` and assemble the Browse screen.
5. Build the listing detail layout.
6. Build the seller-profile layout including `SellerCard` (trust panel) and reviews.
7. Build `MessageThread` last — it's the most isolated component.

## Notes
- All photography in the prototype is from Unsplash. Replace with eBikeFlip's own listing imagery in production. Keep the same aspect ratios (4:3 for cards, 16:10 for detail hero).
- The Volt orange is calibrated specifically for accessibility: `oklch(70% 0.18 50)` against `var(--ink-1)` and `white` both meet WCAG AA for large text. If you change the hue, re-test contrast.
- "Voltra" is a placeholder brand name in the prototype. Swap for "eBikeFlip" or your final brand mark in the topbar.
