# Chicken Shish imaging: post-mortem and plan (28 November 2026)

The first box scene (preview v8) was rejected by the client: the HP10 box, chicken, placement, perspective and shadows look artificial. New image production is paused until the client chooses the method below. Evidence and reasoning from an independent food-photography critic and a compositing/3D expert.

## What we used

- Python (Pillow, NumPy) and ImageMagick: colour/brightness segmentation of the client's griddle photo into chicken, onion and pepper sprites; chips and pitta cut from the counter photo.
- The HP10 box drawn procedurally in code.
- A canvas engine (`box-scene.js`) that scatters sprites with a seeded layout, gravity drops and simple drop shadows.
- Not available here: AI image generation or inpainting, 3D modelling (no Blender), OpenCV (installation blocked), paid tools. Three.js is available for real-time 3D.

## Why it failed (ranked)

1. **Camera mismatch.** Food cut from a near top-down griddle photo was placed in a box drawn at a 3/4 front view; perspective never agrees, so pieces read as stickers.
2. **No volume.** One layer of pieces instead of a heap 3–5 deep; chips as a flat tile; salad as a strip.
3. **No contact shadows or ambient occlusion** where pieces touch each other and the box; the pitta floats.
4. **Mixed light and colour.** Each sprite carries the light of its source photo; warm studio stage against a cool white box.
5. **Cut-out damage.** Halos, torn edges, fragments of other ingredients; soft low-resolution sprites next to a crisp vector-clean box.
6. **Scale and grading.** Oversized pieces relative to chips; no unified grade or grain.

Verdict: segmenting the two existing photos cannot reach photographic quality. The engine logic (state-driven, interruptible, portion counts, option mapping, ticket) is sound and stays.

## Methods compared

| Method | Realism | Interactivity | Medium/Large and option consistency | iPhone | Client effort | Risk |
|---|---|---|---|---|---|---|
| A. Locked-camera step photos, layers from differences | Highest (real light and shadow) | Good | Excellent | Good | About 2 hours | Medium |
| B. Isolated ingredient photos composited into a real empty box | Medium (pasted look) | Excellent | Poor (faked contact) | Good | Medium | High |
| C. ChatGPT isolated ingredients | Low to medium | Excellent | Very poor (angle, light, scale drift) | Good | Low, but hard to fix | High |
| D. A full image per state, cross-faded | High per state | Poor (too many combinations) | Fine per state | Heavy | Very high | Very high |
| E. Three.js 3D with modelled or scanned food | CG look at £0 | Best | Perfect | Fair | Very high | Very high |
| F. Hybrid of A: real base plates per portion plus small removable real layers | High | Good | Excellent | Best | About 2 hours | Low to medium |

**Recommended: F, built on a locked-camera shoot (A).** Removing an ingredient reveals a genuine photo beneath; shadows and contact are real; Medium and Large are two real plates; menu cards become real photos.

Limits to accept: no free rotation or relighting; only the two real portion sizes; onions and peppers must sit in separate zones so either can be removed without holes; stacking order is fixed by the shoot order; sauces are added as separate isolated layers.

## Shoot rules (every photo)

- iPhone main 1× lens (no zoom), landscape 4:3, flash off, Live Photo off, HDR as default. Long-press to lock focus and exposure (AE/AF lock) on the box before the first shot.
- Phone fixed on a stand, tripod or a stack of books, never touched between shots (use the timer or the volume button on wired earphones). About 40 cm above the box front edge, tilted about 50–60° downwards, box filling about 70% of the frame with a margin all round.
- Mark the box position with tape on the surface; the box must not move.
- Same light for the whole shoot: even indoor light, no direct sun, no moving shadows; switch off any flickering or coloured lights. The same time of day.
- Background: one plain matte dark surface (black or charcoal board, card or tray) in every shot.
- Format: HEIC or JPEG at full resolution (4032×3024). Send the originals uncompressed (as files, not via messaging apps that compress).
- Naming as below (or send in order and we rename).

## Shot list

Base (once):

