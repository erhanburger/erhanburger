// Catalogue access and food recipes for THE TICKET concept.
// Prices, products and options all come from the shared catalogue; this file only
// decides how each product is drawn from existing cut-outs.
import {
  catalog, halfPounder, optionConflicts, formatPrice, getUnitPricePence,
  createDefaultSelections, findProduct,
} from '../../../catalog.js'

export { catalog, halfPounder, optionConflicts, formatPrice, getUnitPricePence, createDefaultSelections, findProduct }

const demoRoot = new URL('../../../', import.meta.url)
const own = new URL('../assets/', import.meta.url)
/** Resolve a catalogue image path (relative to charcoal-demo/). */
export const asset = path => new URL(path, demoRoot).href
const mine = path => new URL(path, own).href
const builder = name => asset('../burger-builder-demo/assets/' + name + '.webp')
const menuCut = name => asset('./assets/menu/' + name + '.webp')

// Layer library. w = width and step = rise after the layer, both as a share of
// the stack width (numbers follow the approved Charcoal scene). filter tints a
// drizzle for sauces that only exist as bottles.
const L = (src, w, step, extra = {}) => ({ src, w, step, ...extra })
const drizzle = (src, filter) => L(src, .64, .006, { sauce: true, filter })
export const layers = {
  bottom: L(mine('layers/bottom.webp'), .95, .141),
  beef: L(mine('layers/patty.webp'), .98, .118),
  chicken: L(menuCut('chicken'), .91, .17),
  veggie: L(menuCut('veggie'), .92, .147),
  'dog-bottom': L(menuCut('roll-bottom'), 1.08, .096),
  sausage: L(menuCut('sausage'), .99, .058),
  shish: L(menuCut('shish'), .9, .16),
  cheese: L(mine('layers/cheese.webp'), .97, .032),
  'extra-cheese': L(builder('cheese'), .955, .034),
  halloumi: L(asset('./assets/halloumi.webp'), .87, .068),
  egg: L(asset('./assets/egg.webp'), .89, .048),
  lettuce: L(mine('layers/lettuce.webp'), 1.05, .048),
  tomato: L(mine('layers/tomato.webp'), .91, .068),
  cucumber: L(builder('cucumber'), .91, .035),
  gherkin: L(builder('pickle'), .88, .033),
  onion: L(builder('onion'), .9, .036),
  'burger-sauce': drizzle(builder('burger-sauce')),
  ketchup: drizzle(builder('ketchup')),
  mayo: drizzle(builder('mayo')),
  'garlic-mayo': drizzle(builder('mayo'), 'sepia(.35) saturate(1.2)'),
  'chilli-sauce': drizzle(builder('ketchup'), 'saturate(1.5) brightness(.85) hue-rotate(8deg)'),
  'bbq-sauce': drizzle(builder('ketchup'), 'brightness(.42) sepia(.6) saturate(1.6)'),
  mustard: drizzle(builder('mayo'), 'sepia(1) saturate(6) hue-rotate(5deg) brightness(1.02)'),
  top: L(mine('layers/top.webp'), .98, 0, { lid: true }),
  'dog-top': L(menuCut('roll-top'), 1.08, 0, { lid: true }),
}
const stackOrder = ['bottom', 'dog-bottom', 'beef', 'chicken', 'veggie', 'sausage', 'shish', 'cheese',
  'extra-cheese', 'halloumi', 'egg', 'lettuce', 'tomato', 'cucumber', 'gherkin', 'onion',
  'burger-sauce', 'ketchup', 'mayo', 'garlic-mayo', 'chilli-sauce', 'bbq-sauce', 'mustard', 'top', 'dog-top']

// Drinks: cut-outs keyed from the existing photographs (see NOTES.md).
const keyedDrinks = new Set(['water', 'coca-cola-classic', 'coca-cola-zero', 'diet-coke', 'pepsi',
  'tango-orange', 'fanta-orange', 'mirinda-strawberry', 'ribena-strawberry', 'ribena-blackcurrant',
  'lucozade-orange', 'red-bull'])
