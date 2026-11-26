# Er-Han Burger design principles

Permanent decisions from the design research phase (26 November 2026). Evidence is in `docs/design/research/`. Every designer and agent works from this file; change it only with a recorded reason.

## What we are making

An independent, halal, grilled-to-order burger shop's own ordering site: the customer builds their food, watches it come together, fills a basket and sends the order on WhatsApp for collection. It must feel like a confident independent brand with a point of view, not a chain promotion page and not a template.

## Verified brand facts (the only claims the site may make)

Er-Han Burger · fresh, grilled, halal · since 2013 · Brent South Shopping Park, London · collection only · order on WhatsApp or call 07576 113811 · Mon–Sat 11am–8pm, Sun 11am–6pm. Anything else (charcoal, family-run, sourcing, awards) needs the owner's confirmation first.

## Principles

1. **One brand everywhere.** Home, menu, product builder, basket and confirmation share one ground colour, one type system, one button style, one card style. The page body always sets its own background (preview hosts wrap pages in a light body).
2. **Few colours, each with one job.** A ground, a text colour, one action colour, one confirm colour, at most one supporting accent. Text contrast at least 4.5:1, large text 3:1.
3. **Two typefaces.** One characterful display face for names and headlines, one quiet text face for everything else, small tracked uppercase for labels. Four or five sizes only.
4. **Food is the hero, on one surface.** Every product image sits on the same ground, angle, scale rules and shadow. No white, black or checkerboard boxes. Meal deals are composed from cut-outs, not stock combo photos (see `research/imagery-motion.md`).
5. **The builder fits one phone screen.** Product name, product preview, choices and the order button are visible together on a phone. Choices are tiles with the real ingredient image; selected state is unmistakable. On desktop, preview and choices sit side by side and use the width.
6. **Every tap changes the food.** Choosing an ingredient drops it on the stack immediately; price changes show the delta. The build is a reward, never a wait: ordering is possible at any moment and the animation is skippable.
7. **A ready moment.** Adding to the basket finishes the food (top bun, steam or plating), confirms in the button, and turns the button into the next step.
8. **Ordering is one tap away everywhere.** A persistent basket entry; on mobile a fixed bottom bar for Menu and Basket; a sticky order bar on product screens; the open/closed state and collection time are visible before checkout.
9. **Honest, specific British voice.** Short sentences, no hype, no invented claims. British English and £ only.
10. **Built for real photography later.** Image slots, ratios and layer specs are fixed now so new photography drops in without redesign.

## Lessons kept from research

- Independents win on point of view; chains on convenience. We need both: a brand with a voice and a checkout as fast as a chain's.
- Sticky category tabs with search are the best menu navigation on a phone.
- Menus barely animate; motion is for the builder and for confirming state (150–400 ms).
- Third-party hand-offs break trust; our WhatsApp hand-off must show the message, keep the basket until the customer confirms, and say what happens next.
- Heavy single-asset heroes and overlays fail; design the fallback first.
- The user's reference (`research/reference-carte.md`) defines the builder experience they want; we learn the interaction, not the look.
