// The box scene engine: food served in an open takeaway box (box-recipes.js).
// One canvas draws the box, chips, chicken, vegetables, extras, salad, the
// squeezed sauces and the pitta; a second canvas above it carries the sauce
// while it is being poured, under the shared bottle from sauce-motion.js.
//
// Layout is deterministic: a seeded generator places every possible piece
// inside the box interior polygon from the sprite manifest, so the builder
// and the card stills (art.js) always show the same food. The animation is
// state-driven: every piece has a target (in or out of the box) and a motion
// that starts from wherever the piece is now, so rapid taps never leave the
// picture out of step with the selection, and the final still always equals
// it. Only canvas transforms and alpha are animated.
import { boxMaterials, boxTargets } from './box-recipes.js'
import { paintSaucePour, paintSauceTrail, sauceProfiles } from './sauce-motion.js'

const clamp = value => Math.max(0, Math.min(1, value))
const ease = value => value * value * (3 - 2 * value)
const easeOut = value => 1 - (1 - value) ** 3

// ---------- Loading ----------

const manifests = new Map()
const images = new Map()

export function loadManifest(library) {
  if (!manifests.has(library)) {
    manifests.set(library, fetch(library + 'manifest.json')
      .then(response => {
        if (!response.ok) throw new Error('No box library at ' + library)
        return response.json()
      }))
  }
  return manifests.get(library)
}

function loadImage(src) {
  if (!images.has(src)) {
    const image = new Image()
    image.decoding = 'async'
    const ready = new Promise(resolve => {
      image.onload = () => resolve(image)
      image.onerror = () => resolve(null)
    })
    image.src = src
    images.set(src, { image, ready })
  }
  return images.get(src).ready
}

function loadedImage(src) {
  const entry = images.get(src)
  return entry?.image.complete && entry.image.naturalWidth ? entry.image : null
}

// ---------- Layout ----------

function random(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inside(polygon, u, v) {
  let hit = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ui, vi] = polygon[i]
    const [uj, vj] = polygon[j]
    if ((vi > v) !== (vj > v) && u < (uj - ui) * (v - vi) / (vj - vi) + ui) hit = !hit
  }
  return hit
}

function bounds(polygon) {
  const us = polygon.map(([u]) => u)
  const vs = polygon.map(([, v]) => v)
  return { u0: Math.min(...us), u1: Math.max(...us), v0: Math.min(...vs), v1: Math.max(...vs) }
}

const point = value => Array.isArray(value) ? value : [value.x, value.y]

// The plan is every piece the box can ever show, at rest, in box units: the
// box base is 1 wide and stands on y = 0; x is centred, y points up the screen.
// The manifest may name the box images as files sharing one canvas (the
// library's own schema) or as {src, w, h} records.
function boxImage(entry, scale) {
  if (!entry) return null
  if (typeof entry === 'string') return { src: entry, w: scale?.imageWidth, h: scale?.imageHeight, x: 0, y: 0 }
  return entry
}

