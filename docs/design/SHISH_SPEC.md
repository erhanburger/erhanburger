# Chicken Shish: visual and interactive specification

Client brief, 27 November 2026. Chicken Shish sets the quality standard and the reusable "box scene" system for later products. Other products must not change in this phase.

## Real product (reference: `charcoal-demo/assets/source/shish/real-*.jpg`)

- Thin, irregular slices of chicken breast cooked on a flat griddle: golden, lightly browned, juicy. Never cubes or thick chunks; no heavy black specks or burnt look.
- Cooked with white onion strips and red and green bell pepper strips.
- Served in a white, open-lid **HP10 foam takeaway box** (not a plate). With chips: chips at the bottom, chicken on top, cooked onions and peppers among the chicken. Salad along one side of the box. One lightly toasted pitta on top that must not hide most of the chicken.
- Salad presentation the client likes: lettuce, sliced tomato, round cucumber slices, red onion rings.
- The ChatGPT images (`ref-*.png`) are references for composition and lighting only; they are not final and their Medium/Large difference is too weak.

## Portions

| Product | Chicken pieces | Chips |
|---|---|---|
| Chicken Shish – Medium | about 15 | none |
| Chicken Shish – Medium with Chips | about 15 | standard |
| Chicken Shish – Large | about 25 | none |
| Chicken Shish – Large with Chips | about 25 | standard (same as Medium) |

Large has about 67% more chicken and must read as more at first glance through piece count and heap coverage, never by changing piece size, camera, zoom or box size.

## Consistency

All four variants: same camera angle and distance, same HP10 box, same background (the site's dark kitchen-pass stage), same light, same chicken texture and piece size. Menu card art is a still of the same scene.

## Layer library

`charcoal-demo/assets/library/shish/` with `manifest.json`. Each item is a transparent WebP sprite cut from the real photographs where possible (high-resolution originals kept beside them or in `assets/source/`):

- `box`: HP10 base (inside floor and walls) and the open lid behind it, plus the interior area (normalised polygon) where food may sit.
- `chicken/*`: many individual chicken slices (varied shapes, same scale), ideally 30+ distinct sprites.
- `onion/*`: cooked white onion strips. `pepper-red/*`, `pepper-green/*`: cooked pepper strips.
- `chips/*`: individual chips or small clumps to build a bed.
- `pitta`: one lightly toasted pitta.
- Salad: lettuce, tomato slices, cucumber rounds, red onion rings (existing cut-outs may be reused if they match).
- Sauces: existing bottles and the sauce-pour engine (`sauce-motion.js`).

No cartoon or geometric stand-ins. If a layer cannot be made photorealistic from the available photos, say so.

## Interaction (the food must change, not just a label)

| Choice | Visual |
|---|---|
| No pepper | red and green pepper strips lift out and disappear; deselect brings them back |
| No onion | cooked white onion strips removed; back on deselect |
| No Veggie | removes the cooked onions and peppers (assumption: not verified with the client; see below) |
| Salad items (Lettuce, Tomato, Cucumber, Onion, Pickle, All salad) | placed along the box side; removed on deselect |
| Plain | clears salad (existing conflict rule) |
| Sauces and chilli preference | the matching bottle appears and squeezes over the chicken; the sauce is removed on deselect; Extra/Little chilli changes the amount |
| Extra cheese, Halloumi × 2, Egg | placed on the chicken (paid extras offered on the live menu) |

Engine rules: state-driven (the scene always converges to the current selection), interruptible animations, no desync under rapid taps, gravity/weight/contact shadows and settling, transform and opacity only, reduced motion places items directly, the final still matches every selection.

## Options review

- Shish currently receives the burger option groups. "No cheese" has no meaning (no cheese in the product) and is removed for shish.
- Paid burger extras (Extra cheese, Halloumi × 2, Egg) are offered for kebabs on the live menu; they stay until the client decides.
- Salad items are add-ons on the live menu (selected = added), while the description says shish is served with salad. The ticket semantics stay as they are; the client should confirm whether salad is included by default.
- "No Veggie" scope is not defined on the live menu; the visual mapping above is an assumption to confirm.
- "No onion" removes the cooked onions; salad red onion is controlled by the Onion salad choice.

## Delivery

Interactive preview openable on iPhone; independent visual critics must answer: "Does this look as natural and appetising as a real food photo, or like a computer animation?" A technically working but visually poor result is not accepted.
