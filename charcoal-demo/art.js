// Product pictures for cards (menu, home, deals). Each card shows the builder
// scene frozen at rest, built from the same layer data (product-profiles.js and
// burger-layers.js) on the same dark pass, so a card always matches what the
// customer will build: a Half Pounder has two patties, a hot dog with cheese
// shows its cheese, a meal deal shows its main, chips and a drink. A product
// may give its own `art` (cut-outs with src, w, x, base, z, rotate) when it has
// no scene of its own. If every picture fails to load, the tile shows the
// Er-Han grill mark instead of an empty box.
import { productProfile } from './product-profiles.js'
import { burgerProfile } from './burger-layers.js'
import { createDefaultSelections } from './catalog.js'
import { renderBoxStill } from './box-scene.js'

// Box scenes are drawn on a canvas when the card comes near the screen (or by
// the sweep below), from the same plan as the builder.
const pendingBoxes = new Set()
let boxWatcher
function drawBox(canvas) {
  if (!pendingBoxes.delete(canvas)) return
  boxWatcher?.unobserve(canvas)
  const { recipe, product } = canvas.boxArt
  const options = product.optionGroups.flatMap(group => group.options)
  renderBoxStill(canvas, recipe, options, createDefaultSelections(product, product.cardChoices ?? []))
    .catch(() => canvas.closest('.art')?.classList.add('art--missing'))
}
function watchBox(canvas, eager) {
  pendingBoxes.add(canvas)
  if (eager || !('IntersectionObserver' in window)) {
    requestAnimationFrame(() => drawBox(canvas))
    return
  }
  boxWatcher ??= new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) drawBox(entry.target)
  }, { rootMargin: '300px' })
  boxWatcher.observe(canvas)
}

// Lazy pictures still arrive even if the page is never scrolled (for example a
// full-page capture or a preview that cannot detect scrolling).
let sweepScheduled = false
function scheduleSweep() {
  if (sweepScheduled) return
  sweepScheduled = true
  const sweep = () => setTimeout(() => {
    for (const image of document.querySelectorAll('.art img[loading="lazy"]')) image.loading = 'eager'
    for (const canvas of [...pendingBoxes]) drawBox(canvas)
  }, 600)
  if (document.readyState !== 'loading') sweep()
  else addEventListener('DOMContentLoaded', sweep, { once: true })
}

// The layers on show at rest, with their height above the surface.
export function restingLayers(product) {
  let profile = productProfile(product, burgerProfile)
  if (!profile.layers) profile = { ...burgerProfile, ...profile }
  const options = product.optionGroups.flatMap(group => group.options)
  const selected = createDefaultSelections(product, product.cardChoices ?? [])
  const keys = new Set(profile.fixedLayerKeys ?? [])
  for (const option of options) if (selected.has(option.id)) for (const key of option.layerKeys ?? []) keys.add(key)
  for (const option of options) if (selected.has(option.id)) for (const key of option.removeLayerKeys ?? []) keys.delete(key)
  let height = 0
  const layers = []
  for (const layer of profile.layers) {
    if (!(layer.required || keys.has(layer.key))) continue
    const y = layer.positionY ?? height
    height += layer.step ?? 0
    if (!layer.sauce && layer.asset) layers.push({ ...layer, y })
  }
  const closing = layers.find(layer => layer.key === profile.closingLayerKey)
  // The lid sits slightly open on cards so the fillings (cheese, egg, a second
  // patty) can be told apart at a glance.
  if (closing) Object.assign(closing, { y: closing.y + .12, restingAngle: -6 })
  return { visual: profile.visual ?? 'burger', layers, tall: Boolean(closing && closing.y >= .685) }
}

function image(src, eager, onError) {
  const node = document.createElement('img')
  node.alt = ''
  node.decoding = 'auto'
  node.loading = eager ? 'eager' : 'lazy'
  node.draggable = false
  node.addEventListener('error', onError, { once: true })
  node.src = src
  return node
}

export function productArt(product, { eager = false, className = '' } = {}) {
  const art = document.createElement('div')
  art.className = 'art' + (className ? ' ' + className : '')
  art.setAttribute('aria-hidden', 'true')
  const rig = document.createElement('div')
  rig.className = 'art-rig'
  art.append(rig)
  let count = 0
  let failed = 0
  const onError = event => {
    event.target.remove()
    if (++failed === count) art.classList.add('art--missing')
  }
  const profile = productProfile(product, burgerProfile)
  if (profile.layout === 'box') {
    art.dataset.visual = 'box'
    const canvas = document.createElement('canvas')
    canvas.className = 'art-box'
    canvas.boxArt = { recipe: profile.recipe, product }
    art.append(canvas)
    watchBox(canvas, eager)
  } else if (product.art) {
    // Hand-placed cut-outs: positions are shares of the tile width.
    art.dataset.visual = 'art'
    for (const { src, w = 1, x = 0, base = .14, z = 1, rotate = 0 } of product.art) {
      const node = image(src, eager, onError)
      Object.assign(node.style, {
        width: w * 100 + '%', left: (50 + x * 100) + '%', bottom: base * 100 + 'cqw',
        zIndex: String(z), transform: 'translateX(-50%)' + (rotate ? ' rotate(' + rotate + 'deg)' : ''),
      })
      rig.append(node)
      count++
    }
  } else {
    const { visual, layers, tall } = restingLayers(product)
    art.dataset.visual = visual
    if (tall) art.dataset.tall = 'true'
    rig.append(Object.assign(document.createElement('span'), { className: 'art-contact' }))
    for (const [index, layer] of layers.entries()) {
      const node = image(layer.asset, eager, onError)
      if (layer.menuPhoto) node.className = 'art-photo'
      Object.assign(node.style, {
        width: layer.width * 100 + '%',
        left: 'calc(50% + ' + layer.offset * 100 + '%)',
        bottom: layer.y * 100 + 'cqw',
        zIndex: String(index + 1),
        transform: 'translateX(-50%)' + (layer.restingAngle ? ' rotate(' + layer.restingAngle + 'deg)' : ''),
      })
      rig.append(node)
      count++
    }
  }
  if (!eager) scheduleSweep()
  return art
}