export function planBox(recipe, manifest) {
  const base = boxImage(manifest.box.base, manifest.scale)
  const aspect = base.h / base.w
  // Sprite sizes are given in box-base image pixels.
  const unit = manifest.scale?.imageWidth ?? base.w
  const interior = manifest.box.interior.map(point)
  const floor = (manifest.box.floor ?? manifest.box.interior).map(point)
  const saladZone = (manifest.box.saladZone ?? []).map(point)
  const toX = u => u - .5
  const toY = v => (1 - v) * aspect
  const rand = random(recipe.seed)
  const items = []
  const all = bounds(interior)
  const side = saladZone.length ? bounds(saladZone) : null
  const saladLeft = side ? (side.u0 + side.u1) / 2 < (all.u0 + all.u1) / 2 : true

  const sprite = (entry, scale = 1) => ({
    src: manifest.libraryUrl + entry.src, w: entry.w / unit * scale, h: entry.h / unit * scale,
  })
  // A sprite's footprint must stay inside the interior.
  const fits = (u, v, w, h) => {
    // Pieces turn freely, so their long side may point any way.
    const du = Math.max(w, h) * .4
    const dv = Math.max(w, h) * .3 / aspect
    return inside(interior, u, v) && inside(interior, u - du, v) && inside(interior, u + du, v) &&
      inside(interior, u, v - dv) && inside(interior, u, v + dv)
  }
  // Best-candidate sampling spreads pieces evenly without a grid look.
  function scatter(count, region, sizeOf, tries = 14) {
    const placed = []
    for (let index = 0; index < count; index++) {
      const size = sizeOf(index)
      let best = null
      let bestScore = -1
      for (let attempt = 0; attempt < tries * 6 && (attempt < tries || !best); attempt++) {
        const angle = rand() * Math.PI * 2
        const radius = Math.sqrt(rand())
        const u = region.cu + Math.cos(angle) * radius * region.ru
        const v = region.cv + Math.sin(angle) * radius * region.rv
        if (!fits(u, v, size.w, size.h)) continue
        let score = Infinity
        for (const other of placed) score = Math.min(score, Math.hypot(other.u - u, (other.v - v) * aspect))
        if (score > bestScore) {
          best = { u, v, radius, size }
          bestScore = score
        }
      }
      if (best) placed.push(best)
    }
    return placed
  }

  // Chips bed over the whole floor.
  if (recipe.chips && manifest.chips?.length) {
    const ground = bounds(floor)
    const region = { cu: (ground.u0 + ground.u1) / 2, cv: (ground.v0 + ground.v1) / 2, ru: (ground.u1 - ground.u0) * .62, rv: (ground.v1 - ground.v0) * .62 }
    const pool = manifest.chips
    const spots = scatter(recipe.chips.count, region, index => sprite(pool[index % pool.length]), 8)
    spots.forEach(({ u, v, radius, size }, index) => {
      const lift = .02 * (1 - radius * radius) + rand() * .008
      items.push({
        id: 'chips-' + index, group: 'chips', ...size, src: size.src, material: 'chips',
        x: toX(u), y: toY(v) + lift, rot: (rand() - .5) * 180, tier: 1, depth: v + lift * 2, seed: rand(),
      })
    })
  }

  // The heap: chicken with cooked onion and peppers mixed through it, kept
  // mostly clear of the salad side. A smaller portion covers less of the box.
  const heapU0 = side ? (saladLeft ? side.u1 - .05 : all.u0) : all.u0
  const heapU1 = side ? (saladLeft ? all.u1 : side.u0 + .05) : all.u1
  const coverage = Math.sqrt(recipe.heap.coverage)
  const heap = {
    cu: (heapU0 + heapU1) / 2, cv: all.v0 + (all.v1 - all.v0) * .56,
    ru: (heapU1 - heapU0) * .5 * coverage, rv: (all.v1 - all.v0) * .46 * coverage,
  }
  const pieces = []
  for (const group of recipe.groups) {
    const pool = manifest[group.sprites] ?? []
    if (!pool.length) continue
    const offset = Math.floor(rand() * pool.length)
    for (let index = 0; index < group.count; index++) pieces.push({ group, entry: pool[(offset + index) % pool.length] })
  }
  // Interleave the groups so vegetables are spread through the chicken.
  pieces.sort(() => rand() - .5)
  const spots = scatter(pieces.length, heap, index => sprite(pieces[index].entry))
  spots.forEach(({ u, v, radius }, index) => {
    const { group, entry } = pieces[index]
    const size = sprite(entry)
    const lift = recipe.heap.height * (1 - radius * radius) * (.55 + rand() * .45)
    const veg = group.material === 'veg'
    items.push({
      id: group.key + '-' + index, group: group.key, ...size, material: group.material,
      x: toX(u), y: toY(v) + lift, rot: (rand() - .5) * (veg ? 120 : 100), tier: 2,
      depth: v * .55 + lift / Math.max(.01, recipe.heap.height) * .45 + rand() * .08, seed: rand(),
    })
  })

  // Extras sit on top of the heap, near its centre.
  const extras = Object.entries(recipe.extras)
  extras.forEach(([key, extra], index) => {
    const entry = manifest.extras?.[key]
    const size = entry ? sprite(entry) : { src: extra.fallback.src, w: extra.fallback.w, h: 0 }
    const angle = -.6 + index * 1.25
    const u = heap.cu + Math.cos(angle) * heap.ru * .38
    const v = heap.cv + Math.sin(angle) * heap.rv * .32 - .04
    items.push({
      id: 'extra-' + key, group: 'extra:' + key, ...size, material: extra.material,
      x: toX(u), y: toY(v) + recipe.heap.height + .012, rot: (rand() - .5) * 16, tier: 3, depth: v, seed: rand(),
    })
  })

  // Salad along the side of the box, back to front.
  if (side) {
    const keys = Object.keys(recipe.salad)
    const zone = { u: (side.u0 + side.u1) / 2, v0: side.v0, v1: side.v1 }
    const rows = { lettuce: [.24, .7], tomato: [.34], cucumber: [.56], onion: [.45], gherkin: [.8] }
    for (const key of keys) {
      const salad = recipe.salad[key]
      const pool = manifest.salad?.[key]
      const at = rows[key] ?? [.5]
      const count = pool?.length ? Math.max(salad.count, at.length) : at.length
      for (let index = 0; index < count; index++) {
        const size = pool?.length ? sprite(pool[index % pool.length]) : { src: salad.fallback.src, w: salad.fallback.w, h: 0 }
        const along = at[index % at.length] + (index >= at.length ? rand() * .2 - .1 : 0)
        const v = zone.v0 + (zone.v1 - zone.v0) * along
        const u = zone.u + (rand() - .5) * (side.u1 - side.u0) * .25
        items.push({
          id: 'salad-' + key + '-' + index, group: 'salad:' + key, ...size, material: salad.material,
          x: toX(u), y: toY(v) + .012 + (key === 'lettuce' ? 0 : .02), rot: (rand() - .5) * 18,
          tier: key === 'lettuce' ? 1.4 : 1.5, depth: v, seed: rand(),
        })
      }
    }
  }

  // One pitta on top, where the manifest says it rests.
  if (recipe.pitta && manifest.pitta) {
    const anchor = manifest.box.pittaAnchor ?? { x: .62, y: .3 }
    const [u, v] = point(anchor)
    const size = sprite(manifest.pitta)
    // The anchor may give the pitta's width as a share of the box image.
    if (anchor.w) Object.assign(size, { w: anchor.w, h: anchor.w * manifest.pitta.h / manifest.pitta.w })
    items.push({
      id: 'pitta', group: 'pitta', ...size, material: 'bread', x: toX(u), y: toY(v) + recipe.heap.height * .5,
      rot: anchor.rotate ?? 0, tier: 7, depth: 0, seed: rand(),
    })
  }

  items.sort((a, b) => a.tier - b.tier || a.depth - b.depth)
  items.forEach((item, index) => { item.order = index })

  // The sauce line runs across the middle of the heap.
  const sauce = { x: toX(heap.cu), y: toY(heap.cv) + recipe.heap.height * .7, width: heap.ru * 1.5 }
  // Lid and front lip are positioned on the base image's canvas (x, y = top-left in its pixels).
  const overlay = entry => {
    const image = boxImage(entry, manifest.scale)
    return image && {
      src: manifest.libraryUrl + image.src, w: image.w / base.w, h: image.h / base.w,
      x: -.5 + (image.x ?? 0) / base.w, y: aspect - (image.y ?? 0) / base.w,
    }
  }
  const box = {
    base: { src: manifest.libraryUrl + base.src, x: -.5, y: aspect, w: 1, h: aspect },
    lid: overlay(manifest.box.lid),
    front: overlay(manifest.box.front),
  }
  // The food's highest point (the lid may rise behind the stage's labels).
  const rim = toY(Math.min(...interior.map(([, v]) => v))) + .04
  const top = Math.max(rim, ...items.map(item => item.y + (item.h || item.w * .5) / 2))
  return { items, sauce, box, aspect, top, foot: 0 }
}

