# Imagery and motion research

Researched 26 November 2026 by the Art Direction / Motion agent in Chromium (1440×900 and iPhone 13) with DOM measurement.

**Not accessed:** mcdonalds.com, awwwards.com, behance.net (unreachable). Burger King UK menu app showed an error page; Shake Shack menu URLs returned 404 or empty; Wendy's /menu is 404 (order.wendys.com used); GBK menu is a PDF; Burger & Lobster and Black Bear product grids not reached.

## Observations

- **Five Guys UK menu:** cut-outs on white cards, 3/4 camera (about 25–30° above), soft contact shadow lower right. Files 530×450 (1.18:1) shown 265×220, `object-fit: contain`. Burger, dog and sandwich share one footprint (about 45% of card width). Same cards in two columns on mobile.
- **Wendy's order site:** square 256×256 files shown 144×144. Combos are one composed image: drink back-left, sandwich front-centre, fries front-left, same layout for every combo.
- **Byron:** cut-outs on warm off-white rgb(240,237,233), same 3/4 angle, hard shadow to the right. 345×460 files in 300×300 boxes with `cover`; product in the central 60%.
- **Honest:** photographed set (wood, branded paper), 1200×864 files, one eye-level hero set for every burger.
- **Shared rules:** one camera angle, one light direction, one ratio per grid, fixed share of frame, drinks only inside combos. Mismatch is avoided by composing every image to a template, not by photo quality.
- **Motion:** menus are almost static. Transitions 150–400 ms (Five Guys 0.35 s ease-in-out, Shake Shack 0.2 s, Byron 0.15–0.4 s, BK 0.2 s ease-out). Few honour `prefers-reduced-motion`. Nobody animates a build inside the menu; motion confirms state.

## Er-Han images today

- Painted grey checkerboard (fake transparency): IMG_0350, IMG_0357, IMG_0360. Off-white backgrounds: IMG_0362, IMG_0364 (Red Bull also shows a checkerboard on screen).
- White-background JPEGs: IMG_0354, 0356, 0359, 0361, 0366–0369, 0373, 0400–0405. IMG_0397 (water) on solid black. IMG_0365 has real alpha.
- Watermarks: IMG_0367 ("alamy" strip, removed from the preview), IMG_0402 (stock watermark, not used).
- Scale and style mismatch: burger sources 360–800 px with different crops; drinks fill 85–95% of frame, burgers about 80%; IMG_0350 is a splash image; veggie products reuse the beef photo IMG_0351; deal compositions differ (IMG_0405 mirrored). IMG_0457 is 4032×3024, 3.5 MB.

## Image spec

1. Square 1:1 master at 1200 px; export 800 and 480 px WebP with alpha, under 80 KB. Menu card image box 4:3 with `object-fit: contain`.
2. One background surface for every product. No white, black or checkerboard boxes.
3. Safe area: product in the central 80%, 10% margin per side, extra 14% at the bottom for the shadow.
4. 3/4 view about 25° above, key light upper left, shadow lower right. The contact shadow is drawn in CSS (soft ellipse), never baked in.
5. Scale as share of canvas: burger 70% width; hot dog and wrap 78%; nuggets or chips portion 62%; can 60% height; bottle 70% height. Drinks are always smaller than the main in shared frames.
6. Meal deals: one composed set built in code from cut-outs: main front-centre (62%), chips front-left (38%), drink back-right (30%).
7. Interim without new photography: key out grey/white backgrounds where edges allow; otherwise place on a consistent rounded light tile; never use IMG_0402 or IMG_0367; show the veggie photo for veggie products; use IMG_0365 for water; downscale IMG_0457; normalise scale with CSS per product type.

## Motion spec

- Cards: no autoplay. Hover/focus lift 2 px plus shadow, 180 ms `cubic-bezier(.2,.7,.2,1)`. Image swap fade 150 ms.
- Builder: ingredients enter one by one, 280–360 ms each, 70–90 ms stagger, ease-out with a 2–4 px settle. Sauce pour 600–900 ms. Whole build under 2.5 s for six layers, always skippable; Add to basket is enabled immediately.
- Feedback: add-to-basket pulse 220 ms; price cross-fade 150 ms; no loops after the build ends.
- Reduced motion: finished stack appears with a 100 ms fade; sauces as static state; no bounce.
- Performance: animate only `transform` and `opacity`; 480–800 px WebP layers; `decoding="async"`, lazy loading below the fold; pause when the tab is hidden.

## Shot list for future photography

One session, fixed light, tripod at 25°, grey card, RAW 4:3. Per burger: one clean hero and a pull-apart layer set (bottom bun, patty, cheese, salad, top bun) for the builder. Chips, nuggets and hot dog on the shared tray. One can and one bottle per drink at the same angle. Each meal deal as a composed set. Sauce bottles and a pour sequence. Empty plate and tray props. Backdrop that keys cleanly, plus one real set for editorial use.
