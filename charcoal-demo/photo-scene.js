// Photo scenes: a product shown in its approved photograph (the chicken shish
// boxes), with the chosen sauces squeezed over the food by the shared bottle
// from sauce-motion.js. Other choices do not change the photograph.
//
// State-driven: the sauces on the food always converge to the selection.
// New sauces queue and pour one at a time; a deselected sauce fades away,
// even mid-pour, so rapid taps never leave the picture out of step.
//
// A product opts in with `photo: { src, small, sauceArea, sauceAmounts }`:
// sauceArea is [left, top, right, bottom] of the food the sauce goes on, as
// shares of the photo; sauceAmounts maps option ids to 'little' or 'extra'.
import { paintSaucePour, paintSauceTrail, sauceProfiles, preloadSauceBottles, surfacePoint } from './sauce-motion.js'

const clamp = value => Math.max(0, Math.min(1, value))
const ease = value => value * value * (3 - 2 * value)

// How each sauce is squeezed over food seen from above. Creamy sauces go on
// as a full zigzag, burger sauce as one stripe down the middle, thinner
// sauces as a tighter, finer zigzag.
// thickness is the line's width as a share of the photo's width.
const sauceStyles = {
  'garlic-mayo': { path: 'drizzle', turns: 6, width: .74, thickness: .0135 },
  mayo: { path: 'drizzle', turns: 6, width: .74, thickness: .013 },
  'burger-sauce': { path: 'stripe', width: 0, thickness: .017 },
  ketchup: { path: 'drizzle', turns: 7, width: .66, thickness: .0085 },
  'bbq-sauce': { path: 'drizzle', turns: 7, width: .66, thickness: .0085 },
  'chilli-sauce': { path: 'drizzle', turns: 8, width: .68, thickness: .0075 },
  mustard: { path: 'drizzle', turns: 7, width: .62, thickness: .0075 },
}

function mix(a, b, share) {
  const parse = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16))
  const [x, y] = [parse(a), parse(b)]
  return 'rgb(' + x.map((value, index) => Math.round(value + (y[index] - value) * share)).join(',') + ')'
}

// A squeezed line seen from above: a soft darker edge, the sauce's own
// colour, a paler rounded crown and a broken specular highlight from the
// upper left, so it reads as a glossy bead lying on the food.
function paintGlossyTrail(context, layer, progress, alpha, width) {
  const count = Math.max(2, Math.round(layer.samples * progress))
  const points = []
  for (let index = 0; index < count; index++) {
    const t = progress * index / (count - 1)
    const p = surfacePoint(layer, width, t)
    const ends = Math.min(1, .25 + t * 14, .25 + (progress - t) * 30)
    const swell = 1 + .13 * Math.sin(t * 23 + layer.phase) + .07 * Math.sin(t * 61 + layer.phase * 2)
    points.push({ x: p.x, y: -p.y, w: layer.thickness * width * ends * swell, t })
  }
  const [edge, body, light] = layer.sauce.colours
  const pass = (colour, scale, opacity, dx = 0, dy = 0, keep = () => true) => {
    context.strokeStyle = colour
    context.globalAlpha = alpha * opacity
    for (let index = 1; index < points.length; index++) {
      const a = points[index - 1]
      const b = points[index]
      if (!keep(b)) continue
      context.lineWidth = Math.max(.6, b.w * scale)
      context.beginPath()
      context.moveTo(a.x + dx * a.w, a.y + dy * a.w)
      context.lineTo(b.x + dx * b.w, b.y + dy * b.w)
      context.stroke()
    }
  }
  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'
  const fine = Math.min(1, layer.thickness / .012)
  pass(edge, 1.08, .55)
  pass(edge, .95, .5)
  pass(body, .8, 1, -.02, -.02)
  pass(mix(body, light, .2 + fine * .25), .42, .3 + fine * .25, -.1, -.1)
  const shine = layer.sauce.shine
  pass(light, .16, .55 + shine * .4, -.2, -.22, ({ t }) => Math.sin(t * 47 + layer.phase) > -.35)
  pass('#ffffff', .07, shine * .5, -.22, -.24, ({ t }) => Math.sin(t * 31 + layer.phase) > .3)
  context.restore()
}

const timings = { enter: 240, pour: 900, exit: 215 }
const pourTime = timings.enter + timings.pour + timings.exit
const fadeTime = 260

