'use strict'

const ingredients = [
  { id: 'beef', label: 'Izgara dana köftesi', width: 61, rise: 8 },
  { id: 'cheese', label: 'Cheddar peyniri', width: 58, rise: 3 },
  { id: 'lettuce', label: 'Marul', width: 64, rise: 5 },
  { id: 'tomato', label: 'Domates', width: 57, rise: 4 },
  { id: 'cucumber', label: 'Salatalık', width: 56, rise: 3 },
  { id: 'pickle', label: 'Salatalık turşusu', width: 56, rise: 3 },
  { id: 'onion', label: 'Kırmızı soğan', width: 58, rise: 3 },
]
const sauces = [
  { id: 'burger-sauce', label: 'Burger sosu', width: 38, rise: 1.5, sauce: true },
  { id: 'ketchup', label: 'Ketçap', width: 38, rise: 1.5, sauce: true },
  { id: 'mayo', label: 'Mayonez', width: 38, rise: 1.5, sauce: true },
]
const base = { id: 'bun', label: 'Alt ekmek', width: 60, rise: 10 }
const topBun = { id: 'top', label: 'Üst ekmek', width: 63, rise: 0 }
const defaults = ['beef', 'cheese', 'lettuce', 'pickle', 'burger-sauce']
const ingredientOrder = [base, ...ingredients, ...sauces, topBun]
const assetUrl = id => './assets/' + id + '.webp'
const restingPosition = 'translateX(-50%)'
const liftedPosition = 'translate(-94%, -37px)'

const scene = document.querySelector('#scene')
const stack = document.querySelector('#stack')
const dispenser = document.querySelector('#dispenser')
const bottle = dispenser.querySelector('img')
const stream = document.querySelector('#stream')
const options = document.querySelector('#ingredients')
const replay = document.querySelector('#replay')
const reset = document.querySelector('#reset')
const count = document.querySelector('#count')
const announcement = document.querySelector('#announcement')
const stageStatus = document.querySelector('#stage-status')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const controls = new Map()
const sprites = new Map()
let selected = new Set(defaults)
let activeRun

function createControls() {
  function addChoice(parent, ingredient, compact = false) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = compact ? 'ingredient sauce-choice' : 'ingredient'
    button.disabled = true
    const image = new Image()
    image.src = assetUrl(ingredient.id)
    image.alt = ''
    image.draggable = false
    const label = document.createElement('span')
    label.textContent = ingredient.label
    const mark = document.createElement('span')
    mark.className = 'ingredient-mark'
    mark.setAttribute('aria-hidden', 'true')
    button.append(image, label, mark)
    button.addEventListener('click', () => changeSelection(ingredient, compact))
    parent.append(button)
    controls.set(ingredient.id, { button, mark })
  }

  ingredients.forEach(ingredient => addChoice(options, ingredient))
  const sauceGroup = document.createElement('div')
  sauceGroup.className = 'sauce-group'
  sauceGroup.setAttribute('role', 'group')
  sauceGroup.setAttribute('aria-label', 'Soslar')
  sauces.forEach(sauce => addChoice(sauceGroup, sauce, true))
  options.append(sauceGroup)
}

function updateControls() {
  for (const [id, { button, mark }] of controls) {
    const pressed = selected.has(id)
    button.setAttribute('aria-pressed', String(pressed))
    mark.textContent = pressed ? '✓' : '+'
  }
  count.textContent = selected.size
  const labels = ingredientOrder.filter(({ id }) => selected.has(id)).map(({ label }) => label)
  scene.setAttribute('aria-label', labels.length ? 'Burger: ' + labels.join(', ') : 'Alt ve üst burger ekmeği')
}

function updatePhase(phase, message) {
  scene.dataset.phase = phase
  stageStatus.textContent = message
}

function configureSprite(sprite, item, level, index) {
  sprite.style.setProperty('--level', level)
  sprite.style.setProperty('--width', item.width)
  sprite.style.zIndex = String(index + 1)
}

function scenePlan(selection) {
  let level = 0
  return ingredientOrder
    .filter(item => item === base || item === topBun || selection.has(item.id))
    .map((item, index) => {
      const entry = { item, level, index }
      level += item.rise
      return entry
    })
}

function put(entry) {
  const { item, level, index } = entry
  const sprite = sprites.get(item.id)
  configureSprite(sprite, item, level, index)
  stack.append(sprite)
  return sprite
}

function settle(selection) {
  stack.replaceChildren()
  scenePlan(selection).forEach(put)
}

function animate(sprite, keyframes, options, signal) {
  signal.throwIfAborted()
  const animation = sprite.animate(keyframes, { fill: 'both', ...options })
  const cancel = () => animation.cancel()
  signal.addEventListener('abort', cancel, { once: true })

  return animation.finished.then(() => {
    signal.throwIfAborted()
  }).finally(() => {
    signal.removeEventListener('abort', cancel)
    animation.cancel()
  })
}

