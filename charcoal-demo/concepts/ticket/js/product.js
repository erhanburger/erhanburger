import {
  halfPounder, findProduct, createDefaultSelections, formatPrice, getUnitPricePence,
  tileImage, categoryName, conflictMap, asset,
} from './data.js'
import { createFood } from './food.js'
import { initShell, store, bump } from './ticket.js'

const shell = initShell({ active: 'build' })
const param = new URLSearchParams(location.search).get('product')
const match = param === null ? { product: halfPounder, preset: [] } : findProduct(param)
const $ = selector => document.querySelector(selector)
const builder = $('[data-builder]')

if (!match) {
  $('#product-title').textContent = 'Item not found'
  $('[data-category]').textContent = 'Sorry'
  $('.b-stage').innerHTML = '<div style="padding:var(--s-5);display:grid;gap:var(--s-3);align-content:center;height:100%"><p class="tv-lead">We couldn’t find that item.</p><p>It may have been renamed or removed from the menu.</p><a class="btn btn--ink" href="./menu.html" style="justify-self:start">Browse the menu</a></div>'
  $('.b-order').hidden = true
  document.title = 'Item not found · Er-Han Burger'
} else {
  run(match.product, match.preset)
}

function run(product, preset) {
  const selected = createDefaultSelections(product, preset)
  const options = product.optionGroups.flatMap(group => group.options)
  const byId = new Map(options.map(option => [option.id, option]))
  const conflicts = conflictMap(product)
  const groupOf = new Map(product.optionGroups.flatMap(group => group.options.map(option => [option.id, group])))
  const controls = new Map()
  const feedback = $('[data-feedback]')
  const status = $('[data-status]')
  const addButton = $('[data-add]')
  const addLabel = $('[data-add-label]')
  const addPrice = $('[data-add-price]')
  const food = createFood($('[data-food]'), product, { mode: 'stage', lidOpen: true })
  let phase = 'build' // build | finishing | added
  let lastPrice = getUnitPricePence(product, selected)

  // ---- heading ----
  const name = product.name
  const title = $('#product-title')
  const dash = name.indexOf(' – ')
  const withAt = name.search(/ (?=with )/i)
  const [first, sep, rest] = product.titleLines ? [product.titleLines[0], ' ', product.titleLines[1]] :
    dash >= 0 ? [name.slice(0, dash), ' – ', name.slice(dash + 3)] :
    withAt >= 0 ? [name.slice(0, withAt), ' ', name.slice(withAt + 1)] : [name]
  title.replaceChildren(first)
  if (rest) {
    const hidden = document.createElement('span')
    hidden.className = 'visually-hidden'
    hidden.textContent = sep
    const em = document.createElement('em')
    em.textContent = rest
    title.append(hidden, document.createElement('br'), em)
  }
  document.title = name + ' · Er-Han Burger'
  $('[data-category]').textContent = categoryName(product.categoryId)
  $('[data-back]').href = './menu.html#' + product.categoryId
  $('[data-back]').setAttribute('aria-label', 'Back to ' + categoryName(product.categoryId).toLowerCase())
  for (const link of document.querySelectorAll('[data-tab="build"]')) link.href = location.pathname.split('/').pop() + location.search
  $('.b-stage').setAttribute('aria-label', 'Preview of your ' + name)
  $('.b-stage').setAttribute('role', 'img')

  // ---- groups ----
  const lockedGroups = product.optionGroups.filter(group => group.options.every(option => option.locked))
  const groups = product.optionGroups.filter(group => !lockedGroups.includes(group))
  const intro = $('[data-intro]')
  intro.textContent = product.builderDescription ?? (groups.length ? 'Tap a choice and watch it land. The price updates as you go.' : 'Nothing to choose. Add it to your ticket.')
  if (lockedGroups.length) intro.textContent += ' Comes with: ' + lockedGroups.flatMap(group => group.options.map(option => option.name.toLowerCase())).join(', ') + '.'
  const tabs = $('[data-tabs]')
  const panels = $('[data-groups]')
  const tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  const requiredFirst = groups.find(group => group.min > 0 && !group.defaultOptionIds)
  let activeGroup = requiredFirst ?? groups[0]
  if (!groups.length) { tabs.hidden = true }

  for (const group of groups) {
    const required = group.min > 0 && !group.defaultOptionIds
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'chip'
    tab.id = 'tab-' + group.id
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', 'group-' + group.id)
    tab.innerHTML = '<span></span>' + (required ? '<span class="req" aria-hidden="true"></span>' : '')
    tab.firstChild.textContent = group.name
    if (required) tab.setAttribute('aria-label', group.name + ', required')
    tab.addEventListener('click', () => showGroup(group, true))
    tabs.append(tab)

    const panel = document.createElement('section')
    panel.className = 'b-group'
    panel.id = 'group-' + group.id
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', 'tab-' + group.id)
    const head = document.createElement('div')
    head.className = 'b-group-head'
    head.innerHTML = '<h2></h2>' + (required ? '<span class="req-tag">Required</span>' : '')
    head.firstChild.textContent = group.name
    panel.append(head)
    const note = group.max === 1 && group.min === 1 ? (group.options.every(option => !option.pricePence) ? 'Choose one · included in the price' : 'Choose one') :
      group.min ? 'Choose at least ' + group.min : group.options.some(option => option.pricePence) ? 'Tap to add or remove · extras priced' : 'Tap to add or remove · no charge'
    const noteNode = document.createElement('p')
    noteNode.className = 'b-note'
    noteNode.textContent = note
    panel.append(noteNode)
    const photos = group.display === 'photos'
    const list = document.createElement('div')
    list.className = photos ? 'tiles' + (group.options.length <= 4 ? ' tiles--one-row' : '') : 'pills'
    for (const option of group.options) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.choice = option.id
      const price = option.pricePence ? '+' + formatPrice(option.pricePence) : ''
      if (photos) {
        button.className = 'tile'
        const disc = document.createElement('span')
        disc.className = 'tile-disc'
        const src = tileImage(option)
        if (option.id === 'all-salad') {
          disc.innerHTML = '<span class="stack3"></span>'
          ;['lettuce', 'tomato', 'onion'].forEach((key, i) => {
            const img = document.createElement('img')
            img.src = tileImage({ id: key, image: key === 'onion' ? '../burger-builder-demo/assets/onion.webp' : undefined }) ?? asset('../burger-builder-demo/assets/' + key + '.webp')
            img.alt = ''
            img.style.top = (16 + i * 16) + '%'
            disc.firstChild.append(img)
          })
        } else if (src) {
          const img = document.createElement('img')
          img.src = src
          img.alt = ''
          img.decoding = 'async'
          if (/sauces\/|drinks\/|props\//.test(src)) img.className = 'tall'
          disc.append(img)
        } else {
          disc.innerHTML = '<span class="tile-text"></span>'
          disc.firstChild.textContent = option.name
        }
        button.append(disc)
        button.insertAdjacentHTML('beforeend', `<span class="tile-tick" aria-hidden="true">${tick}</span>`)
        const label = document.createElement('span')
        label.className = 'tile-label'
        label.textContent = option.name
        button.append(label)
        if (price) button.insertAdjacentHTML('beforeend', `<span class="tile-price">${price}</span>`)
      } else {
        button.className = 'pill'
        button.textContent = option.name
        if (price) button.insertAdjacentHTML('beforeend', ` <span class="tile-price">${price}</span>`)
      }
      if (price) button.setAttribute('aria-label', option.name + ', ' + price)
      button.addEventListener('click', () => toggle(group, option))
      list.append(button)
      controls.set(option.id, button)
    }
    panel.append(list)
    panels.append(panel)
  }

  function showGroup(group, focusTab = false) {
    activeGroup = group
    for (const g of groups) {
      const on = g === group
      $('#tab-' + g.id).setAttribute('aria-selected', String(on))
      $('#tab-' + g.id).tabIndex = on ? 0 : -1
      $('#group-' + g.id).hidden = !on
    }
    const tab = $('#tab-' + group.id)
    tabs.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' })
    if (focusTab) tab.focus()
  }
  tabs.addEventListener('keydown', event => {
    const index = groups.indexOf(activeGroup)
    const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? groups.length - 1 : null
    if (next === null) return
    event.preventDefault()
    showGroup(groups[(next + groups.length) % groups.length], true)
  })
  if (groups.length) showGroup(activeGroup)

  // ---- state ----
  function sync() {
    for (const [id, button] of controls) button.setAttribute('aria-pressed', String(selected.has(id)))
    const total = getUnitPricePence(product, selected)
    const extras = total - product.basePricePence
    $('[data-price]').textContent = formatPrice(total)
    $('[data-breakdown]').textContent = extras ? formatPrice(product.basePricePence) + ' + ' + formatPrice(extras) + ' extras' : 'Base price'
    addPrice.textContent = formatPrice(total)
    if (total !== lastPrice) {
      const delta = $('[data-delta]')
      delta.textContent = (total > lastPrice ? '+' : '−') + formatPrice(Math.abs(total - lastPrice))
      delta.classList.remove('is-on')
      void delta.offsetWidth
      delta.classList.add('is-on')
      lastPrice = total
    }
  }

  function setGroupError(group, message) {
    const panel = $('#group-' + group.id)
    panel.querySelector('.b-error')?.remove()
    panel.toggleAttribute('data-invalid', Boolean(message))
    if (!message) return
    const error = document.createElement('p')
    error.className = 'b-error'
    error.setAttribute('role', 'alert')
    error.textContent = message
    panel.querySelector('.b-note').before(error)
  }

  function backToBuild() {
    if (phase === 'build') return
    phase = 'build'
    addButton.classList.remove('is-added', 'btn--ink')
    addLabel.textContent = 'Add to basket'
    addPrice.hidden = false
    status.classList.remove('is-ready')
    food.reopen(selected)
  }

  function toggle(group, option) {
    const cleared = []
    let verb
    if (selected.has(option.id)) {
      if (group.min === 1 && group.max === 1) return
      selected.delete(option.id)
      verb = 'off'
    } else {
      const active = group.options.filter(choice => selected.has(choice.id))
      if (active.length >= group.max) {
        if (group.max !== 1) { feedback.textContent = 'Choose up to ' + group.max + ' from ' + group.name + '.'; return }
        selected.delete(active[0].id)
      }
      for (const id of conflicts.get(option.id) ?? []) if (selected.delete(id)) cleared.push(byId.get(id).name)
      selected.add(option.id)
      verb = 'on'
    }
    setGroupError(group, '')
    feedback.textContent = cleared.length ? cleared.join(' and ') + ' removed: it clashes with ' + option.name + '.' : ''
    status.textContent = option.name + (verb === 'on' ? ' · on' : ' · off')
    sync()
    if (phase !== 'build') backToBuild()
    food.update(selected)
  }

  async function add() {
    if (phase === 'added') { shell.open(); return }
    if (phase === 'finishing') return
    const missing = groups.find(group => group.options.filter(option => selected.has(option.id)).length < group.min)
    if (missing) {
      showGroup(missing)
      setGroupError(missing, missing.requiredMessage ?? 'Please choose from ' + missing.name.toLowerCase() + '.')
      $('#group-' + missing.id).scrollIntoView({ block: 'nearest' })
      $('#group-' + missing.id).querySelector('button')?.focus({ preventScroll: true })
      return
    }
    phase = 'finishing'
    builder.classList.add('is-finishing')
    status.textContent = 'Wrapping it up'
    const choices = options.filter(option => selected.has(option.id) && !option.locked)
    const line = {
      productId: product.id, name: product.name, unitPricePence: getUnitPricePence(product, selected),
      optionIds: choices.map(option => option.id), options: choices.map(option => option.name),
    }
    await food.finish(selected)
    store.add(line)
    builder.classList.remove('is-finishing')
    status.textContent = 'Hot and ready'
    status.classList.add('is-ready')
    addButton.classList.add('is-added')
    addLabel.textContent = 'On your ticket'
    addPrice.hidden = true
    feedback.textContent = name + ' added to your ticket.'
    document.querySelectorAll('[data-ticket-count]').forEach(bump)
    phase = 'added'
    setTimeout(() => {
      if (phase !== 'added') return
      addButton.classList.remove('is-added')
      addButton.classList.add('btn--ink')
      const count = store.count()
      addLabel.textContent = 'View basket · ' + count + (count === 1 ? ' item' : ' items')
      addPrice.hidden = false
      addPrice.textContent = formatPrice(store.total())
    }, 1100)
  }

  addButton.addEventListener('click', add)
  sync()
  food.update(selected)
  status.textContent = groups.length ? (product.optionGroups.some(group => group.options.some(option => option.layerKeys)) ? 'Tap a choice to add it' : 'Make your choice') : 'Ready to order'
}