// The sauces to show for a selection, in the order they were chosen. Each
// sauce choice keeps its own lane (a small shift and phase), so a line never
// moves when other sauces come and go.
function sauceTargets(photo, options, selectedIds) {
  const saucy = options.filter(option => (option.layerKeys ?? []).some(key => sauceProfiles[key]))
  return [...selectedIds].flatMap(id => {
    const option = saucy.find(choice => choice.id === id)
    if (!option) return []
    const sauceKey = option.layerKeys.find(key => sauceProfiles[key])
    return [{ id, sauceKey, lane: saucy.indexOf(option), amount: photo.sauceAmounts?.[id] ?? 'normal' }]
  })
}

// Rig units: x from the photo's centre, y up from its foot, both in photo widths.
function sauceLayers(target, photo, aspect) {
  const [left, top, right, bottom] = photo.sauceArea
  const style = sauceStyles[target.sauceKey] ?? sauceStyles.ketchup
  const profile = sauceProfiles[target.sauceKey]
  const span = right - left
  const lane = ((target.lane * 3) % 5 - 2)
  const centre = (left + right) / 2 - .5 + lane * span * .035
  const head = (1 - top) * aspect
  const length = (bottom - top) * aspect
  // Each lane slants a little differently and turns at its own rate, so two
  // sauces cross each other instead of running in step.
  const slant = [0, .05, -.06, .08, -.03][target.lane % 5] * span
  const layer = ({ share = 1, body = 1, phase = 0, inset = .06, turns = 0 } = {}) => ({
    key: target.sauceKey, path: style.path, turns: (style.turns + (target.lane % 3) - 1 + turns) * share, samples: 160, slant,
    offset: centre, width: span * style.width, phase: lane * .7 + phase,
    y: head - length * (inset + lane * .012), height: length * (1 - inset * 2) * share,
    thickness: style.thickness * body, sauce: { ...profile, body: profile.body * body }, paintTrail: paintGlossyTrail,
  })
  if (target.amount === 'little') return [layer({ share: .55, body: .7, inset: .14 })]
  if (target.amount === 'extra') return [layer({ body: 1.3 }), layer({ body: 1.1, phase: 2.2, turns: -1, share: .6, inset: .2 })]
  return [layer()]
}