function drop(entry, signal, delay = 0) {
  const sprite = put(entry)
  const offset = entry.item === topBun ? 0 : entry.index % 2 ? 9 : -9
  return animate(sprite, [
    { opacity: 0, transform: 'translate(-50%, -115px) rotate(' + offset + 'deg)', easing: 'cubic-bezier(.45,0,1,1)' },
    { opacity: 1, offset: .22, transform: 'translate(-50%, -92px) rotate(' + offset * .7 + 'deg)', easing: 'cubic-bezier(.55,.08,.88,.57)' },
    { opacity: 1, offset: .79, transform: 'translateX(-50%) scaleY(.95)', easing: 'ease-out' },
    { opacity: 1, offset: .91, transform: 'translate(-50%, -4px) scaleY(1.015)', easing: 'ease-in' },
    { opacity: 1, transform: 'translateX(-50%)' },
  ], { duration: entry.item === topBun ? 385 : 315, delay }, signal)
}

function exit(sprite, signal) {
  return animate(sprite, [
    { transform: 'translateX(-50%)', opacity: 1 },
    { transform: 'translate(-86%, -42px) rotate(-9deg)', opacity: 0 },
  ], { duration: 190, easing: 'ease-in' }, signal).then(() => sprite.remove())
}

function lift(entry, signal) {
  const sprite = sprites.get(entry.item.id)
  return animate(sprite, [
    { transform: restingPosition },
    { transform: liftedPosition },
  ], { duration: 210, easing: 'ease-out' }, signal).then(() => {
    sprite.style.transform = liftedPosition
  })
}

function returnLayer(sprite, entry, signal) {
  const previousLevel = sprite.getBoundingClientRect().top
  configureSprite(sprite, entry.item, entry.level, entry.index)
  sprite.style.transform = ''
  const delta = previousLevel - sprite.getBoundingClientRect().top
  return animate(sprite, [
    { transform: 'translate(-94%, ' + delta + 'px)' },
    { transform: restingPosition },
  ], { duration: 275, easing: 'cubic-bezier(.45,.05,.33,1)' }, signal)
}

function shift(sprite, entry, signal) {
  const position = sprite.getBoundingClientRect().top
  configureSprite(sprite, entry.item, entry.level, entry.index)
  const delta = position - sprite.getBoundingClientRect().top
  if (Math.abs(delta) < 1) return Promise.resolve()
  return animate(sprite, [
    { transform: 'translate(-50%, ' + delta + 'px)' },
    { transform: 'translateX(-50%)' },
  ], { duration: 220, easing: 'cubic-bezier(.25,.65,.32,1)' }, signal)
}

async function applySauce(entry, signal) {
  updatePhase('sauce', entry.item.label + ' sıkılıyor')
  const trace = put(entry)
  const surface = trace.offsetHeight * .40 + 'px'
  for (const prop of [dispenser, stream]) {
    prop.style.setProperty('--level', entry.level)
    prop.style.setProperty('--surface-height', surface)
  }
  stream.style.backgroundImage = 'url("' + assetUrl(entry.item.id + '-stream') + '")'
  trace.style.visibility = 'hidden'
  dispenser.style.opacity = '1'
  // The bottle uses a bottom-centered downward tip, matching the stream.
  try {
    await animate(dispenser, [
      { left: '90%', opacity: 0, transform: 'translate(-50%, -78px) rotate(12deg)' },
      { left: '36%', opacity: 1, transform: 'translateX(-50%)' },
    ], { duration: 315, easing: 'ease-out' }, signal)
    dispenser.style.setProperty('--nozzle-x', '36%')
    trace.style.visibility = ''
    await Promise.all([
      animate(dispenser, [
        { left: '36%' }, { left: '47%' }, { left: '52%' }, { left: '64%' },
      ], { duration: 650, easing: 'ease-in-out' }, signal),
      animate(bottle, [
        { transform: 'scaleX(1)' }, { transform: 'scaleX(.92)' }, { transform: 'scaleX(.96)' }, { transform: 'scaleX(.91)' }, { transform: 'scaleX(1)' },
      ], { duration: 650 }, signal),
      animate(stream, [
        { left: '36%', opacity: 0, transform: 'translateX(-50%) scaleY(.12)' },
        { left: '37%', opacity: 1, transform: 'translateX(-50%) scaleY(1)', offset: .08 },
        { left: '47%', opacity: 1, transform: 'translateX(-50%) scaleY(.94)', offset: 1 / 3 },
        { left: '52%', opacity: 1, transform: 'translateX(-50%) scaleY(1)', offset: 2 / 3 },
        { left: '63%', opacity: 1, transform: 'translateX(-50%) scaleY(.95)', offset: .94 },
        { left: '64%', opacity: 0, transform: 'translateX(-50%) scaleY(.18)' },
      ], { duration: 650, easing: 'ease-in-out' }, signal),
      animate(trace, [
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)' },
      ], { duration: 650, easing: 'ease-in-out' }, signal),
    ])
    await animate(dispenser, [
      { left: '64%', opacity: 1, transform: 'translateX(-50%)' },
      { left: '90%', opacity: 0, transform: 'translate(-50%, -80px) rotate(14deg)' },
    ], { duration: 240, easing: 'ease-in' }, signal)
  } finally {
    // An old run must leave a newly started sauce animation alone.
    if (!signal.aborted) {
      dispenser.style.opacity = '0'
      trace.style.visibility = ''
    }
  }
}

