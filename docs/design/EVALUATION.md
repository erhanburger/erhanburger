# Concept round 1: independent evaluation (27 November 2026)

Three panels that did not design the concepts: design (creative director + graphic designer), customers + UX (the same full order on phone and laptop in each concept), technical (frontend, motion, accessibility). Gallery: https://claude.ai/artifact/7BHN2KSjYvYA3hVAyoCSyU

## Scores (1–10)

| Criterion | Coal | Daylight | Ticket |
|---|---|---|---|
| Professionalism | 8 | 8 | 7 |
| Brand identity | 7 | 6 | 9 |
| Visual appeal | 9 | 7 | 7 |
| Design coherence | 8 | 8 | 8 |
| Originality | 6 | 5 | 9 |
| Readability (design / customers) | 8 / 7 | 8 / 8 | 7 / 8 |
| Craft | 8 | 6 | 7 |
| Mobile ease of use | 6 | 5 | 8 |
| Ordering speed and confidence | 7 | 6 | 7 |
| Building enjoyment | 9 | 8 | 7 |
| Trust | 7 | 6 | 9 |
| Fit with the animation system | 3 | 8 | 3 |
| Performance | 8 | 6 | 8 |
| Accessibility | 8 | 7 | 7 |
| Future extensibility | 6 | 8 | 4 |
| Code quality | 7 | 7 | 6 |
| Functional correctness | 8 | 8 | 8 |

All three: 44/44 prices correct, required choices enforced, identical and correct WhatsApp message, no console errors, no horizontal overflow, British English and £ only.

## Panel verdicts

- **Design:** Ticket first (the only ownable idea: the basket is the kitchen ticket that becomes the WhatsApp message), Coal second (best food stage and craft, but a generic dark identity), Daylight third (template-like, title collides with the burger). "Partly a matter of taste, but not a tie."
- **Customers + UX:** Ticket best on phones (one-screen builder, clearest selection, most trusted basket), Coal second (best building feel), Daylight third (broken group tabs). "A close call." Ticket has a serious laptop bug (sauce and preference tabs hidden at 900 px and wider).
- **Technical:** Daylight is the best foundation because it alone reuses the shared animation engine (plates, trays, open hot dog, sauce pours) and basket. Coal and Ticket redraw food with their own simplified composers; Ticket also duplicates the basket and WhatsApp code. Whatever wins visually should be built as a theme over `scene.js`, `product-profiles.js` and `basket-ui.js`.

## Best ideas to keep

- Ticket: basket as a printed kitchen ticket ("printed exactly as it will be sent"), phone bottom bar (Menu, Build, Basket with total), one-screen builder with a five-across tile grid, "KETCHUP · ON" status label, strong required-choice error, the "Order's in. Grill's lit." idea.
- Coal: the food stage on a dark plate with depth, the exploded-burger hero with tracked labels, halal stamp, quiet cards, one ember action, "Added · Make another", double-rule dividers, the clearest selected ring.
- Daylight: numbered menu contents rail with counts, the 2013 seal, cleaner card layout (price and action on their own line), group tabs, green WhatsApp button.

## Must fix in any direction

Product pages need Menu/back navigation; group tabs must work at every width; 44 px targets for chips, tabs and steppers; closed notice clipped in the phone basket; second add without reload; one shared asset set; self-hosted fonts; lazy-loaded menu images.

## Decision (27 November 2026)

The client left the choice to the agency. Following the panels: **Ticket is the design direction** (first with the design and customer panels; most ownable idea), built as a theme over the shared engine (`scene.js`, `product-profiles.js`, `basket-ui.js`, `catalog.js`) as the technical panel requires, and absorbing:

- from Coal: the food shown on a dark "kitchen pass" stage with depth, the clearest selected ring, "Added · Make another", quiet cards;
- from Daylight: the numbered menu contents rail on desktop, cleaner card layout with price and action on their own line, working group tabs, green WhatsApp action;
- every item in "Must fix in any direction".

The production pages in `charcoal-demo/` are rebuilt in this direction; the concept prototypes stay in `charcoal-demo/concepts/` for reference.
