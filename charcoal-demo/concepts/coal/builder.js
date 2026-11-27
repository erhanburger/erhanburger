// Customise screen: tiles are the controls, the board shows the result.
import { catalog, formatPrice, getUnitPricePence, createDefaultSelections, findProduct, optionConflicts } from '../../catalog.js'
import { compose, extent, paintLayer, tileImage, layerHeight } from './compose.js'
import { setupChrome, make } from './shared.js'
import { readBasket } from '../../basket-storage.js'

const params = new URLSearchParams(location.search)
const found = findProduct(params.get('product') ?? 'half-pounder-with-cheese')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const $ = id => document.getElementById(id)
const page = document.body
const stage = $('main')
const rig = $('rig')
const status = $('stage-status')
const orderBtn = $('order-btn')
const orderLabel = $('order-label')
const orderPrice = $('order-price')
const orderNote = $('order-note')
const LIFT = .36 // how far the lid floats above the stack while you choose

const { basket } = setupChrome({
  keepBrowsingHref: './menu.html' + (found ? '#' + found.product.categoryId : ''),
})

if (!found) {
  document.title = 'Item not found · Er-Han Burger'
  $('product-category').textContent = 'Menu'
  $('product-title').textContent = 'Item not found'
  $('product-price').textContent = ''
  $('groups').replaceChildren(make('p', 'muted', 'We couldn’t find that item. It may have been renamed or removed.'))
  orderLabel.textContent = 'Browse the menu'
  orderPrice.textContent = ''
  orderBtn.addEventListener('click', () => { location.href = './menu.html' })
  $('replay').hidden = true
  status.textContent = ''
} else {
  run(found.product, found.preset)
}