function launch(from, target, changedId) {
  activeRun?.abort()
  activeRun = new AbortController()
  const { signal } = activeRun
  scene.dataset.changedIngredient = changedId || ''
  dispenser.style.opacity = '0'
  for (const sprite of sprites.values()) {
    sprite.style.visibility = ''
    sprite.style.transform = ''
  }
  if (reducedMotion.matches) {
    settle(target)
    updatePhase('ready', 'Burgerin hazır')
    return
  }

  async function build() {
    const plan = scenePlan(target)
    const top = plan.at(-1)
    const sauce = plan.find(entry => entry.item.sauce)
    const selectedNewSauce = sauce && (!from || !from.has(sauce.item.id))
    updatePhase('layers', 'Katmanlar yerleşiyor')

    if (from) {
      settle(from)
      const ingredientIndex = ingredientOrder.findIndex(({ id }) => id === changedId)
      // Clear the slot for the ingredient being edited before it moves through the stack.
      const raised = plan.slice(0, -1).filter(({ item }) =>
        ingredientIndex > 0 && from.has(item.id) && ingredientOrder.indexOf(item) > ingredientIndex)
      await Promise.all([
        exit(sprites.get(topBun.id), signal),
        ...raised.map(entry => lift(entry, signal)),
      ])
      const discarded = scenePlan(from)
        .filter(({ item }) => item !== base && item !== topBun && !target.has(item.id))
      await Promise.all(discarded.map(({ item }) => exit(sprites.get(item.id), signal)))
      await Promise.all(plan.slice(0, -1).filter(entry => !raised.includes(entry)).map(entry => {
        const { item } = entry
        if (item === base || from.has(item.id)) return shift(sprites.get(item.id), entry, signal)
        if (item.sauce) return Promise.resolve()
        return drop(entry, signal)
      }))
      await Promise.all(raised.map(entry => returnLayer(sprites.get(entry.item.id), entry, signal)))
    } else {
      stack.replaceChildren()
      await Promise.all(plan.filter(entry => entry !== top && !entry.item.sauce)
        .map((entry, index) => drop(entry, signal, index * 152)))
    }

    if (selectedNewSauce) await applySauce(sauce, signal)
    signal.throwIfAborted()
    updatePhase('closing', 'Üst ekmek kapanıyor')
    await drop(top, signal)
    updatePhase('ready', 'Burgerin hazır')
  }

  build().catch(error => {
    if (signal.aborted) return
    console.error(error)
    settle(target)
    updatePhase('ready', 'Burgerin hazır')
  })
}

function changeSelection(ingredient, sauce) {
  const previous = selected
  const next = new Set(previous)
  const adding = !next.has(ingredient.id)
  if (sauce) sauces.forEach(({ id }) => next.delete(id))
  if (adding) next.add(ingredient.id)
  else next.delete(ingredient.id)
  selected = next
  updateControls()
  announcement.textContent = ingredient.label + (adding ? ' eklendi.' : ' çıkarıldı.')
  launch(previous, selected, ingredient.id)
}

function prepareSprite(item) {
  const sprite = new Image()
  sprite.src = assetUrl(item.id)
  sprite.alt = ''
  sprite.draggable = false
  sprite.className = 'sprite'
  sprite.dataset.layer = item.id
  sprites.set(item.id, sprite)
  return sprite.decode()
}

createControls()
updateControls()
replay.addEventListener('click', () => launch(null, selected))
reset.addEventListener('click', () => {
  selected = new Set(defaults)
  updateControls()
  announcement.textContent = 'Başlangıç malzemeleri geri yüklendi.'
  launch(null, selected)
})
reducedMotion.addEventListener('change', () => {
  if (activeRun) launch(selected, selected)
})
const streamDecodes = sauces.map(sauce => {
  const image = new Image()
  image.src = assetUrl(sauce.id + '-stream')
  return image.decode()
})
Promise.all([...ingredientOrder.map(prepareSprite), bottle.decode(), ...streamDecodes]).then(() => {
  controls.forEach(({ button }) => { button.disabled = false })
  replay.disabled = false
  reset.disabled = false
  launch(null, selected)
}).catch(error => {
  console.error(error)
  updatePhase('error', 'Görseller yüklenemedi')
  announcement.textContent = 'Görseller yüklenemedi. Sayfayı yeniden yüklemeyi dene.'
})