1. `00_empty_box.jpg` — the empty HP10 box, lid open, in its taped position.

Chain 1, **Medium with Chips** (build in this order, one photo after each step, nothing else moved):

2. `m_chips_01_chips.jpg` — standard chips bed.
3. `m_chips_02_chicken.jpg` — about 15 chicken slices on the chips (no onion or pepper yet), heaped naturally in the chicken zone.
4. `m_chips_03_onion.jpg` — add the cooked white onion in its zone among the chicken.
5. `m_chips_04_pepper.jpg` — add the red and green pepper strips in their own zone (not on the onion).
6. `m_chips_05_lettuce.jpg` — lettuce along the left side.
7. `m_chips_06_tomato.jpg` — add tomato slices.
8. `m_chips_07_cucumber.jpg` — add cucumber rounds.
9. `m_chips_08_redonion.jpg` — add red onion rings.
10. `m_chips_09_pickle.jpg` — add pickles (optional extra).
11. `m_chips_10_pitta.jpg` — the pitta on top in its usual place.

Chain 2, **Large with Chips** (empty box again in the same taped position): 12 `l_chips_01_chips`, 13 `l_chips_02_chicken` (about 25 slices, same chips amount), 14 `l_chips_03_onion`, 15 `l_chips_04_pepper`, 16 `l_chips_05_salad` (the standard salad in one go, same layout as chain 1), 17 `l_chips_06_pitta`.

Chain 3, **Medium** without chips: 18 `m_01_chicken` (15 slices on the box floor), 19 `m_02_onion`, 20 `m_03_pepper`, 21 `m_04_salad`, 22 `m_05_pitta`.

Chain 4, **Large** without chips: 23 `l_01_chicken` (25 slices), 24 `l_02_onion`, 25 `l_03_pepper`, 26 `l_04_salad`, 27 `l_05_pitta`.

Sauces (isolated, same camera, on the same dark surface or a dark plate in the box position): 28–34 `sauce_{chilli,garlic-mayo,mayo,ketchup,bbq,burger,mustard}.jpg`, each squeezed in the same zigzag across the chicken zone area; 35 `sauce_chilli_little.jpg`, 36 `sauce_chilli_extra.jpg`.

Extras (optional, on top of a finished Medium plate photo each, then removed): 37 `extra_halloumi.jpg`, 38 `extra_egg.jpg`, 39 `extra_cheese.jpg`.

Total: about 39 photos, about 1.5–2 hours including preparation. The chicken can be the same portion moved between chains.

## How the engine will use them

- Portion and chips variant: the chain's chicken plate is the base photo.
- Onion, pepper, salad items, pitta and extras: layers computed from the difference between consecutive photos (mask, feather, real baked shadow); removing fades and lifts the layer to reveal the real photo beneath; adding drops it back.
- Sauces: isolated sauce lines revealed along the squeeze path with the existing bottle animation; removed by reversing.
- Menu cards and home: the finished plate photos of each chain, standardised to the site's stage.
- Delivered as responsive WebP (1600, 800, 480 px); masters kept in `charcoal-demo/assets/source/shish/`.

## If the client prefers ChatGPT

Possible as a fallback (method C), with lower and less predictable realism: each image must share the exact angle, light and scale, which generators do not hold reliably. Best use: four finished hero images (one per variant, with the exact chicken counts) for menu cards, combined with the current engine only for animation hints. For layers, request each item alone on a plain black background, "front 55° top-down view, soft light from top left, 4:3, 3000 px", and an empty open HP10 box with the same prompt wording.

## Customer reference photos (28 November 2026)

`assets/source/shish/ref-customer-box-a.jpg` and `ref-customer-box-sauces.jpg` (cropped from public reviews; food only, reference only, never shown on the site). They show the real presentation: chicken with onions and peppers (and chips under) in the base half of the HP10 box; the pitta in the lid half, lying over the salad; sauces as a white garlic-mayo zigzag with a single burger-sauce stripe down the middle. The shoot layout should follow the client's answer on pitta and salad placement.