export function drinkImage(id) {
  if (keyedDrinks.has(id)) return mine('drinks/' + id + '.webp')
  return asset('./assets/props/drink-placeholder.webp')
}
const drinkWidth = id => id === 'water' || id === 'lucozade-orange' || id === 'lucozade-original' ? .1 :
  id.startsWith('ribena') ? .15 : id === 'mirinda-strawberry' ? .16 : .17

// Tile images: one family per group (sauce bottles for every sauce).
const sauceBottle = id => asset('./assets/sauces/' + id + '.webp')
const tileOverrides = {
  'burger-sauce': sauceBottle('burger-sauce'), ketchup: sauceBottle('ketchup'), mayo: sauceBottle('mayo'),
  'chilli-sauce': sauceBottle('chilli-sauce'), 'garlic-mayo': sauceBottle('garlic-mayo'),
  'bbq-sauce': sauceBottle('bbq-sauce'), mustard: sauceBottle('mustard'),
  lettuce: mine('layers/lettuce.webp'), tomato: mine('layers/tomato.webp'),
  'included-beef': mine('layers/patty.webp'), cheese: mine('layers/cheese.webp'),
}
export function tileImage(option) {
  if (tileOverrides[option.id]) return tileOverrides[option.id]
  if (option.layerKeys?.some(key => key.startsWith('drink-'))) return drinkImage(option.id)
  return option.image ? asset(option.image) : null
}

const componentMap = { sandwich: ['dog-bottom', 'halloumi', 'dog-top'] }

/** Layer keys of the product as it comes, before any option. */
function baseKeys(product) {
  if (product.preview?.fixedLayerKeys) return ['bottom', 'beef', 'beef', 'cheese', 'top']
  return (product.components ?? []).flatMap(key => componentMap[key] ?? [key])
}

/**
 * Describe how a product with the given selections is drawn.
 * Returns { kind, fit:[widthShare, heightPerW], items:[...] } where each item is
 * either a stack { type:'stack', keys, x, y, scale, z } or a single cut-out
 * { type:'item', key, src, w, x, y, z }. x/y/w are shares of the stage unit W.
 */
