// Turns a catalogue product and its chosen options into layers on the board.
// Every unit is a fraction of the rig width W: x is the horizontal offset of a
// layer's centre, y the height of its base above the board, w its width.
// The same composer draws the builder, the menu thumbnails and the home hero,
// so a new product needs data only, never new layout code.

const root = new URL('../../', import.meta.url)
export const asset = path => new URL(path, root).href

const BB = '../burger-builder-demo/assets/'
const MENU = './assets/menu/'
const art = (src, ar) => ({ src, ar })
const ART = {
  bun: art(BB + 'bun.webp', 218 / 448),
  top: art(BB + 'top.webp', 232 / 453),
  beef: art(BB + 'beef.webp', 225 / 453),
  chicken: art(MENU + 'chicken.webp', 281 / 413),
  veggie: art(MENU + 'veggie.webp', 277 / 406),
  cheese: art(BB + 'cheese.webp', 181 / 453),
  halloumi: art('./assets/halloumi.webp', 224 / 560),
  egg: art('./assets/egg.webp', 279 / 560),
  lettuce: art(BB + 'lettuce.webp', 184 / 456),
  tomato: art(BB + 'tomato.webp', 145 / 450),
  cucumber: art(BB + 'cucumber.webp', 127 / 450),
  pickle: art(BB + 'pickle.webp', 151 / 438),
  onion: art(BB + 'onion.webp', 152 / 459),
  'burger-sauce': art(BB + 'burger-sauce.webp', 166 / 682),
  ketchup: art(BB + 'ketchup.webp', 163 / 681),
  mayo: art(BB + 'mayo.webp', 171 / 675),
  rollBottom: art(MENU + 'roll-bottom.webp', 139 / 482),
  rollTop: art(MENU + 'roll-top.webp', 149 / 484),
  sausage: art(MENU + 'sausage.webp', 102 / 468),
  chips: art(MENU + 'chips.webp', 242 / 466),
  nugget: art(MENU + 'nugget.webp', 267 / 359),
  shish: art(MENU + 'shish.webp', 229 / 475),
  plate: art('./assets/props/plate.webp', 520 / 1600),
  tray: art('./assets/props/tray.webp', 560 / 1500),
  bottle: art('./assets/props/drink-placeholder.webp', 900 / 600),
}

// Three sauce ribbons exist as cut-outs; the other sauces are tinted from them.
const SAUCES = {
  'burger-sauce': { art: 'burger-sauce' },
  ketchup: { art: 'ketchup' },
  mayo: { art: 'mayo' },
  'chilli-sauce': { art: 'ketchup', filter: 'saturate(1.25) brightness(.78) hue-rotate(-6deg)' },
  'garlic-mayo': { art: 'mayo', filter: 'sepia(.35) brightness(.96)' },
  'bbq-sauce': { art: 'ketchup', filter: 'sepia(1) saturate(1.8) brightness(.42) hue-rotate(-14deg)' },
  mustard: { art: 'mayo', filter: 'sepia(1) saturate(5) hue-rotate(4deg) brightness(.97)' },
}

// Stacking order, width and thickness of each burger layer.
const STACK = [
  ['bottom', 'bun', .95, .141], ['dog-bottom', 'rollBottom', 1.02, .096],
  ['beef', 'beef', .98, .125], ['chicken', 'chicken', .91, .17], ['veggie', 'veggie', .92, .147],
  ['sausage', 'sausage', .97, .058],
  ['cheese', 'cheese', .97, .032], ['extra-cheese', 'cheese', .955, .034],
  ['halloumi', 'halloumi', .87, .068], ['egg', 'egg', .89, .048],
  ['lettuce', 'lettuce', 1.05, .048], ['tomato', 'tomato', .91, .068],
  ['cucumber', 'cucumber', .91, .035], ['gherkin', 'pickle', .88, .033], ['onion', 'onion', .90, .036],
  ...Object.keys(SAUCES).map(key => [key, 'sauce', .63, .006]),
  ['top', 'top', .98, 0], ['dog-top', 'rollTop', 1.02, 0],
]
const RANK = new Map(STACK.map(([key], index) => [key, index]))
const SPEC = new Map(STACK.map(row => [row[0], row]))
const LIDS = new Set(['top', 'dog-top'])
const SALAD = ['lettuce', 'tomato', 'cucumber', 'onion', 'gherkin']
const nuggetSpots = [[-.26, .19, -12], [0, .205, 9], [.26, .19, -5], [-.33, .045, 14], [-.07, .03, -8],
  [.2, .04, 11], [-.13, .27, 4], [.14, .285, -13], [.4, .11, 7]]

