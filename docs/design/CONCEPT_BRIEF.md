# Concept brief: Er-Han Burger redesign (round 1)

Three designers each build one working prototype of a genuinely different creative direction. The prototypes are judged by independent agents against the criteria below; the winner becomes the design system for the whole site.

## Read first

`docs/design/PRINCIPLES.md` and every file in `docs/design/research/`, especially `reference-carte.md` (the builder experience the client loves; learn the interaction, never copy its brand, colours, fonts or assets).

## Deliverable

A self-contained prototype in `charcoal-demo/concepts/<slug>/`:

- `index.html` – home page (brand, open status, how ordering works, featured meal deals, menu entry, visit details).
- `menu.html` – full menu from the real catalogue with category navigation, search and a basket.
- `product.html` – the customise screen for **Half Pounder with Cheese** (and it should also render a second product type you choose, e.g. a meal deal or chips, via `?product=<id>`), with a visible preview of the food, ingredient/option tiles, live price and an order button. Tapping a topping must visibly add or remove that layer on the preview with a short drop (CSS transform/opacity, 250–350 ms). Adding to the basket shows a finish moment and turns the button into "View basket".
- A basket (sheet, drawer or page) with quantities, the optional name and note, the open/closed notice and the "Order via WhatsApp" link (use the real message builder from `../../basket-ui.js` or replicate its message format).
- `concept.css` holding the concept's design tokens (colour roles, type scale, spacing, radii, elevation, motion) as CSS custom properties, then components.
- `NOTES.md` (max 300 words): the idea, palette with roles and contrast ratios, type pairing, key layout decisions, how product imagery is standardised, what you would do next.

## Data and assets

- Import the real catalogue: `import { catalog, formatPrice, getUnitPricePence, createDefaultSelections, findProduct } from '../../catalog.js'`. Product image paths in the catalogue are relative to `charcoal-demo/`; resolve them with `new URL(path, new URL('../../', import.meta.url)).href`.
- Reuse existing cut-outs only: `charcoal-demo/assets/` (props, sauces, menu cut-outs, egg, halloumi), `burger-builder-demo/assets/` (bun, top, beef, cheese, lettuce, tomato, onion, pickle, cucumber, sauces) and the root `IMG_*` photos. Never use `IMG_0402.jpeg` or `IMG_0367.jpeg` (watermarked). Standardise presentation: one surface, consistent scale and shadow; compose meal deals from cut-outs rather than showing white-box stock photos. You may make simple procedural graphics (CSS/SVG) but no new photographic imagery and no paid services.
- Prices, products, options and rules come from the catalogue and must not change.

## Rules

- Customer-facing text in British English only (Basket, Customise, Chips, Mayonnaise), prices in £. No Turkish. Only verified claims (see PRINCIPLES.md).
- Static files, ES modules, no build step. External resources: Google Fonts only.
- `html, body` set an explicit background.
- Works at 390×844 and 1440×900 with no horizontal scrolling; 44 px touch targets; visible focus; `prefers-reduced-motion` respected.
- Original Er-Han design language. No logos, assets, layouts or trade dress copied from any brand.
- Test locally at `http://127.0.0.1:4173/charcoal-demo/concepts/<slug>/` with Node Playwright (`require('playwright')`, Chromium pre-installed; install nothing). Screenshot desktop and phone, look at the screenshots, and refine at least once. Do not edit files outside your concept folder; do not commit.

## Judging criteria

Professionalism, brand identity, visual appeal, design coherence, originality, mobile ease of use, ease of ordering, readability, fit with the animation system, performance, future extensibility.