export function recipe(product, selected) {
  const options = product.optionGroups.flatMap(group => group.options)
  const active = options.filter(option => selected.has(option.id))
  const added = active.flatMap(option => option.layerKeys ?? [])
  const removed = new Set(active.flatMap(option => option.removeLayerKeys ?? []))
  const base = baseKeys(product)
  const id = product.id
  const items = []

  const stackKeys = extra => {
    const keys = [...base.filter(key => layers[key] && !removed.has(key) && key !== 'chips' && key !== 'nugget'),
      ...extra.filter(key => layers[key] && !removed.has(key))]
    // keep duplicates (two patties) but stack in kitchen order
    return keys.map((key, index) => ({ key, index })).sort((a, b) =>
      stackOrder.indexOf(a.key) - stackOrder.indexOf(b.key) || a.index - b.index).map(({ key }) => key)
  }

  if (product.visual === 'meal') {
    const drinkKey = added.find(key => key.startsWith('drink-'))
    const drinkId = drinkKey?.slice(6)
    const main = base.includes('nugget') ? null : stackKeys(added.filter(key => !key.startsWith('drink-')))
    if (drinkId) items.push({ type: 'item', key: 'drink', src: drinkImage(drinkId), w: drinkWidth(drinkId) * 2.1, x: .44, y: .2, z: 1, tall: true })
    else items.push({ type: 'ghost', key: 'drink', src: asset('./assets/props/drink-placeholder.webp'), w: .36, x: .44, y: .2, z: 1 })
    if (main) items.push({ type: 'stack', key: 'main', keys: main, x: -.12, y: 0, scale: .8, z: 3 })
    else {
      const spots = [[-.34, .06, -10], [-.06, .04, 8], [-.2, .2, 4], [.06, .2, -12]]
      spots.forEach(([x, y, r], i) => items.push({ type: 'item', key: 'nugget-' + i, src: menuCut('nugget'), w: .34, x, y, z: 4 - (y > .1 ? 2 : 0), rotate: r }))
    }
    items.push({ type: 'item', key: 'chips', src: menuCut('chips'), w: .52, x: .3, y: -.04, z: 5 })
    return { kind: 'meal', fit: [1.6, 1.15], items, closing: main ? 'main' : null }
  }

  if (base.includes('shish')) {
    const withChips = base.includes('chips')
    const large = product.name.includes('Large')
    items.push({ type: 'item', key: 'plate', src: asset('./assets/props/plate.webp'), w: 1.7, x: 0, y: -.12, z: 0 })
    items.push({ type: 'stack', key: 'main', keys: stackKeys(added), x: withChips ? -.2 : 0, y: .02, scale: large ? .95 : .82, z: 3 })
    if (withChips) items.push({ type: 'item', key: 'chips', src: menuCut('chips'), w: .6, x: .38, y: 0, z: 2 })
    return { kind: 'plate', fit: [1.8, 1.05], items }
  }

  if (id === 'chips') {
    const large = selected.has('chips-large')
    items.push({ type: 'item', key: 'tray', src: asset('./assets/props/tray.webp'), w: 1.6, x: 0, y: -.12, z: 0 })
    items.push({ type: 'item', key: large ? 'chips-large' : 'chips-regular', src: menuCut('chips'), w: large ? 1.22 : .95, x: 0, y: .02, z: 2 })
    return { kind: 'tray', fit: [1.7, .95], items }
  }

  if (id === 'chicken-nuggets') {
    const nine = selected.has('nuggets-9')
    items.push({ type: 'item', key: 'tray', src: asset('./assets/props/tray.webp'), w: 1.6, x: 0, y: -.12, z: 0 })
    const spots = [[-.42, .16, -12], [-.08, .2, 9], [.28, .17, -5], [-.5, -.02, 14], [-.18, 0, -8], [.15, .01, 11],
      [.47, .02, 4], [.02, .3, -13], [-.3, .3, 7]]
    spots.slice(0, nine ? 9 : 6).forEach(([x, y, r], i) => items.push({ type: 'item', key: 'nugget-' + i, src: menuCut('nugget'), w: .42, x, y, z: 6 - Math.round(y * 10), rotate: r }))
    return { kind: 'tray', fit: [1.7, 1], items }
  }

  if (product.categoryId === 'drinks') {
    items.push({ type: 'item', key: 'drink', src: drinkImage(id), w: drinkWidth(id) * 3.3, x: 0, y: 0, z: 1, tall: true })
    return { kind: 'drink', fit: [1, 1.9], items }
  }

  if (!product.optionGroups.length || product.visual === 'photo' && !base.length) {
    items.push({ type: 'item', key: 'photo', src: asset(product.image), w: 1.05, x: 0, y: 0, z: 1 })
    return { kind: 'snack', fit: [1.15, .85], items }
  }

  const keys = stackKeys(added)
  const isRoll = keys.includes('dog-bottom')
  items.push({ type: 'stack', key: 'main', keys, x: 0, y: 0, scale: isRoll ? .92 : 1, z: 2 })
  return { kind: isRoll ? 'roll' : 'burger', fit: [1.1, isRoll ? .8 : 1.35], items, closing: 'main' }
}

export const categoryName = id => catalog.categories.find(category => category.id === id)?.name ?? 'Menu'
export const productsIn = id => catalog.products.filter(product => product.categoryId === id)
export const productUrl = product => './product.html?product=' + encodeURIComponent(product.id)
export const needsChoice = product => product.optionGroups.length > 0
export const shortName = name => name.replace(/^Deal (\d+) – /, '').replace(', Chips & Drink', ' meal')

/** Conflict map from the shared catalogue rules, limited to one product's options. */
export function conflictMap(product) {
  const ids = new Set(product.optionGroups.flatMap(group => group.options.map(option => option.id)))
  const map = new Map()
  for (const [a, b] of optionConflicts) {
    if (!ids.has(a) || !ids.has(b)) continue
    map.set(a, [...(map.get(a) ?? []), b])
    map.set(b, [...(map.get(b) ?? []), a])
  }
  return map
}