// Sauce passes for a chosen sauce: a little is a short thin line, extra is two.
function saucePasses(target, plan, index) {
  const profile = sauceProfiles[target.sauceKey]
  const { x, y, width } = plan.sauce
  const shift = ((index % 3) - 1) * .035
  const layer = (dy, scale, body) => ({
    key: target.sauceKey, path: 'zigzag', offset: x + shift * .5,
    y: y + shift + dy - .07 * width * scale, width: width * scale,
    sauce: { ...profile, body: profile.body * body },
  })
  if (target.amount === 'little') return [layer(0, .62, .7)]
  if (target.amount === 'extra') return [layer(0, 1, 1.2), layer(.04, .9, 1.15)]
  return [layer(0, 1, 1)]
}

// ---------- Drawing ----------

let shadowSprite
function contactShadow() {
  if (shadowSprite) return shadowSprite
  shadowSprite = document.createElement('canvas')
  shadowSprite.width = 64
  shadowSprite.height = 32
  const context = shadowSprite.getContext('2d')
  const gradient = context.createRadialGradient(32, 16, 0, 32, 16, 32)
  gradient.addColorStop(0, 'rgba(24, 12, 6, .85)')
  gradient.addColorStop(.45, 'rgba(24, 12, 6, .45)')
  gradient.addColorStop(1, 'rgba(24, 12, 6, 0)')
  context.setTransform(1, 0, 0, .5, 0, 8)
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  return shadowSprite
}