const layer = (id, artKey, w, x, y, extra = {}) => ({ id, src: ART[artKey].src, ar: ART[artKey].ar, w, x, y, ...extra })

function sauceLayer(key, w, x, y, extra = {}) {
  const sauce = SAUCES[key]
  if (!sauce) return null
  return layer(key, sauce.art, w, x, y, { filter: sauce.filter, kind: 'sauce', ...extra })
}

// Layer keys asked for by the chosen options, minus those a preference removes.
function optionKeys(product, selected) {
  const add = []
  const remove = new Set()
  for (const group of product.optionGroups) {
    for (const option of group.options) {
      if (!selected.has(option.id)) continue
      for (const key of option.layerKeys ?? []) add.push(key)
      for (const key of option.removeLayerKeys ?? []) remove.add(key)
    }
  }
  return { add, remove }
}

function baseKeys(product) {
  if (product.preview?.fixedLayerKeys) {
    return product.preview.fixedLayerKeys.map(key => key.startsWith('patty') ? 'beef' : key)
  }
  if (product.components.includes('sandwich')) return ['dog-bottom', 'halloumi', 'dog-top']
  return product.components.filter(key => key !== 'chips' && key !== 'drink')
}

// A burger, hot dog or sandwich built bottom-up. Returns layers and the lid.
function stack(keys, { scale = 1, x = 0, z = 10, narrow = false } = {}) {
  const counts = new Map()
  const ordered = keys.filter(key => SPEC.has(key)).sort((a, b) => RANK.get(a) - RANK.get(b))
  const layers = []
  let y = 0
  let lid = null
  for (const key of ordered) {
    const [, artKey, width, step] = SPEC.get(key)
    const n = counts.get(key) ?? 0
    counts.set(key, n + 1)
    const id = n ? key + '-' + n : key
    // Fillings on a long roll are narrower and thinner than on a round bun.
    const filling = narrow && !['dog-bottom', 'dog-top', 'sausage', 'halloumi'].includes(key)
    const w = (filling ? Math.min(width * .8, .8) : width) * scale
    const jitter = ((n + RANK.get(key)) % 3 - 1) * .008 * scale
    const item = artKey === 'sauce'
      ? sauceLayer(key, w, x + jitter, y + .015 * scale, { z: z + layers.length })
      : layer(id, artKey, w, x + jitter, y, { z: z + layers.length })
    if (LIDS.has(key)) { item.kind = 'lid'; lid = item.id }
    layers.push(item)
    y += step * (filling ? .6 : 1) * scale
  }
  return { layers, lid, top: y }
}

// Drinks use the normalised cut-outs in assets/products/: 800 px squares with a
// shared baseline 14% above the bottom edge, so one scale fits every can.
const DRINKS = {
  '../IMG_0397.jpeg': 'drink-water', '../IMG_0365.webp': 'drink-water', '../IMG_0358.jpeg': 'drink-coke-classic',
  '../IMG_0359.webp': 'drink-coke-zero', '../IMG_0360.png': 'drink-diet-coke', '../IMG_0357.png': 'drink-pepsi',
  '../IMG_0361.jpeg': 'drink-tango', '../IMG_0362.jpeg': 'drink-fanta', '../IMG_0363.png': 'drink-mirinda',
  '../IMG_0368.webp': 'drink-ribena-strawberry', '../IMG_0369.jpeg': 'drink-ribena-blackcurrant',
  '../IMG_0366.jpeg': 'drink-lucozade', '../IMG_0364.png': 'drink-red-bull',
}
// h is the height of a can; the square art is drawn so its baseline sits on y.
function drinkArt(id, image, h, x, y, z) {
  const file = DRINKS[image]
  if (!file) return { id, src: image, ar: 1.5, w: h / 1.5, x, y, z }
  const size = h / .6
  return { id, src: './assets/products/' + file + '.webp', ar: 1, w: size, x, y: y - size * .14, z, crop: .14 }
}

