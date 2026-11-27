# THE TICKET — Er-Han Burger concept

**Idea.** "Order's in. Grill's lit." The kitchen order ticket is the brand: stamps, perforations, mono print, a ticket rail. The basket *is* the ticket, and the ticket prints the exact WhatsApp message (same format as `basket-ui.js`), with quantity controls between the lines. What you read is what is sent.

**Palette (one job each).** Paper `#F2ECDF` ground · Slip `#FBF8F1` ticket surface · Kraft `#E8E0CF` food surface · Ink `#151412` text and bars (15.6:1 on paper) · Ink-2 `#5E584E` secondary (6.0:1) · Fire `#C21F17` actions and one headline word (5.1:1 on paper; white on fire 6.0:1) · Go `#10794A` WhatsApp and success only (white on go 4.6:1).

**Type.** Archivo at 62% width, weight 900, uppercase for display; Archivo normal width for text; IBM Plex Mono for labels, prices and the ticket. Five sizes.

**Layout.** Phone is an app: fixed bottom bar (Menu, Build, Basket with live total), sticky category chips, and a one-screen builder (name, price, food, round tiles in two rows under group tabs, order button) on 390×664. Desktop: menu grid plus a live ticket column; builder with sticky food stage beside all choice groups.

**Imagery.** Every product is composed in code from the same cut-outs on one kraft surface with a CSS contact shadow: burgers stacked layer by layer (approved Half Pounder layers extracted from `product.html`), meals as main + chips + drink, shish on the plate, chips and nuggets on the tray. Drinks are cut-outs keyed from the existing photos (`assets/drinks/`); un-chosen meal drinks show a neutral bottle. The shared `assets/products/` set arrived mid-build; it could replace thumbnails where a single photo reads better.

**Motion.** Layers drop with a squash (300 ms); the top bun hovers while you build and drops on Add, with steam; button goes green "On your ticket", then "View basket". Reduced motion removes all of it.

**Next.** Tune per-layer offsets for chicken/veggie/hot-dog stacks, real sauce drizzles for bottle-only sauces, a print-in animation for new ticket lines, and test with customers.
