# Er-Han Burger experience concepts

The current working preview is based on `c59a5f7bce82a2ac49248c319ed2881b59311f74`. These independent concepts use existing product photographs and drawings. They run as demos and have their own test baskets.

## Open Grill

Food photography and an editorial opening introduce the brand. The showcase connects to the existing full menu. The prototype demonstrates four products and a preparation replay.

[Prototype](concepts/open-grill.html) · [Desktop](concepts/open-grill-1440.png) · [Mobile](concepts/open-grill-390.png)

## Order Counter

The complete 45-card catalogue takes priority. Menu categories, product customisation and a basket receipt form a compact ordering flow. The prototype uses the verified catalogue. The scene image is static and basket removal is pending in this concept.

[Prototype](concepts/order-counter.html) · [Desktop](concepts/order-counter-1440.png) · [Mobile](concepts/order-counter-390.png)

## Build Room

A preparation workbench leads into numbered customisation steps. The prototype shows an animated assembly, live GBP total and a persistent basket dock. Three representative products are included. The mobile layout requires more scrolling.

[Prototype](concepts/build-room.html) · [Desktop](concepts/build-room-1440.png) · [Mobile](concepts/build-room-390.png)

## Independent review

Chromium at 1440 × 900, 390 × 844 and 568 × 320. All three concepts passed the Chips to Make it large to basket journey at £3.90. No horizontal overflow, browser errors or broken loaded photos were observed in that journey. The working preview also passed Chips with No salt and ketchup, Deal 5 with Pepsi, and Large Chicken Shish with Chips and a chilli choice. Continue shopping returned to the right menu category.

There is no clear overall winner. Open Grill prioritises brand and food, Order Counter prioritises full-menu ordering, and Build Room prioritises preparation. A possible combined direction uses Order Counter for the menu and Build Room for customisation. Any selected design must carry forward the complete menu, required choices, accessible controls and the working checkout rules.

## Preview at £0

Serve the repository root with `python3 -m http.server 3094 --bind 127.0.0.1`, then use the prototype links above under `http://127.0.0.1:3094/docs/experience-review/`. Screenshots can be reviewed directly on GitHub. Authenticated Cloud HTTP preview would need a configured port. The current environment exposes SSH only. Netlify was left alone while its credit limit is exhausted.

[Primary reference and rendering studies](primary-reference.md) · [Restaurant and design research](restaurant-research.md)