// Image for an option tile: sauces show their bottle, drinks their cut-out.
export function tileImage(option) {
  if (DRINKS[option.image]) return { src: asset('./assets/products/' + DRINKS[option.image] + '.webp'), kind: 'drink' }
  if (SAUCES[option.id]) return { src: asset('./assets/sauces/' + option.id + '.webp'), kind: 'bottle' }
  return option.image ? { src: asset(option.image) } : null
}

function drinkLayer(product, selected, x, y, h, z) {
  const drink = product.optionGroups.flatMap(group => group.options)
    .find(option => selected.has(option.id) && option.layerKeys?.some(key => key.startsWith('drink-')))
  if (!drink) return { id: 'drink-ghost', kind: 'ghost', src: ART.bottle.src, ar: ART.bottle.ar, w: h / ART.bottle.ar, x, y, z }
  return drinkArt('drink-' + drink.id, drink.image, h, x, y, z)
}

export function compose(product, selected = new Set()) {
  const { add, remove } = optionKeys(product, selected)
  const keep = key => !remove.has(key)
  const sauces = add.filter(key => SAUCES[key])
  const visual = product.visual ?? 'burger'
  const layers = []
  let lid = null

  if (visual === 'burger' || visual === 'hot-dog' || product.components?.includes('sandwich') || product.preview) {
    // Base layers keep repeats (two patties); options add each layer once.
    const base = baseKeys(product).filter(keep)
    const keys = [...base, ...[...new Set(add)].filter(key => keep(key) && !base.includes(key))]
    const built = stack(keys, { narrow: keys.includes('dog-bottom') })
    return { layers: built.layers, lid: built.lid, kind: 'stack' }
  }

  if (visual === 'meal') {
    const main = baseKeys(product)
    if (main.includes('nugget')) {
      ;[[-.24, .02, -10], [.02, .03, 8], [-.12, .12, 3], [.14, .11, -14], [-.32, .1, 12]].forEach(([nx, ny, r], i) =>
        layers.push(layer('nugget-' + i, 'nugget', .28, nx + .02, ny, { rot: r, z: 20 + i })))
      sauces.forEach((key, i) => layers.push(sauceLayer(key, .38, -.06, .2 + i * .01, { z: 40 + i })))
    } else {
      const base = main.filter(keep)
      const keys = [...base, ...[...new Set(add)].filter(key => keep(key) && !key.startsWith('drink-') && !base.includes(key))]
      const built = stack(keys, { scale: .64, x: -.02, z: 20, narrow: keys.includes('dog-bottom') })
      layers.push(...built.layers)
      lid = built.lid
    }
    layers.push(layer('chips', 'chips', .46, -.36, -.02, { z: 60 }))
    layers.push(drinkLayer(product, selected, .37, .1, .5, 5))
    return { layers: layers.filter(Boolean), lid, kind: 'meal' }
  }

  if (product.categoryId === 'shish') {
    const withChips = product.components.includes('chips')
    const large = product.name.includes('Large')
    layers.push(layer('plate', 'plate', 1.3, 0, -.05, { z: 1 }))
    const salad = { lettuce: [-.27, .095, .5], onion: [-.36, .13, .3], tomato: [-.22, .115, .33], cucumber: [-.31, .085, .3] }
    Object.entries(salad).forEach(([key, [sx, sy, sw]], i) =>
      layers.push(layer(key, SPEC.get(key)[1], sw, sx, sy, { z: 10 + i })))
    for (const key of add) {
      if (key === 'gherkin') layers.push(layer('gherkin', 'pickle', .24, -.15, .1, { z: 15 }))
      if (key === 'extra-cheese' || key === 'halloumi' || key === 'egg') {
        layers.push(layer(key, SPEC.get(key)[1], .3, -.05, .14, { z: 16 }))
      }
    }
    layers.push(layer('shish', 'shish', large ? .62 : .56, withChips ? .08 : .2, .07, { z: 20 }))
    if (withChips) layers.push(layer('chips', 'chips', .4, .4, .095, { z: 25 }))
    ;[...new Set(sauces)].forEach((key, i) => layers.push(sauceLayer(key, .46, (withChips ? .05 : .2) + i * .02, .16 + i * .012, { z: 30 + i })))
    return { layers: layers.filter(Boolean), lid: null, kind: 'plate' }
  }

  if (product.id === 'chips') {
    const large = selected.has('chips-large')
    layers.push(layer('tray', 'tray', 1.12, 0, -.03, { z: 1 }))
    layers.push(layer(large ? 'chips-large' : 'chips-regular', 'chips', large ? .96 : .78, 0, .05, { z: 10 }))
    sauces.forEach((key, i) => layers.push(sauceLayer(key, .5, -.04 + i * .03, .2 + i * .015, { z: 20 + i })))
    return { layers: layers.filter(Boolean), lid: null, kind: 'plate' }
  }

  if (product.id === 'chicken-nuggets') {
    layers.push(layer('tray', 'tray', 1.12, 0, -.03, { z: 1 }))
    const count = selected.has('nuggets-9') ? 9 : 6
    nuggetSpots.slice(0, count).forEach(([nx, ny, r], i) =>
      layers.push(layer('nugget-' + i, 'nugget', .27, nx, ny, { rot: r, z: 10 + i })))
    sauces.forEach((key, i) => layers.push(sauceLayer(key, .46, -.02 + i * .03, .26 + i * .015, { z: 30 + i })))
    return { layers: layers.filter(Boolean), lid: null, kind: 'plate' }
  }

  // Single items: drinks stand at one height, bars lie at one width.
  if (product.categoryId === 'drinks') {
    const placeholder = product.image.includes('placeholder')
    return { layers: [placeholder ? layer('item', 'bottle', .36, 0, 0, { z: 10 }) :
      drinkArt('item', product.image, .62, 0, 0, 10)], lid: null, kind: 'single' }
  }
  return { layers: [{ id: 'item', src: product.image, ar: .64, w: .74, x: 0, y: .02, z: 10 }], lid: null, kind: 'single' }
}


