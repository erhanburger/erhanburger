// Box scenes: food served in an open takeaway box rather than stacked like a
// burger. A recipe says what goes in the box and how each menu choice changes
// it; box-scene.js turns a recipe plus the sprite library's manifest into a
// deterministic layout, animates it and draws card stills from the same plan.
//
// To give another product a box scene: add `box: { recipe: '<id>', ... }` to
// its product data and a recipe builder here. Groups refer to sprite arrays in
// the library manifest (chicken, onion, pepperRed, ...); salad and extras can
// come from the manifest or fall back to the shared cut-outs listed below.
import { sauceProfiles } from './sauce-motion.js'

const cutouts = '../burger-builder-demo/assets/'

// Shared cut-outs used when a library has no sprites of its own for an item.
// Widths are shares of the box width.
const saladFallback = {
  lettuce: { src: cutouts + 'lettuce.webp', w: .34 },
  tomato: { src: cutouts + 'tomato.webp', w: .29 },
  cucumber: { src: cutouts + 'cucumber.webp', w: .28 },
  onion: { src: cutouts + 'onion.webp', w: .27 },
  gherkin: { src: cutouts + 'pickle.webp', w: .25 },
}
const extraFallback = {
  'extra-cheese': { src: './assets/scene/cheese.webp', w: .2 },
  halloumi: { src: './assets/halloumi.webp', w: .25 },
  egg: { src: './assets/egg.webp', w: .23 },
}

// How each material falls and lands: g scales gravity (leaves drift down),
// bounce and squash are in box widths and fractions, settle in ms.
export const boxMaterials = {
  chips: { g: 1, bounce: .004, squash: .05, settle: 170, shadow: .38, spin: 30 },
  chicken: { g: 1.05, bounce: .006, squash: .07, settle: 190, shadow: .5, spin: 22 },
  veg: { g: .8, bounce: .011, squash: .04, settle: 240, shadow: .34, spin: 40 },
  leaf: { g: .38, bounce: .006, squash: .05, settle: 300, shadow: .3, spin: 26, flutter: .035 },
  slice: { g: .7, bounce: .008, squash: .05, settle: 230, shadow: .34, spin: 18, flutter: .012 },
  cheese: { g: .55, bounce: .002, squash: .08, settle: 260, shadow: .25, spin: 12, flutter: .015 },
  bread: { g: .9, bounce: .009, squash: .04, settle: 260, shadow: .55, spin: 8 },
}

const saladMaterials = { lettuce: 'leaf', tomato: 'slice', cucumber: 'slice', onion: 'slice', gherkin: 'slice' }

// Chicken shish in an HP10 box (docs/design/SHISH_SPEC.md). Medium and Large
// use the same sprites, piece size and camera; Large has more pieces spread
// over more of the box and piled higher.
function chickenShish({ portion = 'medium', chips = false } = {}) {
  const large = portion === 'large'
  return {
    id: 'chicken-shish-' + portion + (chips ? '-chips' : ''),
    library: './assets/library/shish/',
    seed: 1307,
    name: 'shish',
    chips: chips ? { count: 38 } : null,
    heap: { coverage: large ? 1 : .64, height: large ? .085 : .05 },
    groups: [
      { key: 'chicken', sprites: 'chicken', count: large ? 25 : 15, material: 'chicken' },
      { key: 'onion', sprites: 'onion', count: large ? 9 : 6, material: 'veg' },
      { key: 'pepperRed', sprites: 'pepperRed', count: large ? 6 : 4, material: 'veg' },
      { key: 'pepperGreen', sprites: 'pepperGreen', count: large ? 5 : 3, material: 'veg' },
    ],
    // Salad along the box side, keyed by the options' layerKeys.
    salad: Object.fromEntries(Object.entries(saladFallback).map(([key, fallback]) =>
      [key, { fallback, count: key === 'lettuce' ? 2 : 1, material: saladMaterials[key] }])),
    extras: Object.fromEntries(Object.entries(extraFallback).map(([key, fallback]) =>
      [key, { fallback, material: key === 'extra-cheese' ? 'cheese' : 'slice' }])),
    pitta: true,
    // Choices that take food out of the box (option id -> groups removed).
    removals: {
      'no-cooked-onion': ['onion'],
      'no-pepper': ['pepperRed', 'pepperGreen'],
      'no-veggie': ['onion', 'pepperRed', 'pepperGreen'],
    },
    // Chilli preference changes how much chilli sauce is squeezed on.
    sauceAmounts: { 'little-chilli': 'little', 'extra-chilli': 'extra' },
  }
}

const recipes = { 'chicken-shish': chickenShish }

export function boxRecipe(product) {
  const make = recipes[product.box?.recipe]
  return make ? make(product.box) : null
}

// What the box shows for a set of chosen option ids: the visible groups
// (chips, chicken, onion, salad:tomato, extra:egg, pitta, ...) and the sauces
// to squeeze on, in the order they were chosen.
export function boxTargets(recipe, options, selectedIds) {
  const chosen = options.filter(option => selectedIds.has(option.id))
  const groups = new Set(['box'])
  if (recipe.chips) groups.add('chips')
  for (const group of recipe.groups) groups.add(group.key)
  if (recipe.pitta) groups.add('pitta')
  for (const option of chosen) {
    for (const key of option.layerKeys ?? []) {
      if (recipe.salad[key]) groups.add('salad:' + key)
      if (recipe.extras[key]) groups.add('extra:' + key)
    }
  }
  for (const option of chosen) for (const key of recipe.removals[option.id] ?? []) groups.delete(key)
  const ordered = [...selectedIds].map(id => chosen.find(option => option.id === id)).filter(Boolean)
  // Each sauce choice has its own lane across the chicken, so a line never
  // moves when other sauces come and go.
  const saucy = options.filter(option => (option.layerKeys ?? []).some(layerKey => sauceProfiles[layerKey]))
  const sauces = []
  for (const option of ordered) {
    const key = (option.layerKeys ?? []).find(layerKey => sauceProfiles[layerKey])
    if (key) sauces.push({ id: option.id, sauceKey: key, lane: saucy.indexOf(option), amount: recipe.sauceAmounts[option.id] ?? 'normal' })
  }
  return { groups, sauces }
}

// Choices whose effect is visible in the box, so the stage does not also list them.
export function boxVisualOptionIds(recipe) {
  return new Set([...Object.keys(recipe.removals), 'salad-none'])
}