function sizeOf(item, image) {
  if (item.h) return [item.w, item.h]
  return [item.w, image.naturalHeight / image.naturalWidth * item.w]
}

function drawSprite(context, view, src, x, y, w, h) {
  const image = loadedImage(src)
  if (!image) return
  context.drawImage(image, view.ox + x * view.s, view.oy - y * view.s, w * view.s, h * view.s)
}

// pose: { h (height above rest), o (opacity), dx, rot, sq }
function drawItem(context, view, item, pose) {
  if (pose.o <= .003) return
  const image = loadedImage(item.src)
  if (!image) return
  const [w, h] = sizeOf(item, image)
  const s = view.s
  const material = boxMaterials[item.material] ?? boxMaterials.chicken
  // The contact shadow stays on the surface: wide and faint while the piece
  // is high, tight and dark as it lands.
  const air = clamp(pose.h * 2.2)
  const shadowW = w * (.92 + air * .6)
  const shadowH = Math.min(h * .55, w * .34) * (1 + air * .4)
  context.globalAlpha = material.shadow * pose.o * (1 - air * .75)
  context.drawImage(contactShadow(), view.ox + (item.x - shadowW / 2) * s,
    view.oy - (item.y - h * .22 + shadowH / 2) * s, shadowW * s, shadowH * s)
  context.globalAlpha = pose.o
  context.save()
  context.translate(view.ox + (item.x + pose.dx) * s, view.oy - (item.y + pose.h - h / 2) * s)
  context.rotate((item.rot + pose.rot) * Math.PI / 180)
  const squash = pose.sq ?? 1
  context.scale(1 + (1 - squash) * .6, squash)
  context.drawImage(image, -w / 2 * s, -h * s, w * s, h * s)
  context.restore()
  context.globalAlpha = 1
}

function drawSauce(context, view, layer, progress, alpha) {
  context.save()
  context.translate(view.ox, view.oy)
  paintSauceTrail(context, layer, progress, alpha, view.s, 0)
  context.restore()
}

// Draws the whole box. poseOf(item) returns null for a piece that is not shown.
function drawBox(context, view, plan, poseOf, sauces) {
  const { base, lid, front } = plan.box
  if (lid) drawSprite(context, view, lid.src, lid.x, lid.y, lid.w, lid.h)
  drawSprite(context, view, base.src, base.x, base.y, base.w, base.h)
  // Sauce goes over the chicken and extras; the box's front lip then covers
  // the food at the front; the pitta rests on top of everything.
  const finish = [
    () => { for (const { layer, progress, alpha } of sauces) drawSauce(context, view, layer, progress, alpha) },
    () => { if (front) drawSprite(context, view, front.src, front.x, front.y, front.w, front.h) },
  ]
  let done = 0
  for (const item of plan.items) {
    while (done < finish.length && item.tier > 3 + done * 3) finish[done++]()
    const pose = poseOf(item)
    if (pose) drawItem(context, view, item, pose)
  }
  while (done < finish.length) finish[done++]()
}