export function layerHeight(l) {
  return l.w * l.ar * (1 - (l.crop ?? 0))
}

// Height of the composition above the board, in rig widths.
export function extent(comp, lidLift = 0) {
  return Math.max(.3, ...comp.layers.map(l => Math.max(0, l.y + (l.crop ?? 0) * l.w) + layerHeight(l) + (l.id === comp.lid ? lidLift : 0)))
}

// Creates or updates an <img> for a layer. Keyed photos load after keying.
export function paintLayer(img, l) {
  img.alt = ''
  img.decoding = 'async'
  img.draggable = false
  const state = [...img.classList].filter(name => name.startsWith('is-'))
  img.className = ['layer', l.kind && 'layer--' + l.kind, ...state].filter(Boolean).join(' ')
  img.style.setProperty('--x', l.x)
  img.style.setProperty('--y', l.y)
  img.style.setProperty('--w', l.w)
  img.style.setProperty('--rot', (l.rot ?? 0) + 'deg')
  img.style.zIndex = l.z ?? 1
  img.style.setProperty('--tint', l.filter ?? 'brightness(1)')
  img.dataset.layer = l.id
  const path = l.src
  if (img.dataset.src !== path) {
    img.dataset.src = path
    img.src = asset(path)
  }
  return img
}

// Static, closed composition sized to fit a box (menu cards, home page).
export function renderStill(box, product, selected = new Set(), { fill = .82 } = {}) {
  const comp = compose(product, selected)
  const rig = document.createElement('div')
  rig.className = 'rig'
  for (const l of comp.layers) rig.append(paintLayer(new Image(), l))
  box.replaceChildren(rig)
  const fit = () => {
    const { width, height } = box.getBoundingClientRect()
    if (!width) return
    const span = Math.max(1, ...comp.layers.map(l => Math.abs(l.x) * 2 + l.w))
    const W = Math.min(width * fill / span, height * .84 / extent(comp))
    rig.style.setProperty('--W', W + 'px')
  }
  fit()
  new ResizeObserver(fit).observe(box)
  return comp
}
