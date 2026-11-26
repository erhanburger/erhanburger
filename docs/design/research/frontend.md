# Er-Han Burger: frontend research and audit

Method: Playwright Chromium, desktop 1440x900 (Chrome UA) and iPhone 13, 26 Nov 2026, home pages only. Third-party hosts are blocked in this sandbox, so weights, LCP and request counts are approximate (ads, analytics, some consent/CDN assets missing; Shake Shack and Honest had 11-14 failed requests). Not reachable: mcdonalds.com, awwwards.com, behance.net (no connection / 400).

## A. Benchmarks (home page, desktop; iPhone in brackets where different)

| Site | Requests | Weight | Images | LCP | Fonts | Tokens (custom props) | Contrast fails | Tap <44px (iPhone) |
|---|---|---|---|---|---|---|---|---|
| Five Guys UK | 67 | 5.1 MB (7.6) | 43; jpeg 1.9 MB, webp 2.2 MB, svg | 1.7 s | woff2, swap, no preload | 93 | 2 | 10 of 17 |
| Honest | 32 | 2.8 MB | 11 webp + 413 KB GIF; 8 missing alt | 1.1 s | no font-display | 22 (4 used) | 1-4 | 15 of 18 |
| Byron | 22 | 4.3 MB (video 2.5) | 14 webp, srcset, lazy | 0.9 s (poster) | 2 woff2 preloaded, swap | 29 (249 uses) | 0 | 4 of 13 |
| Wendy's | 62 | 0.9 MB (0.98) | 44; webp 439 KB, `<picture>` + lazy | 1.6 s | 1 variable woff2 preloaded | 39 (0 used) | 0 | 3 of 51 |
| Shake Shack | 111 | 10 MB (script 8.9) | 7 webp 474 KB | 4.5 s, CLS 0.68 (2.1 mobile) | 53 faces, no swap | 17 | 0 | 36 of 49 (median 23px high) |

Common patterns: 1 h1 plus many h2s; header/nav/main/footer landmarks (Honest has none, Five Guys has no h1); skip link on 3 of 5; breakpoints cluster at about 600-768, 900-1024 and 1200-1440; all respect prefers-reduced-motion; webp is the norm, none serves AVIF; Byron (single stylesheet, 29 tokens, preloaded fonts, 0.9 s LCP) is the best-engineered; Wendy's the lightest. Burger sites generally ship large hero imagery with little a11y polish: tap targets are weak almost everywhere, which is an opening for Er-Han.

## B. Er-Han audit (local)

| Page | Requests | Weight | LCP | Notes |
|---|---|---|---|---|
| home | 24 | 5.4 MB | 0.17 s | 5.3 MB images |
| menu | 42 (30 mobile) | 7.7 MB (6.0) | 0.15 s | 44 images, 25 over-sized |
| product (burger) | 37 | 1.05 MB | 0.13 s | 380 KB HTML |
| product (meal deal) | 18 | 0.49 MB | 0.12 s | HTML alone is 380 KB |

Zero console errors, zero horizontal overflow, zero unlabelled inputs, contrast minimum 7.7:1 (no AA fails), dialog traps focus, Esc closes and returns focus to the Basket button. Local LCP is flattering (loopback, no throttling).

| Severity | Finding |
|---|---|
| High | Image weight: `IMG_0457.jpeg` is 3.5 MB (shown at about 250 px) and loads on home and menu; 30 root-level PNG/JPEG files total 8.8 MB, stored outside `charcoal-demo/`. Menu images are 2-4x larger than displayed. |
| High | `product.html` is 389 KB: 10 base64 WebP backgrounds (about 290 KB binary) in an inline `<style>`, loaded for every product including ones that never use them; uncacheable and not responsive. Move to files. |
| High | Design-system readiness: 58 distinct hex colours, 152 distinct length values, only 12 custom props (colour only, no type, space, radius, motion). Border and panel colours are hard-coded (e.g. `#34302d`, `#705642`, `#251f1a`). |
| Medium | Three overlapping stylesheets (styles.css 610 lines holds shared plus builder rules; home.css 132; menu.css 112). Seven near-duplicate breakpoints (360, 550, 555, 760, 761, 860, 900 px plus height queries). |
| Medium | Focus: one global 2 px accent outline (good) but home.css has no focus rule; no skip link; menu has no footer; first Tab stop on the menu is the phone link. |
| Medium | Tap targets: "Replay assembly" 107x40; 2-3 inline links under 44 px per page. |
| Medium | All 12-44 images per page have `alt=""` (decorative; acceptable only while names sit beside them). No `srcset`, no explicit width/height (CLS 0.05 on menu). |
| Low | Dialog is solid (labelled, focus managed). Builder canvas has an aria-label and 24 `aria-pressed` toggles with 5 live regions. Reduced motion handled. `rel=icon` is `data:,` (no real favicon, no meta description on menu/product). |