// Where the box stands: the lowest opaque row of the base image, so its
// transparent margin does not lift the box off the pass.
function measureFoot(plan) {
  const image = loadedImage(plan.box.base.src)
  if (!image) return
  const canvas = document.createElement('canvas')
  canvas.width = 48
  canvas.height = 96
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(image, 0, 0, 48, 96)
  const { data } = context.getImageData(0, 0, 48, 96)
  let bottom = 96
  for (let row = 95; row >= 0 && bottom === 96; row--) {
    for (let column = 0; column < 48; column++) if (data[(row * 48 + column) * 4 + 3] > 160) { bottom = row + 1; break }
  }
  plan.foot = (1 - bottom / 96) * plan.aspect
}

function spriteSources(plan, groups) {
  const sources = [plan.box.base.src]
  for (const part of [plan.box.lid, plan.box.front]) if (part) sources.push(part.src)
  for (const item of plan.items) if (!groups || groups.has(item.group)) sources.push(item.src)
  return [...new Set(sources)]
}

// ---------- Card stills ----------

// Draws the scene at rest into a canvas that fills a product card.
export async function renderBoxStill(canvas, recipe, options, selectedIds) {
  const manifest = await loadManifest(recipe.library)
  const plan = planBox(recipe, { ...manifest, libraryUrl: recipe.library })
  const { groups, sauces } = boxTargets(recipe, options, selectedIds)
  await Promise.all(spriteSources(plan, groups).map(loadImage))
  measureFoot(plan)
  const paint = () => {
    const box = canvas.getBoundingClientRect()
    if (!box.width) return
    const scale = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(box.width * scale)
    canvas.height = Math.round(box.height * scale)
    const context = canvas.getContext('2d')
    // The box fills most of the card and stands a little above its foot.
    const s = Math.min(box.width * .9, box.height * .8 / (plan.top - plan.foot)) * scale
    const view = { ox: canvas.width / 2, oy: canvas.height - box.height * .08 * scale + plan.foot * s, s }
    const layers = sauces.flatMap((target, index) => saucePasses(target, plan, index))
      .map(layer => ({ layer, progress: 1, alpha: 1 }))
    drawBox(context, view, plan, item => groups.has(item.group) ? { h: 0, o: 1, dx: 0, rot: 0 } : null, layers)
    canvas.dataset.ready = 'true'
  }
  paint()
  new ResizeObserver(paint).observe(canvas)
}

// ---------- Builder scene ----------

const gravity = 7.2 // box widths per second squared
const dropHeight = .62
const liftTime = 260
const timings = { enter: 240, pour: 650, exit: 215 }
const pourTime = timings.enter + timings.pour + timings.exit