export const PhotoScene = (() => {
  let stage
  let rig
  let bottle
  let status
  let image
  let canvas
  let context
  let buffer
  let bufferContext
  let photo
  let aspect = .642
  let options = []
  let selection = new Set()
  let view = { ox: 0, oy: 0, s: 1, scale: 1 }
  let frame = 0
  // Sauce passes: { key, layer, state: queued|pouring|rest|fading, t0, from }
  let sauces = []
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  const now = () => performance.now()

  function setStatus(phase, label) {
    stage.dataset.phase = phase
    if (status.textContent !== label) status.textContent = label
  }

  function measure() {
    const stageBox = stage.getBoundingClientRect()
    const rigBox = rig.getBoundingClientRect()
    if (!stageBox.width || !rigBox.width) return
    const scale = Math.min(devicePixelRatio || 1, 2)
    Object.assign(canvas.style, {
      left: stageBox.left - rigBox.left + 'px', top: stageBox.top - rigBox.top + 'px',
      width: stageBox.width + 'px', height: stageBox.height + 'px',
    })
    for (const surface of [canvas, buffer]) {
      surface.width = Math.round(stageBox.width * scale)
      surface.height = Math.round(stageBox.height * scale)
    }
    view = { ox: rigBox.left + rigBox.width / 2 - stageBox.left, oy: rigBox.bottom - stageBox.top, s: rigBox.width, scale }
  }

  function targets() {
    return sauceTargets(photo, options, selection).flatMap(target =>
      sauceLayers(target, photo, aspect).map((layer, pass) => ({ key: target.id + '#' + pass, layer })))
  }

  function progressOf(entry, time) {
    if (entry.state === 'rest') return 1
    if (entry.state === 'pouring') return ease(clamp((time - entry.t0 - timings.enter) / timings.pour))
    return entry.from ?? 0
  }

  function reconcile({ delay = 60 } = {}) {
    const time = now()
    const wanted = targets()
    const keys = new Set(wanted.map(({ key }) => key))
    for (const entry of sauces) {
      if (keys.has(entry.key) && entry.state !== 'fading') continue
      if (entry.state === 'queued') entry.state = 'dropped'
      else if (entry.state !== 'fading') {
        entry.from = progressOf(entry, time)
        entry.state = 'fading'
        entry.t0 = time
      }
    }
    const showing = new Set(sauces.filter(({ state }) => state !== 'fading' && state !== 'dropped').map(({ key }) => key))
    for (const target of wanted) {
      if (!showing.has(target.key)) sauces.push({ ...target, state: 'queued', t0: time + delay })
    }
    sauces = sauces.filter(({ state }) => state !== 'dropped')
    if (reducedMotion.matches) {
      sauces = wanted.map(target => ({ ...target, state: 'rest' }))
    }
    start()
  }

  // Advances the pour queue; returns the pour in progress and whether anything moves.
  function step(time) {
    let pouring = sauces.find(({ state }) => state === 'pouring')
    if (pouring && time - pouring.t0 >= pourTime) {
      pouring.state = 'rest'
      pouring = null
    }
    if (!pouring) {
      const next = sauces.find(({ state }) => state === 'queued')
      if (next && time >= next.t0) {
        next.state = 'pouring'
        next.t0 = time
        pouring = next
      }
    }
    for (const entry of sauces) if (entry.state === 'fading' && time - entry.t0 >= fadeTime) entry.state = 'dropped'
    sauces = sauces.filter(({ state }) => state !== 'dropped')
    return { pouring, moving: sauces.some(({ state }) => state !== 'rest') }
  }

  function paint(time) {
    if (!view.s) return false
    const { pouring, moving } = step(time)
    const { ox, oy, s, scale } = view
    // The sauce is painted on its own layer, then laid on the photo with a
    // soft shadow so it sits on the food rather than floating over it.
    bufferContext.setTransform(1, 0, 0, 1, 0, 0)
    bufferContext.clearRect(0, 0, buffer.width, buffer.height)
    bufferContext.setTransform(scale, 0, 0, scale, ox * scale, oy * scale)
    for (const entry of sauces) {
      if (entry.state === 'rest') paintSauceTrail(bufferContext, entry.layer, 1, 1, s, 0)
      else if (entry.state === 'fading') {
        paintSauceTrail(bufferContext, entry.layer, entry.from, 1 - ease(clamp((time - entry.t0) / fadeTime)), s, 0)
      }
    }
    if (pouring) {
      paintSaucePour({
        context: bufferContext, bottle, canvas: { style: {} }, traceDepth: 0, layer: pouring.layer,
        elapsed: time - pouring.t0, timings, width: s, canvasSize: 0, verticalRoom: s * 2,
      })
      const label = pouring.layer.sauce.label
      setStatus('saucing', 'Adding ' + (label.startsWith('BBQ') ? label : label.toLowerCase()) + '…')
    } else {
      bottle.style.visibility = 'hidden'
      setStatus(moving ? 'assembling' : 'ready', moving ? 'Adjusting your order…' : 'Ready')
    }
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.save()
    context.shadowColor = 'rgba(28, 14, 6, .5)'
    context.shadowBlur = 3 * scale
    context.shadowOffsetY = 1.5 * scale
    context.drawImage(buffer, 0, 0)
    context.restore()
    return moving || Boolean(pouring)
  }

  function tick() {
    frame = 0
    if (paint(now())) frame = requestAnimationFrame(tick)
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(tick)
  }

  function showPhoto() {
    image.classList.remove('is-entering')
    if (reducedMotion.matches) return
    void image.offsetWidth
    image.classList.add('is-entering')
  }

  function init({ profile, selection: selected = [], options: list = [] }) {
    stage = document.querySelector('#stage')
    rig = document.querySelector('#rig')
    bottle = document.querySelector('#bottle')
    status = document.querySelector('#status')
    photo = profile.photo
    aspect = photo.height / photo.width
    options = list
    selection = new Set(selected)
    stage.dataset.visual = 'shish-photo'
    stage.setAttribute('aria-label', profile.name + ' preview')
    image = document.createElement('img')
    image.className = 'stage-photo'
    image.alt = ''
    image.decoding = 'async'
    image.width = photo.width
    image.height = photo.height
    image.srcset = photo.small + ' 700w, ' + photo.src + ' 1400w'
    image.sizes = '(min-width: 900px) 760px, 100vw'
    image.src = photo.src
    canvas = document.createElement('canvas')
    canvas.className = 'stage-sauce'
    context = canvas.getContext('2d')
    buffer = document.createElement('canvas')
    bufferContext = buffer.getContext('2d')
    rig.prepend(image)
    rig.append(canvas)
    if (!reducedMotion.matches) preloadSauceBottles(Object.keys(sauceStyles).map(key => ({ sauce: sauceProfiles[key] })))
    showPhoto()
    measure()
    // Sauces already chosen (e.g. after "Make another") are shown at rest.
    sauces = targets().map(target => ({ ...target, state: 'rest' }))
    paint(now())
    new ResizeObserver(() => {
      measure()
      paint(now())
    }).observe(stage)
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) reconcile()
    })
  }

  function update(selected) {
    selection = new Set(selected)
    reconcile()
  }

  function replay() {
    showPhoto()
    sauces = []
    reconcile({ delay: reducedMotion.matches ? 0 : 320 })
  }

  return { init, update, replay }
})()