Readiness: the data-driven catalog (catalog.js, products/*.js, product-profiles.js) is a strength; presentation is not tokenised, and photography is referenced as file paths in data, so a real photo swap is a per-product edit. Animation modules (scene, ingredient-motion, sauce-motion) are separated from layout, so a restyle should not break them if class and `data-` hooks are kept.

## C. Proposed design tokens (`css/tokens.css`)

```css
:root{
 /* colour roles: surface, text, brand, state. Dark default, tokens only reference roles */
 --c-bg:#141312; --c-surface:#1e1b19; --c-surface-2:#251f1a; --c-line:#433a33;
 --c-text:#f5eee6; --c-text-muted:#b9ac9d; --c-brand:#f1ad77; --c-on-brand:#141312;
 --c-success:#7fd18b; --c-danger:#ff8a80; --c-focus:var(--c-brand);
 /* type: fluid scale 1.2, two families max */
 --font-body:system-ui,sans-serif; --font-display:var(--font-body);
 --t-xs:.8125rem; --t-sm:.9375rem; --t-md:1rem; --t-lg:clamp(1.125rem,1rem+.5vw,1.25rem);
 --t-xl:clamp(1.375rem,1.1rem+1vw,1.75rem); --t-2xl:clamp(1.75rem,1.2rem+2.5vw,3rem);
 --lh-tight:1.15; --lh-body:1.45;
 /* space (4px base) */
 --s-1:.25rem;--s-2:.5rem;--s-3:.75rem;--s-4:1rem;--s-5:1.5rem;--s-6:2rem;--s-7:3rem;--s-8:4.5rem;
 --gutter:clamp(1rem,5vw,3rem); --measure:68ch; --max:1530px;
 /* radii, elevation, targets */
 --r-sm:6px;--r-md:10px;--r-lg:16px;--r-pill:999px;
 --e-1:0 1px 2px #0006; --e-2:0 8px 24px #0008; --e-sheet:0 -12px 40px #000a;
 --tap:44px;
 /* motion */
 --m-fast:120ms;--m-base:220ms;--m-slow:420ms;--ease-out:cubic-bezier(.2,.8,.2,1);
}
@media (prefers-reduced-motion:reduce){:root{--m-fast:0ms;--m-base:0ms;--m-slow:0ms}}
```
Breakpoints as container/media constants: 40em, 64em, 90em only.

## D. Component inventory
Button (primary, secondary, ghost, icon; 44 px min), chip/filter, product card (image slot, name, price, quick add), option tile (radio/checkbox semantics, price delta, selected, disabled), stepper (+/- with live count), sticky order bar (total, Add to basket), basket sheet (dialog), notice (info, error, closed-hours), header/nav (skip link, basket count badge), section heading, price, image frame, form field.

## E. File architecture (no build)
```
charcoal-demo/css/tokens.css base.css layout.css  components/*.css  pages/{home,menu,builder}.css
  (loaded with @layer tokens, base, components, pages; one @import-free <link> per file, HTTP/2)
charcoal-demo/js/{data,ui,motion}/   (move catalog and products into data/)
charcoal-demo/img/{products,ingredients,sauces,props,hero}/ + img/_src/ (originals, not served)
```
Rule: no hex or px literals outside tokens.css (grep check). Builder backgrounds become real files.

## F. Image pipeline
Single canvas per type: product card 4:3 transparent-edge cutout, hero 3:2. Export widths 320/480/720/1080 as AVIF (q50) with WebP (q75) fallback via `<picture>` and `sizes`; JPEG only for photos without alpha. Set width/height, `loading=lazy`, `fetchpriority=high` on the hero only. Run through an offline script (`cwebp`/`avifenc`/sharp, run by hand, outputs committed). Target: card <=30 KB, hero <=120 KB.

## G. Budgets
Home: <=500 KB transferred, <=25 requests, LCP <=1.8 s on slow 4G, CLS <=0.05. Menu: <=800 KB initial. Builder: <=600 KB, HTML <=40 KB. JS <=100 KB excluding product data; CSS <=40 KB; no font download over 60 KB.

## H. Accessibility rules
WCAG 2.2 AA: text 4.5:1, UI 3:1; focus ring 3:1, never obscured by sticky bar (`scroll-padding-bottom`); targets >=44 px (SC 2.5.8 minimum 24); one h1, no skipped levels; skip link; landmarks incl. footer; real alt on product photos; selected state not by colour alone; announce basket changes via polite live region; dialog restores focus; reduced motion disables replay and parallax; British English and GBP only.