export const BoxScene = (() => {
  let ready = false
  let stage
  let rig
  let bottle
  let status
  let food
  let pour
  let foodContext
  let pourContext
  let recipe
  let options = []
  let plan
  let selection = new Set()
  let view = { ox: 0, oy: 0, s: 1 }
  let pourView = view
  let verticalRoom = 0
  let frame = 0
  let loaded = false
  const states = new Map()
  // Sauce passes: { key, layer, state: queued|pouring|rest|fading, t0, from }
  let sauces = []
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  const now = () => performance.now()

  function setStatus(phase, label) {
    stage.dataset.phase = phase
    if (status.textContent !== label) status.textContent = label
  }

  function setup() {
    if (ready) return
    ready = true
    stage = document.querySelector('#stage')
    rig = document.querySelector('#rig')
    bottle = document.querySelector('#bottle')
    status = document.querySelector('#status')
    food = document.createElement('canvas')
    food.className = 'box-canvas box-canvas--food'
    pour = document.createElement('canvas')
    pour.className = 'box-canvas box-canvas--pour'
    rig.prepend(food)
    rig.append(pour)
    foodContext = food.getContext('2d')
    pourContext = pour.getContext('2d')
    new ResizeObserver(() => {
      measure()
      paint(now())
    }).observe(stage)
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) settle()
    })
  }

  function measure() {
    const stageBox = stage.getBoundingClientRect()
    const rigBox = rig.getBoundingClientRect()
    if (!stageBox.width || !rigBox.width) return
    const scale = Math.min(devicePixelRatio || 1, 2)
    for (const canvas of [food, pour]) {
      Object.assign(canvas.style, {
        left: stageBox.left - rigBox.left + 'px', top: stageBox.top - rigBox.top + 'px',
        width: stageBox.width + 'px', height: stageBox.height + 'px',
      })
      canvas.width = Math.round(stageBox.width * scale)
      canvas.height = Math.round(stageBox.height * scale)
    }
    const ox = rigBox.left + rigBox.width / 2 - stageBox.left
    const oy = rigBox.bottom - stageBox.top
    const foot = plan?.foot ?? 0
    view = { ox: ox * scale, oy: (oy + foot * rigBox.width) * scale, s: rigBox.width * scale }
    pourView = { ox, oy: oy + foot * rigBox.width, s: rigBox.width, scale }
    verticalRoom = oy
  }

  // ----- piece motion -----

  function pose(state, time) {
    const item = state.item
    const material = boxMaterials[item.material] ?? boxMaterials.chicken
    const elapsed = time - state.t0
    if (state.mode === 'rest') return { h: 0, o: 1, dx: 0, rot: 0, done: true }
    if (state.mode === 'gone') return null
    if (state.mode === 'drop') {
      if (elapsed < 0) return state.o0 > 0 ? { h: state.h0, o: state.o0, dx: 0, rot: state.r0 ?? 0 } : null
      const g = gravity * material.g
      const fall = Math.sqrt(2 * state.h0 / g) * 1000
      const share = state.h0 / dropHeight
      if (elapsed < fall) {
        const t = elapsed / 1000
        const h = Math.max(0, state.h0 - .5 * g * t * t)
        const high = h / dropHeight
        const flutter = (material.flutter ?? 0) * Math.sin(elapsed / 95 + item.seed * 6) * high
        return {
          h, o: Math.min(1, state.o0 + elapsed / 110), dx: flutter + (item.seed - .5) * .06 * high,
          rot: (item.seed - .5) * 2 * material.spin * high + flutter * 160,
        }
      }
      const s = (elapsed - fall) / material.settle
      if (s >= 1) return { h: 0, o: 1, dx: 0, rot: 0, done: true }
      const strength = Math.min(1, share * 1.6)
      return {
        h: material.bounce * strength * Math.sin(Math.PI * s) * (1 - s), o: 1, dx: 0, rot: 0,
        sq: 1 - material.squash * strength * Math.sin(Math.PI * Math.min(1, s * 2.2)) * (1 - s),
      }
    }
    // lift: up and away, fading out
    const u = clamp(elapsed / liftTime)
    if (u >= 1) return { h: state.h0 + .15, o: 0, dx: 0, rot: 0, done: true }
    return {
      h: state.h0 + .15 * easeOut(u), o: state.o0 * (1 - u ** 1.4), dx: (item.seed - .5) * .05 * u,
      rot: (state.r0 ?? 0) + (item.seed - .5) * 30 * u,
    }
  }

  function retarget(state, mode, time, delay = 0) {
    const current = pose(state, time)
    state.h0 = current ? current.h : dropHeight * (.85 + state.item.seed * .3)
    state.o0 = current ? current.o : 0
    state.r0 = current?.rot ?? 0
    if (mode === 'drop' && !current) state.h0 = dropHeight * (.85 + state.item.seed * .3)
    if (mode === 'drop' && state.h0 < .002) {
      state.mode = 'rest'
      return
    }
    state.mode = mode
    state.t0 = time + delay
  }

  // ----- sauces -----

  function sauceTargets() {
    return boxTargets(recipe, options, selection).sauces
      .flatMap((target, index) => saucePasses(target, plan, index).map((layer, pass) =>
        ({ key: target.id + '#' + pass, layer })))
  }

  function sauceProgress(entry, time) {
    if (entry.state === 'rest') return 1
    if (entry.state === 'pouring') {
      const elapsed = time - entry.t0 - timings.enter
      return ease(clamp(elapsed / timings.pour))
    }
    return entry.from ?? 0
  }

  // ----- reconciliation -----

  function reconcile({ replay = false } = {}) {
    const time = now()
    const { groups } = boxTargets(recipe, options, selection)
    const instant = reducedMotion.matches
    let removals = 0
    const additions = []
    for (const state of states.values()) {
      const want = groups.has(state.item.group)
      const showing = state.mode === 'rest' || state.mode === 'drop'
      if (instant) {
        state.mode = want ? 'rest' : 'gone'
        continue
      }
      if (want && !showing) additions.push(state)
      else if (!want && showing) removals++
    }
    if (!instant) {
      // Removals lift off top first; additions land bottom first.
      const leaving = [...states.values()].filter(state => !groups.has(state.item.group) &&
        (state.mode === 'rest' || state.mode === 'drop')).sort((a, b) => b.item.order - a.item.order)
      leaving.forEach((state, index) => retarget(state, 'lift', time, Math.min(index * 9, 140)))
      additions.sort((a, b) => a.item.order - b.item.order)
      let at = removals ? 130 : 0
      let tier = additions[0]?.item.tier
      let group = additions[0]?.item.group
      for (const state of additions) {
        const item = state.item
        if (item.tier !== tier) at += replay ? 200 : 60
        else if (item.group !== group && !replay) at += 25
        tier = item.tier
        group = item.group
        const step = item.tier === 1 ? 14 : item.tier === 2 ? (replay ? 34 : 30) : 70
        retarget(state, 'drop', time, at)
        at += step
      }
      // In a replay the pitta closes the build, after the sauces if there are any.
      const pitta = replay && additions.find(state => state.item.group === 'pitta')
      if (pitta) pitta.t0 = sauceTargets().length ? Infinity : time + at + 160
    }
    // Sauces: pour new ones one at a time, after the food has landed.
    const targets = sauceTargets()
    const wanted = new Map(targets.map(target => [target.key, target]))
    for (const entry of sauces) {
      if (wanted.has(entry.key) && entry.state !== 'fading') continue
      if (entry.state === 'queued') entry.state = 'dropped'
      else if (entry.state !== 'fading') {
        entry.from = sauceProgress(entry, time)
        entry.state = 'fading'
        entry.t0 = time
      }
    }
    sauces = sauces.filter(entry => entry.state !== 'dropped')
    const have = new Set(sauces.filter(entry => entry.state !== 'fading').map(entry => entry.key))
    const lastLanding = additions.length ? Math.max(...additions.filter(state => state.t0 !== Infinity)
      .map(state => state.t0 - time + 420), 0) : 0
    let at = time + (removals || additions.length ? Math.max(lastLanding, 300) : 60)
    for (const target of targets) {
      if (have.has(target.key)) continue
      sauces.push({ ...target, state: instant ? 'rest' : 'queued', t0: at })
    }
    sauces.sort((a, b) => targets.findIndex(t => t.key === a.key) - targets.findIndex(t => t.key === b.key))
    if (instant) {
      for (const entry of sauces) if (entry.state !== 'rest') entry.state = 'dropped'
      sauces = sauces.filter(entry => entry.state === 'rest')
    }
    start()
  }

  // Advances the pour queue and returns whether anything is still moving.
  function step(time) {
    let moving = false
    for (const state of states.values()) {
      if (state.mode === 'drop' || state.mode === 'lift') {
        const current = pose(state, time)
        if (current?.done) state.mode = state.mode === 'drop' ? 'rest' : 'gone'
        else moving = true
      }
    }
    let pouring = sauces.find(entry => entry.state === 'pouring')
    if (pouring && time - pouring.t0 >= pourTime) {
      pouring.state = 'rest'
      pouring = null
    }
    if (!pouring) {
      const next = sauces.find(entry => entry.state === 'queued')
      if (next && time >= next.t0) {
        next.state = 'pouring'
        next.t0 = time
        pouring = next
      }
    }
    // A replay's pitta waits for the last pour.
    const waiting = [...states.values()].find(state => state.mode === 'drop' && state.t0 === Infinity)
    if (waiting && !pouring && !sauces.some(entry => entry.state === 'queued')) waiting.t0 = time + 120
    for (const entry of sauces) {
      if (entry.state === 'fading' && time - entry.t0 >= 240) entry.state = 'dropped'
    }
    sauces = sauces.filter(entry => entry.state !== 'dropped')
    if (sauces.some(entry => entry.state !== 'rest')) moving = true
    return { moving, pouring }
  }

  function paint(time) {
    if (!loaded || !view.s) return
    const { moving, pouring } = step(time)
    foodContext.setTransform(1, 0, 0, 1, 0, 0)
    foodContext.clearRect(0, 0, food.width, food.height)
    const layers = sauces.filter(entry => entry.state === 'rest' || entry.state === 'fading').map(entry => ({
      layer: entry.layer,
      progress: entry.state === 'rest' ? 1 : entry.from,
      alpha: entry.state === 'rest' ? 1 : 1 - ease(clamp((time - entry.t0) / 240)),
    }))
    drawBox(foodContext, view, plan, item => pose(states.get(item.id), time), layers)
    const scale = pourView.scale ?? 1
    pourContext.setTransform(1, 0, 0, 1, 0, 0)
    pourContext.clearRect(0, 0, pour.width, pour.height)
    if (pouring) {
      pourContext.setTransform(scale, 0, 0, scale, pourView.ox * scale, pourView.oy * scale)
      paintSaucePour({
        context: pourContext, bottle, canvas: { style: {} }, traceDepth: 0, layer: pouring.layer,
        elapsed: time - pouring.t0, timings, width: pourView.s, canvasSize: 0, verticalRoom,
      })
      const label = pouring.layer.sauce.label
      setStatus('saucing', 'Adding ' + (label.startsWith('BBQ') ? label : label.toLowerCase()) + '…')
    } else {
      bottle.style.visibility = 'hidden'
      if (moving) setStatus('assembling', 'Adjusting your ' + recipe.name + '…')
      else setStatus('ready', 'Ready')
    }
    return moving
  }

  function tick() {
    frame = 0
    if (paint(now())) frame = requestAnimationFrame(tick)
  }

  function start() {
    if (!loaded) return
    if (!frame) frame = requestAnimationFrame(tick)
  }

  function settle() {
    for (const state of states.values()) state.mode = boxTargets(recipe, options, selection).groups.has(state.item.group) ? 'rest' : 'gone'
    sauces = sauceTargets().map(target => ({ ...target, state: 'rest' }))
    paint(now())
  }

  async function init({ profile, selection: selected = [], options: list = [] }) {
    setup()
    recipe = profile.recipe
    options = list
    selection = new Set(selected)
    stage.dataset.visual = 'box'
    stage.setAttribute('aria-label', profile.name + ' preview')
    let manifest
    try {
      manifest = await loadManifest(recipe.library)
    } catch {
      stage.dataset.boxMissing = 'true'
      return
    }
    plan = planBox(recipe, { ...manifest, libraryUrl: recipe.library })
    states.clear()
    for (const item of plan.items) states.set(item.id, { item, mode: 'gone', t0: 0 })
    await Promise.all(spriteSources(plan).map(loadImage))
    measureFoot(plan)
    stage.style.setProperty('--box-top', (plan.top - plan.foot).toFixed(3))
    loaded = true
    measure()
    settle()
  }

  function update(selected) {
    selection = new Set(selected)
    if (loaded) reconcile()
  }

  function replay() {
    if (!loaded) return
    if (reducedMotion.matches) {
      settle()
      return
    }
    for (const state of states.values()) state.mode = 'gone'
    sauces = []
    reconcile({ replay: true })
  }

  return { init, update, replay }
})()
