# External agency audit of the current site (26 November 2026)

Independent audit agent, not involved in building the site. Desktop 1440×900 and iPhone 13, also inside a simulated light preview wrapper. Judged against `PRINCIPLES.md`, the research files and professional standards.

## Verdict

A sound skeleton (one dark ground, a serif/sans pairing, an orange action colour, one excellent hero photo) but a tasteful dark template, not a brand. The menu is a patchwork of stock, cut-out and placeholder assets, and the builder is a form beside a picture rather than the one-screen reaction of the client's reference. Imagery is the biggest failure.

## Top problems (severity order)

1. Menu looks unfinished: empty image tiles for shish, the halloumi sandwich and several drinks in full-page captures (partly lazy-loading that never triggers, partly missing art); never ship an empty tile.
2. Conflicting image surfaces: white rectangles (deals, chips, nuggets), black boxes (water), checkerboards (chicken burger, Pepsi) and glossy cut-outs side by side.
3. Drink builder pages show a checkerboard can in a white box on the stone slab.
4. Different products share one photo (all beef burgers, veggie burgers, hot dog variants); customers cannot tell a Quarter from a Half.
5. Meal deal art is low-resolution stock combo photos with white backgrounds and third-party drink branding.
6. Menu cards on desktop: small cards, 10–11 px type, ragged half-empty rows, inconsistent actions, no descriptions.
7. Builder misses the reference: on mobile the order bar covers the choice list, preferences fall below the fold, choices are a form rather than "tap = food changes".
8. Choice tiles have 11 px labels and a tiny "+" as the only affordance; subtle selected state; sizes, chilli and drink tiles lack imagery.
9. Builder preview is generic for meal deals (the chosen drink is never shown) and has large dead space above the food.
10. Home page is a standard template: no story, no mark, "since 2013" hidden in the footer.
11. Type hierarchy inconsistent: ten sizes, serif and sans headings mixed, the orange italic accent used as a mannerism.
12. Small low-contrast secondary text (captions, "Included", status lines, small orange tags on brown).
13. Home and ordering pages feel like different sites: different headers, widths and density; no sticky category navigation on the menu.
14. Closed-state and basket affordances weak: no mobile bottom bar, no basket empty state, no visible collection time before checkout.
15. Polish: repeated bland headings, empty right panel on simple items, "Replay assembly" competing with the product, hidden choices behind "More…" links, preferences styled like food.

## Worth keeping

The hero Half Pounder photograph and the slab scene; plate and tray scenes; the dark warm ground with one action colour; the honest British copy; the facts footer, three-step explanation and WhatsApp hand-off; pence pricing and the data-driven catalogue; the desktop side-by-side builder.

## Recommendation

Evolve the architecture and data model; redo the visual system and components: one image system with no white, black or checkerboard assets and no empty tiles; one card component with even grids; a builder that fits a phone screen with tap-to-drop and clear selected states; a distinct identity and a five-size type scale; contrast and touch-target fixes.
