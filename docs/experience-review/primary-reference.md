# Primary reference verification

Target: https://eat.brainy.ink/

## What was verified

- Chromium desktop (1440 × 900) and Pixel 7 emulation attempted ordinary navigation at the exact requested URL. Both failed during connection with `net::ERR_TUNNEL_CONNECTION_FAILED` before receiving HTML.
- The HTTPS client received a 403 on the local Cloud CONNECT gateway. Cloud Environment reports restricted network with the package manager preset, no custom hosts and SSH-only portals.
- The web reader could not access the URL. An exact-domain search produced no results describing the application. Search results for the parent Brainy domain identify Brainy and its studio, but do not identify how the requested experience works.

## What remains unverified

Whether the site is reachable from a normal user connection, and its rendering pipeline (3D, pre-rendered, 2.5D or hybrid), animation details, asset types, performance, mobile behaviour and product customisation. The gateway response does not establish that the site itself is offline.

If managed access becomes available, inspect the site on desktop and touch, identify render surfaces and ordinarily loaded asset MIME types, run one customisation flow, observe reduced motion, and use Resource Timing and browser performance data to report transfer size and rendering signals. Browser WebGL support alone is not evidence that the site uses it.

## Published technical alternatives

These are creator case studies read through the web reader. They establish the authors' stated implementations, with no independent measurement of the live sites.

- [Piton, 3 Monkeys Bozüyük](https://www.pitonstudios.com/en/projects/3monkeys-bozuyuk) documents a practical hybrid. Six photographic layers assemble with CSS perspective, while only the ambient smoke uses WebGL. The authors cap smoke at 30 FPS, pause it off-screen or in hidden tabs, and use reduced-motion and unavailable-WebGL guards. Their mobile scene uses a separate vertical composition. This supports retaining photographic assets, conditionally adding depth, and keeping ordering usable independently of visual effects.
- [Melt Lab](https://www.innovatesoftwares.com/case-studies/melt-lab-3d-restaurant-experience) gives a true Three.js/WebGL comparison through a staged burger counter and cinematic loading. The case study verifies a declared technical stack, not a fast purchase flow or measured performance. Treat the immersive introduction as an optional route if tested rather than making all repeat customers wait through it.
- [Poké Poké](https://julianbuilds.site/work/poke-poke) documents an operating restaurant with a responsive visual ingredient-by-ingredient configurator. Visual confirmation updates on selection, with pricing and ordering controls close to the decision point. This supports an explicit, accessible primary menu action and a scene connected to the actual ordering state.
