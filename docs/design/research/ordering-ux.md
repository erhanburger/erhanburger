# Er-Han Burger: ordering-journey research (mobile-first)
Method: Playwright Chromium, iPhone 13 first, then 1440x900 (home pages only for desktop: `*-d-home.png`). Screenshots in this folder. Where a flow stopped, it is stated. Never entered personal data or placed an order.

## Per-site journeys
- **Five Guys UK**: home -> sticky header "ORDER NOW" bag icon plus two stacked outlined CTAs (`five-m-home.png`) -> `/findpostcode` (`five-m-postcode.png`): postcode field + "Find my Five Guys" + "Use my location", yellow banner saying Rewards unavailable for collection. Menu page: big photo cards, one "Order now" red button per product, no prices (`five-m-menu2.png`). STOPPED: store search needs a third-party API (postcode fill timed out); never saw customise/basket.
- **Wendy's US**: home has Order Pickup / Delivery / Menu. Category grid: 2-column, cut-out photos, no prices (`wendys-m-menu.png`). Product list shows name + calories + "View Item". Product page: hero image, nutrition link, sticky full-width pill "Start an order" at thumb height (`wendys-m-product.png`). STOPPED: ingredients/nutrition stayed "Loading..." (API blocked); no store chosen so no customise or basket. Insight: price and customise are gated behind store selection.
- **Shake Shack**: sticky header "Select a location" + green "Order Now" top-right, carousel with pause control and a white pill CTA (`shake-m-home.png`, `shake-m-order.png`). STOPPED: ordering is a third-party overlay, did not load.
- **Burger King UK**: web app shell with a 5-item bottom tab bar (Home, Order, Loyalty Code, Offers, Rewards) (`bk-m-home.png`). Menu stuck on a loading spinner (`bk-m-menu.png`); icons and images blocked. STOPPED at store locator/API.
- **Honest Burgers**: bottom sticky bar MENU / LOCATIONS / BOOK / SHOP (`honest-m-home.png`). Menu: horizontal sticky category tabs with fade+chevron scroll hint, accordion items with "H" and "*" tags, no photos on list (`honest-m-menu.png`). "Order click & collect" goes to vmos.io: unreachable.
- **Byron**: sticky bottom bar BOOK / CALL / ORDER (`byron-m-home.png`). Menu: sticky scrolling tabs (Burgers, Not burgers, Greens & dips...), big cut-out hero photo per burger, "new" tag, price shown as `15.5`, inline add-on "+1" (double smash) (`byron-m-menu2.png`). Order goes to Deliveroo: unreachable.
- **GBK**: Menu is a PDF on mobile, Delivery is a separate page; cookie banner covers 30 percent of the screen (`gbk-m-home.png`). Weakest mobile menu seen.
- **Burger & Lobster**: location-specific menu, price as "£12" plus "160 kcal" inline, "Show dish images" toggle, pill menu tabs (`bl-m-menu.png`). Basket exists ("Your Cart") but only for merch; ordering not reachable.
- **Not reachable**: mcdonalds.com, awwwards.com, behance.net, small independents. Third-party ordering hosts (vmos, Deliveroo, Five Guys store API) blocked, so customise screens, quantity steppers, basket and checkout could NOT be observed. Rules below on those are from design principles, not observation.

## Patterns
| Pattern | Who | Why it works |
|---|---|---|
| Persistent "Order" CTA in header and/or bottom bar | Five Guys, Shake Shack, Byron, Honest | One obvious next step from any page |
| Sticky bottom pill CTA on product page | Wendy's | Thumb zone, always visible while reading |
| Sticky horizontal category tabs + scroll hint | Honest, Byron, B&L | Fast jumping without long scrolling |
| Price + kcal inline on card | B&L, Wendy's (kcal) | Decision data without opening item |
| Inline add-on with delta ("+1") | Byron | Upsell visible at the point of choice |
| Short tagline above ingredient list | Byron | Scannable; ingredients secondary |
| Location gate before ordering | Five Guys, Wendy's, Shake Shack, BK | Needed for stock/price, but adds friction |
| Hand-off to third party | Byron, Honest | Cheap to build, breaks brand and basket continuity |
| Carousel with pause control | Shake Shack | Accessibility; still hides content |
| Cookie banner blocking content | GBK, Byron | Anti-pattern on mobile; keep it small |

Ethical persuasion seen: "New" tag, seasonal range, honest "limited time" copy, calories shown. Dark-ish: autoplaying carousels, banners covering the menu, "Rewards unavailable" warned only after clicking through.

## 12 rules for Er-Han (mobile-first)
1. **No gate before browsing.** Menu opens straight from home; there is one shop, so no location step. Primary CTA "View menu", sticky bottom bar: Menu / Basket (with count and total).
2. **Sticky category tabs** (horizontal, active underline, fade hint), max 8 labels; tap targets at least 44px high.
3. **Menu card**: 4:3 or 1:1 photo, name, one-line tagline, price in £ (en-GB, from pence), dietary tags (Halal is implicit; mark vegetarian, spicy), kcal only if sourced. One "Customise" button on burgers; "Add to basket" only on items with no choices (drinks, sauces).
4. **Whole card tappable**, button at least 44x44px, right side of card (thumb reach). Quick-add steppers for simple items.
5. **Customise screen = bottom sheet / full screen** with close button top, sticky footer "Add to basket · £x.xx". Photo/animation pinned on top (about 35 percent of height), options scroll below.
6. **Option groups**: radios for single-choice (size, meal drink, chilli level), checkboxes for extras. Required groups labelled "Required" and open first; preselect a sensible default except where a genuine choice is needed (Meal Deal drink, Chicken Shish chilli): then no default and inline error "Choose a drink" with scroll to the group, footer button disabled with reason.
7. **Show price deltas** on every option ("+£0.50"), running total in the footer updating live; no surprise charges.
8. **Meal upgrade** as a toggle at the top of the sheet ("Make it a meal +£x"), not a separate screen; one relevant upsell in the basket (drink or side), dismissible, never pre-ticked.
9. **Basket**: slide-up from the sticky bar; line items with options listed in plain English, edit and remove, quantity stepper, subtotal, "Collection only, no fees", estimated ready time. Persist in localStorage; survive reload.
10. **WhatsApp hand-off**: step "Your details" (first name, phone optional, collection time) then one button "Send order on WhatsApp". Pre-fill a readable message (items, options, total, name, time); show it in a preview first. Use a real `<a target="_blank">` link; after tapping show "Order sent? We will confirm on WhatsApp" with fallback "Copy order" button. State clearly: no payment online, pay at collection.
11. **Assembly animation never blocks ordering**: preload only the active product's layers, show static hero instantly, animate only on option change (200-400 ms, skippable), never block the Add button, honour `prefers-reduced-motion` (swap to static stack). Lazy-load below the fold; cap animation to the customise sheet.
12. **Trust and ethics**: British English only, GBP, opening hours and address in footer, allergen note and phone link, no countdown timers, no fake scarcity, no pre-ticked extras, cookie banner as compact bottom sheet.
