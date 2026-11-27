# Daylight: notes

**Idea.** "Your local since 2013." A light, editorial neighbourhood shop: paper ground, navy ink, ruled and numbered sections like a printed menu card, and food photographed on one warm studio sweep. Confident and friendly, not an app skin.

**Palette (contrast on paper #f7f1e5).** Paper #f7f1e5 ground · Paper deep #efe5d1 bands and wells · Card #fcf9f2 sheets · Ink navy #15233b text and rules, 14.0:1 · Ink soft #4b566c secondary text, 6.6:1 · Tomato #c2401f the only action colour, 4.6:1 (cream label on it 5.0:1) · Basil #2d6a45 confirm: added, open, WhatsApp, 6.2:1 with cream · Saffron #eaa634 small highlights only (dots, Popular).

**Type.** Fraunces (soft, optical-size serif) for names and headlines, italic tomato for the one emphasised phrase; Instrument Sans for everything else; tracked uppercase labels. Five sizes as tokens in `concept.css`.

**Layout.** Home: headline and order actions first, studio hero, then four numbered chapters (How ordering works, Meal deals, The menu as an editorial index, Visit us). Menu: sticky contents rail with search on desktop, sticky pill tabs on phones, four-column card grid. Builder: a large studio board beside a ruled choice column with a sticky order bar; on phones a sticky board, tabs and tiles under it, and a fixed order bar, so name, food, choices and button share one screen.

**Imagery.** Every card is composed live from cut-outs using the shared `product-profiles.js` layouts, so cards match the builder; meal deals are main + chips + drink. Drinks were keyed from the existing photos (`assets/drinks`). One CSS studio surface and contact shadow for all. The builder reuses the shared `scene.js` engine (drops, sauce pours) on the light board, plus a steam "ready" moment.

**Next.** Real photography of halloumi sandwich and chicken burger; per-burger hero variety; tune shish plate scale; user-test the closed-shop flow.
