// The approved Half Pounder layer set: the reference every product's scene is
// built from (see product-profiles.js). Width, stacking step and offset are
// fractions of the rig width. Shared by the builder scene (scene.js) and the
// still product pictures on cards (art.js), so both always agree.
import { sauceProfiles } from './sauce-motion.js'

const scene = './assets/scene/'
const assets = '../burger-builder-demo/assets/'
const sauceLayers = Object.entries(sauceProfiles).map(([key, sauce], index) => ({
  key, width: .63, step: .005, offset: (index - 3) * .008, sauce,
}))

export const burgerProfile = {
  id: 'half-pounder',
  closingLayerKey: 'top',
  name: 'Half Pounder with Cheese',
  layers: [
    { key: 'bottom', asset: scene + 'bottom.webp', width: .95, step: .141, offset: -.013, required: true },
    { key: 'patty-a', asset: scene + 'patty.webp', width: .98, step: .126, offset: .007, required: true },
    { key: 'patty-b', asset: scene + 'patty.webp', width: .96, step: .108, offset: -.014 },
    { key: 'cheese', asset: scene + 'cheese.webp', width: .97, step: .032, offset: .004 },
    { key: 'extra-cheese', embeddedKey: 'cheese', asset: scene + 'cheese.webp', width: .955, step: .034, offset: -.012 },
    { key: 'halloumi', asset: './assets/halloumi.webp', width: .87, step: .068, offset: -.011 },
    { key: 'egg', asset: './assets/egg.webp', width: .89, step: .048, offset: .012 },
    { key: 'lettuce', asset: scene + 'lettuce.webp', width: 1.05, step: .048, offset: -.002 },
    { key: 'tomato', asset: scene + 'tomato.webp', width: .91, step: .068, offset: .017 },
    { key: 'cucumber', asset: assets + 'cucumber.webp', width: .91, step: .035, offset: -.012 },
    { key: 'gherkin', asset: assets + 'pickle.webp', width: .88, step: .033, offset: .014 },
    { key: 'onion', asset: assets + 'onion.webp', width: .90, step: .036, offset: .018 },
    ...sauceLayers,
    { key: 'top', asset: scene + 'top.webp', width: .98, step: 0, offset: .003, required: true },
  ],
}