function run(product, preset) {
  const options = product.optionGroups.flatMap(group => group.options)
  const byId = new Map(options.map(option => [option.id, option]))
  const groupOf = new Map(product.optionGroups.flatMap(group => group.options.map(option => [option.id, group])))
  const conflicts = new Map()
  for (const [a, b] of optionConflicts) {
    if (!byId.has(a) || !byId.has(b)) continue
    conflicts.set(a, [...(conflicts.get(a) ?? []), b])
    conflicts.set(b, [...(conflicts.get(b) ?? []), a])
  }
  const selected = createDefaultSelections(product, preset)
  const controls = new Map()
  const category = catalog.categories.find(({ id }) => id === product.categoryId)
  let closed = false
  let price = getUnitPricePence(product, selected)
  let comp

  document.title = product.name + ' · Customise · Er-Han Burger'
  const deal = product.name.match(/^(Deal \d+) – (.+)$/)
  $('product-category').textContent = (deal ? deal[1] + ' · ' : '') + (category?.name ?? 'Menu')
  // "Deal 2 – Half Burger, Chips & Drink": the deal number becomes the label.
  $('product-title').textContent = deal ? deal[2] : product.name
  rig.setAttribute('aria-label', 'Preview of your ' + product.name)
  $('panel-title').textContent = product.optionGroups.length ? 'Customise yours' : 'Ready as it is'
  $('panel-description').textContent = product.builderDescription ??
    (product.optionGroups.length ? 'Tap an ingredient to add it to the board. Tap again to take it off.' : 'Nothing to choose. Add it to your basket.')

  // Choice groups ------------------------------------------------------------
  const groups = $('groups')
  for (const group of product.optionGroups) {
    if (group.options.every(option => option.locked)) {
      // Shown as a quiet line under the title rather than a tile nobody can change.
      $('product-price').parentElement.after(make('p', 'included', 'Included: ' + group.options.map(o => o.name.toLowerCase()).join(', ')))
      continue
    }
    const section = make('section', 'group')
    section.id = 'group-' + group.id
    section.setAttribute('role', 'group')
    const head = make('div', 'group-head')
    const title = make('h2', '', group.name)
    title.id = section.id + '-title'
    section.setAttribute('aria-labelledby', title.id)
    const hint = group.min ? 'Required' : group.max === 1 ? 'Choose one' : 'Optional'
    head.append(title, make('span', 'label' + (group.min ? ' label--ember' : ''), hint))
    section.append(head)

    const pictured = group.display === 'photos' ? group.options.filter(o => tileImage(o)) : []
    const worded = group.options.filter(o => !pictured.includes(o))
    if (pictured.length) {
      const list = make('ul', 'tiles')
      for (const option of pictured) {
        const art = tileImage(option)
        const button = make('button', 'tile')
        button.type = 'button'
        const well = make('span', 'tile-well' + (art.kind ? ' tile-well--' + art.kind : ''))
        const img = new Image()
        img.src = art.src
        img.alt = ''
        img.loading = 'lazy'
        img.decoding = 'async'
        well.append(img)
        button.append(well, make('span', 'tile-name', option.name))
        if (option.pricePence) button.append(make('span', 'tile-delta', '+' + formatPrice(option.pricePence)))
        button.setAttribute('aria-label', option.name + (option.pricePence ? ', add ' + formatPrice(option.pricePence) : ''))
        wire(button, group, option)
        const item = make('li')
        item.append(button)
        list.append(item)
      }
      section.append(list)
    }
    if (worded.length) {
      const list = make('ul', 'chips-row')
      if (pictured.length) list.style.marginTop = 'var(--s-3)'
      for (const option of worded) {
        const button = make('button', 'choice-chip', option.name + (option.pricePence ? ' +' + formatPrice(option.pricePence) : ''))
        button.type = 'button'
        wire(button, group, option)
        const item = make('li')
        item.append(button)
        list.append(item)
      }
      section.append(list)
    }
    groups.append(section)
  }
  if (!product.optionGroups.length) {
    const back = make('a', 'btn btn--ghost', 'Back to ' + (category?.name.toLowerCase() ?? 'the menu'))
    back.href = './menu.html#' + product.categoryId
    groups.append(back)
  }

  function wire(button, group, option) {
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', () => choose(group, option))
    controls.set(option.id, button)
  }

  function choose(group, option) {
    const cleared = []
    let added = true
    if (selected.has(option.id)) {
      if (group.min === 1 && group.max === 1) return
      selected.delete(option.id)
      added = false
    } else {
      const active = group.options.filter(choice => selected.has(choice.id))
      if (active.length >= group.max) {
        if (group.max !== 1) { say('Choose up to ' + group.max + ' from ' + group.name.toLowerCase() + '.'); return }
        selected.delete(active[0].id)
      }
      for (const id of conflicts.get(option.id) ?? []) if (selected.delete(id)) cleared.push(byId.get(id).name)
      selected.add(option.id)
    }
    setError(group, '')
    say(option.name + (added ? ' on' : ' off') + (cleared.length ? ' · ' + cleared.join(', ') + ' off' : ''))
    reopen()
    refresh()
    draw()
  }

  function say(text) {
    status.textContent = text
  }

  function setError(group, message) {
    const section = $('group-' + group.id)
    if (!section) return
    section.querySelector('.group-error')?.remove()
    section.toggleAttribute('data-invalid', Boolean(message))
    if (!message) return
    const error = make('p', 'group-error', message)
    error.setAttribute('role', 'alert')
    section.querySelector('.group-head').after(error)
  }

  function refresh() {
    for (const [id, button] of controls) button.setAttribute('aria-pressed', String(selected.has(id)))
    const next = getUnitPricePence(product, selected)
    if (next !== price) {
      const delta = next - price
      const tag = make('span', 'delta' + (delta < 0 ? ' delta--minus' : ''), (delta > 0 ? '+' : '−') + formatPrice(Math.abs(delta)))
      $('price-delta').replaceChildren(tag)
    }
    price = next
    $('product-price').textContent = formatPrice(price)
    if (orderBtn.dataset.state === 'add') orderPrice.textContent = formatPrice(price)
  }

  // The board ----------------------------------------------------------------
  const nodes = new Map()
  function draw({ initial = false } = {}) {
    comp = compose(product, selected)
    const ids = new Set(comp.layers.map(l => l.id))
    for (const [id, img] of nodes) {
      if (ids.has(id)) continue
      nodes.delete(id)
      img.classList.remove('is-dropping')
      img.classList.add('is-leaving')
      setTimeout(() => img.remove(), 260)
    }
    let order = 0
    for (const l of comp.layers) {
      const lid = l.id === comp.lid
      const placed = lid && !closed ? { ...l, y: l.y + lift(l), rot: -4 } : l
      let img = nodes.get(l.id)
      const fresh = !img
      if (fresh) {
        img = new Image()
        nodes.set(l.id, img)
        rig.append(img)
      }
      paintLayer(img, placed)
      if (fresh) {
        img.style.setProperty('--delay', initial && !reduced.matches ? order++ * 85 + 'ms' : '0ms')
        img.classList.add('is-dropping')
        img.addEventListener('animationend', () => img.classList.remove('is-dropping'), { once: true })
      }
    }
    fit()
  }

  // The lid floats in proportion to its own size, a little less on small screens.
  function lift(lid) {
    return LIFT * (lid.w / .98) * (stage.clientWidth < 600 ? .8 : 1)
  }

  function fit() {
    if (!comp) return
    const box = stage.getBoundingClientRect()
    const title = stage.querySelector('.stage-title').getBoundingClientRect()
    const wide = box.width >= 600
    const span = Math.max(1.42, ...comp.layers.map(l => Math.abs(l.x) * 2 + l.w))
    const room = box.height * .94 - (title.bottom - box.top) - (wide ? 40 : 30)
    const lidLayer = comp.layers.find(l => l.id === comp.lid)
    const tall = extent(comp, closed || !lidLayer ? 0 : lift(lidLayer)) + .2
    const W = Math.max(90, Math.min(box.width * (wide ? .8 : .92) / span, room / tall, wide ? 440 : 300))
    stage.style.setProperty('--W', W + 'px')
    rig.style.setProperty('--W', W + 'px')
    const lid = comp.layers.find(l => l.id === comp.lid)
    const top = lid ? lid.y + layerHeight(lid) * .7 : extent(comp)
    $('steam').style.bottom = `calc(6% + ${W * .2 + top * W}px)`
  }
  new ResizeObserver(fit).observe(stage)

  function reopen() {
    if (orderBtn.dataset.state !== 'add') setButton('add')
    stage.dataset.phase = 'build'
    page.dataset.phase = 'build'
    closed = false
  }

  // Ordering and the ready moment -------------------------------------------
  function setButton(state, extra) {
    orderBtn.dataset.state = state
    if (state === 'add') {
      orderLabel.textContent = 'Add to basket'
      orderPrice.textContent = formatPrice(price)
      orderNote.textContent = ''
    } else if (state === 'adding') {
      orderLabel.textContent = 'Lid on…'
      orderPrice.textContent = ''
    } else if (state === 'added') {
      orderLabel.textContent = '✓ Added to basket'
      orderPrice.textContent = ''
    } else if (state === 'view') {
      orderLabel.textContent = 'View basket · ' + extra.count + (extra.count === 1 ? ' item' : ' items')
      orderPrice.textContent = extra.total
    }
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, reduced.matches ? Math.min(ms, 60) : ms))

  async function add() {
    const state = orderBtn.dataset.state
    if (state === 'view') { basket.open(); return }
    if (state !== 'add') return
    const missing = product.optionGroups.find(group => group.options.filter(o => selected.has(o.id)).length < (group.min ?? 0))
    if (missing) {
      const message = missing.requiredMessage ?? 'Please choose ' + missing.name.toLowerCase() + '.'
      setError(missing, message)
      say(message)
      const section = $('group-' + missing.id)
      section.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' })
      section.querySelector('button')?.focus({ preventScroll: true })
      return
    }
    const choices = options.filter(o => selected.has(o.id) && !o.locked)
    const line = {
      productId: product.id, name: product.name, unitPricePence: price,
      optionIds: choices.map(o => o.id), options: choices.map(o => o.name),
    }
    setButton('adding')
    page.dataset.phase = 'adding'
    say('Lid on')
    closed = true
    draw()
    nodes.get(comp.lid)?.classList.add('is-closing')
    await wait(380)
    nodes.get(comp.lid)?.classList.remove('is-closing')
    basket.addQuietly(line)
    stage.dataset.phase = 'ready'
    page.dataset.phase = 'ready'
    say('Grilled to order · in your basket')
    setButton('added')
    await wait(1100)
    if (orderBtn.dataset.state !== 'added') return
    const lines = readBasket()
    const count = lines.reduce((sum, l) => sum + l.quantity, 0)
    const total = formatPrice(lines.reduce((sum, l) => sum + l.quantity * l.unitPricePence, 0))
    setButton('view', { count, total })
    orderNote.replaceChildren('Added. ', anotherButton())
  }

  function anotherButton() {
    const button = make('button', '', 'Make another')
    button.type = 'button'
    button.addEventListener('click', () => {
      reopen()
      draw()
      say('Same again? Change anything you like')
      orderBtn.focus()
    })
    return button
  }

  orderBtn.addEventListener('click', add)
  $('replay').hidden = comp?.kind === 'single' || !product.optionGroups.length
  $('replay').addEventListener('click', () => {
    for (const img of nodes.values()) img.remove()
    nodes.clear()
    draw({ initial: true })
  })

  refresh()
  draw({ initial: true })
  $('replay').hidden = comp.kind === 'single'
}
