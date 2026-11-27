// Product pictures for cards (menu, home, deals) on one surface and one scale.
// A product shows its normalised photo (assets/products: 800 px squares whose
// food stands on a shared baseline at 86% of the height) or, when it has
// `art`, a composition of cut-outs. Art layers: src, w (share of the tile
// width), x (centre offset), base (where the food stands, from the bottom),
// z and rotate. If an image cannot load, the tile keeps its designed plate.
const normalisedBaseline = .14

function layerStyle({ w = 1, x = 0, base = normalisedBaseline, z = 1, rotate = 0 }, normalised) {
  const bottom = base - (normalised ? normalisedBaseline * w : 0)
  return {
    width: w * 100 + '%',
    left: (50 + (x - w / 2) * 100) + '%',
    bottom: bottom * 100 + 'cqw',
    zIndex: String(z),
    rotate: rotate ? rotate + 'deg' : '',
  }
}

// Lazy pictures still arrive even if the page is never scrolled (for example a
// full-page capture or a preview that cannot detect scrolling): shortly after
// the page has loaded, every remaining lazy picture is fetched in the background.
let sweepScheduled = false
function scheduleSweep() {
  if (sweepScheduled) return
  sweepScheduled = true
  const sweep = () => setTimeout(() => {
    for (const image of document.querySelectorAll('.art img[loading="lazy"]')) image.loading = 'eager'
  }, 600)
  if (document.readyState !== 'loading') sweep()
  else addEventListener('DOMContentLoaded', sweep, { once: true })
}

export function productArt(product, { eager = false, className = '' } = {}) {
  const art = document.createElement('div')
  art.className = 'art' + (className ? ' ' + className : '')
  art.setAttribute('aria-hidden', 'true')
  const layers = product.art ?? [{ src: product.image, w: 1 }]
  let failed = 0
  for (const layer of layers) {
    const image = document.createElement('img')
    image.alt = ''
    image.decoding = 'async'
    image.loading = eager ? 'eager' : 'lazy'
    image.draggable = false
    Object.assign(image.style, layerStyle(layer, layer.src.includes('/assets/products/')))
    image.addEventListener('error', () => {
      image.remove()
      if (++failed === layers.length) art.classList.add('art--missing')
    }, { once: true })
    image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true })
    image.src = layer.src
    art.append(image)
  }
  if (!eager) scheduleSweep()
  return art
}
