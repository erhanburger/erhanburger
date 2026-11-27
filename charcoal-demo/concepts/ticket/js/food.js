// Draws a product from cut-outs and animates changes: new layers drop in,
// removed layers lift away, the lid (top bun) hovers while building and drops
// on the finish. Only transform, translate and opacity are animated.
import { recipe, layers } from './data.js'

const reduced = matchMedia('(prefers-reduced-motion: reduce)')

export function createFood(container, product, { mode = 'stage', lidOpen = mode === 'stage' } = {}) {
  container.classList.add('food', 'food--' + mode)
  const rig = document.createElement('div')
  rig.className = 'food-rig'
  container.append(rig)
  const nodes = new Map()
  let current = null
  let open = lidOpen
  let firstPaint = true

  function image(src, className) {
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    img.decoding = 'async'
    img.draggable = false
    if (mode === 'thumb') img.loading = 'lazy'
    img.className = className
    return img
  }

  function enter(node) {
    if (firstPaint || reduced.matches) return
    node.classList.add('is-dropping')
    node.addEventListener('animationend', () => node.classList.remove('is-dropping'), { once: true })
  }

  function leave(node) {
    if (reduced.matches) return node.remove()
    node.classList.add('is-leaving')
    setTimeout(() => node.remove(), 240)
  }

  function render(selected) {
    current = recipe(product, selected)
    container.dataset.kind = current.kind
    const W = unit()
    const seen = new Set()
    for (const item of current.items) {
      if (item.type === 'stack') renderStack(item, W, seen)
      else renderItem(item, W, seen)
    }
    for (const [key, node] of nodes) {
      if (!seen.has(key)) { nodes.delete(key); leave(node) }
    }
    firstPaint = false
  }

  function unit() {
    const width = container.clientWidth || 300
    const height = container.clientHeight || 300
    const [fw, fh] = current.fit
    const roomH = height * (mode === 'stage' ? .84 : .9) / (open && current.closing ? 1.22 : 1)
    return Math.max(40, Math.min(width * (mode === 'stage' ? .9 : .94) / fw, roomH / fh))
  }

  function renderItem(item, W, seen) {
    const key = 'item:' + item.key + ':' + (item.src ?? 'ghost')
    seen.add(key)
    let node = nodes.get(key)
    if (!node) {
      if (item.type === 'ghost' && mode !== 'stage') {
        node = image(item.src, 'food-item food-item--tall')
        node.style.opacity = '.55'
      } else if (item.type === 'ghost') {
        node = document.createElement('div')
        node.className = 'food-ghost'
        node.innerHTML = '<span>Your<br>drink</span>'
      } else node = image(item.src, 'food-item')
      if (item.tall) node.classList.add('food-item--tall')
      rig.append(node)
      nodes.set(key, node)
      enter(node)
    }
    node.style.width = item.w * W + 'px'
    node.style.zIndex = item.z * 100
    node.style.translate = `calc(-50% + ${item.x * W}px) ${-item.y * W}px`
    if (item.rotate) node.style.rotate = item.rotate + 'deg'
  }

  function renderStack(item, W, seen) {
    const S = W * item.scale
    const counts = {}
    let rise = 0
    const lidKey = item.keys.find(key => layers[key].lid)
    let last = 0
    item.keys.forEach((layerKey, index) => {
      const layer = layers[layerKey]
      const nth = counts[layerKey] = (counts[layerKey] ?? -1) + 1
      const key = 'stack:' + item.key + ':' + layerKey + '#' + nth
      seen.add(key)
      let node = nodes.get(key)
      if (!node) {
        node = image(layer.src, 'food-layer' + (layer.lid ? ' food-layer--lid' : '') + (layer.sauce ? ' food-layer--sauce' : ''))
        if (layer.filter) node.style.filter = layer.filter
        rig.append(node)
        nodes.set(key, node)
        enter(node)
      }
      let y = rise
      let x = item.x * W
      if (layer.lid && open) y = rise + .5 * S
      node.classList.toggle('is-open', Boolean(layer.lid && open))
      node.style.width = layer.w * S + 'px'
      node.style.zIndex = item.z * 100 + index + 1
      node.style.translate = `calc(-50% + ${x}px) ${-(y + item.y * W)}px`
      last = rise
      rise += layer.step * S
    })
    container.style.setProperty('--stack-top', (last + item.y * W) + 'px')
    return lidKey
  }

  let raf = 0
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      if (!current) return
      const W = unit()
      const seen = new Set()
      container.classList.add('is-resizing')
      for (const item of current.items) item.type === 'stack' ? renderStack(item, W, seen) : renderItem(item, W, seen)
      requestAnimationFrame(() => container.classList.remove('is-resizing'))
    })
  })
  observer.observe(container)

  return {
    update(selected) {
      open = lidOpen
      render(selected)
    },
    /** Drop the lid and steam. Resolves when the moment is over. */
    finish(selected) {
      open = false
      render(selected)
      container.classList.add('is-ready')
      const steam = document.createElement('div')
      steam.className = 'food-steam'
      steam.innerHTML = '<i></i><i></i><i></i>'
      container.append(steam)
      setTimeout(() => steam.remove(), 1800)
      return new Promise(resolve => setTimeout(resolve, reduced.matches ? 50 : 520))
    },
    reopen(selected) {
      container.classList.remove('is-ready')
      open = lidOpen
      render(selected)
    },
  }
}
