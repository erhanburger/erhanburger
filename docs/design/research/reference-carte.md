# User reference: Carte by Brainy (eat.brainy.ink)

The user shared a phone recording of this product and said it shows exactly the experience they want (26 November 2026). The demo was also opened live in Chromium (Pixel 7 and 1440×900): `https://eat.brainy.ink/atre`, `/atre/build/burger`, order screen.

Carte is a commercial white-label ordering app sold to restaurants (paid plans from $79 a month). Er-Han must not copy its brand, logo, colours, type or assets. What follows are the interaction ideas to learn from.

## What the user likes

- **One-screen builder.** Title, product switch (Beef / Chicken), a large plate with the product in the centre, an ingredient grid and one full-width order button all fit one phone screen with no scrolling.
- **Ingredient as the control.** Each choice is a round photo tile (68 px circle) with its cut-out ingredient and a label. Selected: accent ring and a tick badge. A minus badge appears to remove or reduce.
- **Immediate cause and effect.** Tapping a tile drops that ingredient from above the plate onto the stack within about 250 ms, with a short squash. The price in the button updates and a small "+$1.20" delta floats in and fades.
- **The finish is a moment.** On "Add to order" the controls dim, the status reads "Plating it up", the top bun drops last, steam rises, the status becomes "Hot and ready · Make another", the button turns green "Added to your order" and then becomes "1 · View order" with the basket badge updated.
- **Calm, premium surface.** Deep navy ground, cream text, one hot accent for actions, a serif display headline with one accent word, a clean sans for UI, pill buttons (58 px high, fully rounded), generous spacing, a dark slate board under the food.
- **Menu.** Sticky pill category tabs with search; list rows with round photo, name, description, price and a round "+" button; a featured "Build your burger, from £…" card at the top of the burger section; two-column photo cards for the main range; a bottom tab bar (Menu, Orders, Book, Account).
- **Order screen.** Line items with thumbnails and steppers, pick-up / dine-in / delivery segmented control, name, phone, kitchen note, payment, one full-width "Place order" button with the total.

## Measured details

- Colours (their tokens): ground #131925, deeper #0b0f17, cream text #f9f5f1, accent #df4d0c, secondary accent #fd992f, hairlines and wells as cream at low alpha.
- Type: serif display 33 px regular (Libre Baskerville), sans UI (Geist).
- Buttons: 58 px high, 99 px radius, 17 px label.
- Ingredient drop about 250 ms; plating sequence about 1.5 s; confirmation states change over about 3 s.

## Weaknesses we can beat

- The desktop view is the phone layout stretched: a small plate in a huge empty canvas and a full-width button 1,900 px long.
- Only burgers and pizza get a builder; there is no product-specific preparation (plates, trays, hot dogs) and no sauce pouring.
- The builder shows the plate and patty only; there is no sense of place or brand story.
- Ingredient tiles use generic cut-outs; the plate is the same for every product.

## Lessons for Er-Han

1. The product preview is the hero of the customise screen and must fit with the choices and the order button on one phone screen.
2. Ingredient tiles with real cut-outs are both the control and the legend.
3. Every tap must change the food immediately; the build is a reward, not a wait.
4. Finish with a distinct "ready" moment and turn the main button into the next step (View basket).
5. Keep one deep ground across the whole site, one action colour, one display face.
6. Use the desktop width properly: the food and the choices side by side.
