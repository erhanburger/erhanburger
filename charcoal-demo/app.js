import {
  catalog, halfPounder, optionConflicts, findProduct, createDefaultSelections, formatPrice, getUnitPricePence, choiceSummary,
} from './catalog.js'
import { CharcoalScene } from './scene.js'
import { productProfile } from './product-profiles.js'
import { createBasketUI } from './basket-ui.js'
import { initShell, make } from './shell.js'
import { productArt } from './art.js'

const requestedProduct = new URLSearchParams(location.search).get('product')
const match = requestedProduct === null ? { product: halfPounder, preset: [] } : findProduct(requestedProduct)
const foundProduct = match?.product
const product = foundProduct ?? halfPounder
const preset = match?.preset ?? []
const selected = createDefaultSelections(product, preset)
const preview = productProfile(product, CharcoalScene.defaultProfile)
const options = product.optionGroups.flatMap(group => group.options)
const $ = selector => document.querySelector(selector)
const builder = $('.builder')
const groupsNode = $('#choice-groups')
const tabs = $('#group-tabs')
const feedback = $('#basket-feedback')
const addButton = $('#add-to-basket')
const addLabel = $('#add-label')
const addPrice = $('#add-price')
const makeAnother = $('#make-another')
const choiceStatus = $('#choice-status')
const priceTotal = $('#basket-total')
const priceBreakdown = $('#price-breakdown')
const delta = $('#price-delta')
const controls = new Map()
const category = catalog.categories.find(({ id }) => id === product.categoryId)
const categoryName = category?.name ?? 'Menu'
const menuHref = './menu.html' + (foundProduct ? '#' + product.categoryId : '')
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
// On wide screens every group is shown in one scrolling column and the tabs
// jump between them; on phones the tabs show one group at a time.
const stacked = matchMedia('(min-width: 900px) and (min-height: 560px)')

initShell({ active: 'build' })
const basketUI = createBasketUI({ dialog: $('#basket-dialog'), keepBrowsingHref: menuHref })

const optionsById = new Map(options.map(option => [option.id, option]))
const conflicts = new Map()
for (const [a, b] of optionConflicts) {
  if (!optionsById.has(a) || !optionsById.has(b)) continue
  conflicts.set(a, [...(conflicts.get(a) ?? []), b])
  conflicts.set(b, [...(conflicts.get(b) ?? []), a])
}
const lockedGroups = product.optionGroups.filter(group => group.options.every(option => option.locked))
const groups = product.optionGroups.filter(group => !lockedGroups.includes(group))
const isRequired = group => group.min > 0 && !group.defaultOptionIds?.length
let activeGroup = groups.find(isRequired) ?? groups[0]
let phase = 'build' // build | added
let lastPrice = getUnitPricePence(product, selected)

const tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'

function renderTitle() {
  const title = $('#product-title')
  const name = product.displayName ?? product.name
  // "Deal 1 – Quarter Burger…" shows the dash only to assistive technology,
  // so the second line never starts with punctuation.
  // Meal deals: "Deal 2" moves to the label line and the contents are the title.
  const deal = name.match(/^(Deal \d+) – (.+)$/)
  if (deal) {
    title.replaceChildren(make('span', 'visually-hidden', deal[1] + ' – '), document.createTextNode(deal[2]))
    $('#product-category').textContent = categoryName + ' · ' + deal[1]
    document.title = product.name + ' · Er-Han Burger'
    finishTitle()
    return
  }
  // The red second line is kept for the variant part of a name only.
  const dash = name.indexOf(' – ')
  const withAt = name.search(/ (?=with )/i)
  const [first, separator, emphasis] = product.titleLines ? [product.titleLines[0], ' ', product.titleLines[1]] :
    dash >= 0 ? [name.slice(0, dash), ' – ', name.slice(dash + 3)] :
    withAt >= 0 ? [name.slice(0, withAt), ' ', name.slice(withAt + 1)] : [name]
  title.replaceChildren(document.createTextNode(first))
  if (emphasis) title.append(make('span', 'visually-hidden', separator), make('em', '', emphasis))
  title.classList.toggle('is-long', name.length > 30)
  document.title = product.name + ' · Er-Han Burger'
  $('#product-category').textContent = categoryName
  finishTitle()
}

function finishTitle() {
  const back = $('#back-link')
  back.href = menuHref
  back.setAttribute('aria-label', 'Menu: back to ' + categoryName.toLowerCase())
  // The Build tab keeps the customer on the item they are building.
  for (const link of document.querySelectorAll('[data-nav="build"]')) link.href = location.pathname.split('/').pop() + location.search
}

// A choice tile shows the ingredient itself. "All salad" shows three salads.
function tileImages(group, option) {
  if (option.image) return [option.image]
  return (option.layerKeys ?? []).map(key => group.options.find(other => other !== option &&
    other.layerKeys?.length === 1 && other.layerKeys[0] === key)?.image).filter(Boolean).slice(0, 3)
}

function renderGroups() {
  const intro = $('#intro')
  const included = lockedGroups.flatMap(group => group.options.map(option => option.name.toLowerCase()))
  intro.textContent = product.builderDescription ??
    (groups.length ? 'Tap a choice and watch it land. The price updates as you go.' : 'Nothing to choose. Add it to your basket, or keep browsing.')
  if (included.length) intro.append(' ', make('span', 'intro-included', 'Comes with ' + included.join(', ') + '.'))
  if (!groups.length) {
    builder.classList.add('is-simple')
    tabs.hidden = true
    intro.textContent = 'Nothing to choose: it comes as it is. Add it on its own or alongside your meal.'
    renderPairings()
    const back = make('a', 'text-link', 'Back to ' + categoryName.toLowerCase())
    back.href = menuHref
    groupsNode.append(back)
    return
  }
  if (groups.length === 1) tabs.hidden = true
  for (const group of groups) {
    const required = isRequired(group)
    const tab = make('button', 'group-tab')
    tab.type = 'button'
    tab.id = 'tab-' + group.id
    tab.setAttribute('aria-controls', group.id)
    tab.append(make('span', '', group.name))
    if (required) {
      tab.append(make('span', 'required-dot'))
      tab.setAttribute('aria-label', group.name + ', required')
    }
    tab.addEventListener('click', () => showGroup(group, { scroll: true }))
    tabs.append(tab)

    const section = make('section', 'choice-group')
    section.id = group.id
    const heading = make('h3', 'group-title', group.name)
    heading.id = group.id + '-title'
    section.setAttribute('aria-labelledby', heading.id)
    const head = make('div', 'group-head')
    head.append(heading)
    if (required) head.append(make('span', 'required-tag', 'Required'))
    const free = group.options.every(({ pricePence }) => !pricePence)
    const note = group.max === 1 && group.min === 1 ? (free ? 'Choose one · included in the price' : 'Choose one') :
      group.min ? 'Choose at least ' + group.min : free ? 'Tap to add or remove · no charge' : 'Tap to add or remove · extras priced'
    section.append(head, make('p', 'group-note', note))
    const photos = group.display === 'photos'
    const grid = make('div', photos ? 'tiles' : 'pills')
    grid.id = group.id + '-choices'
    for (const option of group.options) {
      const button = make('button', photos ? 'tile' : 'pill')
      button.type = 'button'
      button.dataset.choice = option.id
      const price = option.pricePence ? '+' + formatPrice(option.pricePence) : ''
      if (photos) {
        const disc = make('span', 'tile-disc')
        const images = tileImages(group, option)
        if (images.length > 1) disc.classList.add('tile-disc--stack')
        for (const src of images) {
          const image = make('img')
          image.src = src
          image.alt = ''
          image.decoding = 'async'
          if (/sauces\/|cutouts\/|props\//.test(src)) image.className = 'is-tall'
          disc.append(image)
        }
        if (!images.length) disc.append(make('span', 'tile-text', option.name))
        const mark = make('span', 'tile-tick')
        mark.setAttribute('aria-hidden', 'true')
        mark.innerHTML = tick
        button.append(disc, mark, make('span', 'tile-label', option.name))
        if (price) button.append(make('span', 'tile-price', price))
      } else {
        button.append(make('span', 'pill-label', option.name))
        if (price) button.append(make('span', 'tile-price', price))
      }
      if (price) button.setAttribute('aria-label', option.name + ', ' + price)
      button.addEventListener('click', () => changeChoice(group, option))
      grid.append(button)
      controls.set(option.id, button)
    }
    section.append(grid)
    groupsNode.append(section)
  }
}

// Simple items suggest a few others from the menu, at their menu prices.
function renderPairings() {
  const ids = ['chips', 'chicken-nuggets', 'coca-cola-classic', 'pepsi', 'snickers']
  const picks = ids.map(id => catalog.products.find(item => item.id === id))
    .filter(item => item && item.id !== product.id && item.categoryId !== product.categoryId).slice(0, 3)
  if (!picks.length) return
  const box = make('section', 'pairings')
  box.setAttribute('aria-labelledby', 'pairings-title')
  const heading = make('h3', 'group-title', 'Goes well with')
  heading.id = 'pairings-title'
  const list = make('ul', 'pairing-list')
  for (const item of picks) {
    const row = make('li', 'pairing')
    const link = make('a', 'pairing-name', item.name)
    link.href = './product.html?product=' + encodeURIComponent(item.id)
    row.append(productArt(item, { className: 'art--thumb', eager: true }), link, make('span', 'price', formatPrice(item.basePricePence)))
    if (!item.optionGroups.length) {
      const add = make('button', 'button button--small pairing-add', '+ Add')
      add.type = 'button'
      add.setAttribute('aria-label', 'Add ' + item.name + ' to basket, ' + formatPrice(item.basePricePence))
      add.addEventListener('click', () => {
        const quantity = basketUI.addQuietly({ productId: item.id, name: item.name, unitPricePence: item.basePricePence, optionIds: [], options: [] })
        add.textContent = quantity > 1 ? quantity + ' in basket' : 'Added'
        showToast(item.name + ' added to your basket.')
      })
      row.append(add)
    } else {
      const go = make('span', 'pairing-go', 'Customise')
      go.setAttribute('aria-hidden', 'true')
      row.append(go)
    }
    list.append(row)
  }
  box.append(heading, list)
  groupsNode.append(box)
}

// A short note on the stage, near the choices, that fades after a moment.
let toastTimer = 0
function showToast(message) {
  feedback.textContent = message
  feedback.classList.toggle('is-on', Boolean(message))
  clearTimeout(toastTimer)
  if (message) toastTimer = setTimeout(() => feedback.classList.remove('is-on'), 3200)
}

// Choices that do not change the picture (seasoning, preferences, chilli) are
// listed on the stage, and seasoning is sprinkled over the food.
function renderStageNotes() {
  const notes = $('#stage-notes')
  notes.replaceChildren(...options.filter(option => selected.has(option.id) && !option.locked &&
    !option.image && !(option.layerKeys?.length)).map(option => make('li', '', option.name)))
  $('#stage').dataset.choices = [...selected].join(' ')
}

function showGroup(group, { scroll = false, focus = false } = {}) {
  activeGroup = group
  for (const other of groups) {
    const tab = $('#tab-' + other.id)
    if (other === group) tab.setAttribute('aria-current', 'true')
    else tab.removeAttribute('aria-current')
    $('#' + CSS.escape(other.id)).classList.toggle('is-active', other === group)
  }
  const tab = $('#tab-' + group.id)
  const offset = tab.getBoundingClientRect().left - tabs.getBoundingClientRect().left
  tabs.scrollTo({ left: tabs.scrollLeft + offset - 16, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
  const section = $('#' + CSS.escape(group.id))
  if (scroll && stacked.matches) {
    const column = $('.controls')
    column.scrollTo({ top: section.offsetTop - tabs.offsetHeight - 8, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
  }
  if (focus) section.querySelector('button:not(:disabled)')?.focus({ preventScroll: !stacked.matches })
}

// In the stacked layout the tab of the group in view follows the scroll.
function followScroll() {
  const column = $('.controls')
  let ticking = false
  column.addEventListener('scroll', () => {
    if (!stacked.matches || ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const line = column.scrollTop + tabs.offsetHeight + 24
      let current = groups[0]
      for (const group of groups) if ($('#' + CSS.escape(group.id)).offsetTop <= line) current = group
      if (column.scrollTop + column.clientHeight >= column.scrollHeight - 4) current = groups[groups.length - 1]
      if (current !== activeGroup) showGroup(current)
    })
  }, { passive: true })
}

function getSceneSelection() {
  const active = options.filter(option => selected.has(option.id))
  const keys = new Set(preview.fixedLayerKeys)
  for (const option of active) {
    for (const key of option.layerKeys ?? []) keys.add(key)
  }
  for (const option of active) {
    for (const key of option.removeLayerKeys ?? []) keys.delete(key)
  }
  return keys
}

function updatePriceAndControls() {
  for (const [id, button] of controls) {
    button.setAttribute('aria-pressed', String(Boolean(optionsById.get(id).locked) || selected.has(id)))
  }
  const total = getUnitPricePence(product, selected)
  const extras = total - product.basePricePence
  priceTotal.textContent = formatPrice(total)
  // Phones show the short form ("+ £0.30 extras"); wider screens add the base.
  priceBreakdown.replaceChildren(...(extras ? [make('span', 'breakdown-base', formatPrice(product.basePricePence) + ' '), '+ ' + formatPrice(extras) + ' extras'] : ['Base price']))
  if (phase === 'build') addPrice.textContent = formatPrice(total)
  if (total !== lastPrice) {
    delta.textContent = (total > lastPrice ? '+' : '−') + formatPrice(Math.abs(total - lastPrice))
    delta.classList.remove('is-on')
    void delta.offsetWidth
    delta.classList.add('is-on')
    lastPrice = total
  }
}

function setGroupError(group, message) {
  const section = document.getElementById(group.id)
  if (!section) return
  section.querySelector('.group-error')?.remove()
  section.toggleAttribute('data-invalid', Boolean(message))
  $('#tab-' + group.id)?.toggleAttribute('data-invalid', Boolean(message))
  if (!message) return
  const error = make('p', 'group-error', message)
  error.id = group.id + '-error'
  error.setAttribute('role', 'alert')
  section.querySelector('.group-head').after(error)
}

function setStageLabel(text, state = '') {
  choiceStatus.textContent = text
  choiceStatus.dataset.state = state
}

function backToBuild() {
  if (phase === 'build') return
  phase = 'build'
  builder.classList.remove('is-added')
  addButton.classList.remove('button--go', 'button--ink')
  addButton.removeAttribute('aria-label')
  addLabel.textContent = 'Add to basket'
  addPrice.textContent = formatPrice(getUnitPricePence(product, selected))
  makeAnother.hidden = true
}

function changeChoice(group, option) {
  const cleared = []
  let on = true
  if (selected.has(option.id)) {
    // A required single choice (e.g. a portion size) stays chosen, like a radio button.
    if (group.min === 1 && group.max === 1) return
    selected.delete(option.id)
    on = false
  } else {
    const active = group.options.filter(choice => selected.has(choice.id))
    if (active.length >= group.max) {
      if (group.max !== 1 || active[0].locked) {
        showToast('Choose up to ' + group.max + ' from ' + group.name + '.')
        return
      }
      selected.delete(active[0].id)
    }
    for (const id of conflicts.get(option.id) ?? []) {
      if (selected.delete(id)) cleared.push(optionsById.get(id).name)
    }
    selected.add(option.id)
  }
  backToBuild()
  updatePriceAndControls()
  setGroupError(group, '')
  showToast(cleared.length ? cleared.join(' and ') + ' removed: it clashes with ' + option.name + '.' : '')
  renderStageNotes()
  setStageLabel(option.name + (on ? ' · on' : ' · off'), on ? 'on' : 'off')
  CharcoalScene.update(getSceneSelection())
}

function addToBasket() {
  if (phase === 'added') {
    basketUI.open()
    return
  }
  const missingGroup = groups.find(group =>
    group.options.filter(option => selected.has(option.id)).length < group.min)
  if (missingGroup) {
    const message = missingGroup.requiredMessage ?? 'Please choose from ' + missingGroup.name.toLowerCase() + '.'
    showGroup(missingGroup, { scroll: true })
    setGroupError(missingGroup, message)
    setStageLabel(missingGroup.name + ' · required', 'error')
    $('#' + CSS.escape(missingGroup.id)).querySelector('button:not(:disabled)')?.focus({ preventScroll: !stacked.matches })
    return
  }
  const choices = options.filter(option => selected.has(option.id) && !option.locked)
  basketUI.addQuietly({
    productId: product.id,
    name: product.name,
    unitPricePence: getUnitPricePence(product, selected),
    optionIds: choices.map(option => option.id),
    options: choiceSummary(product, choices.map(option => option.id)),
  })
  phase = 'added'
  builder.classList.add('is-added')
  setStageLabel('Ready · on your ticket', 'ready')
  addButton.classList.add('button--go')
  addLabel.textContent = 'Added to basket'
  addPrice.textContent = '✓'
  makeAnother.hidden = false
  showToast(product.name + ' added to your basket.')
  // A moment later (at once with reduced motion) the button becomes the next step.
  const nextStep = () => {
    if (phase !== 'added') return
    addButton.classList.replace('button--go', 'button--ink')
    const count = basketUI.count()
    addLabel.textContent = 'View basket'
    addButton.setAttribute('aria-label', 'View basket, ' + count + (count === 1 ? ' item, ' : ' items, ') + formatPrice(basketUI.total()))
    addPrice.textContent = formatPrice(basketUI.total())
  }
  if (reducedMotion.matches) nextStep()
  else setTimeout(nextStep, 1100)
}

// "Make another" starts the same item again from its standard choices.
function startAgain() {
  selected.clear()
  for (const id of createDefaultSelections(product, preset)) selected.add(id)
  backToBuild()
  for (const group of groups) setGroupError(group, '')
  updatePriceAndControls()
  showToast('Ready for another ' + product.name + '.')
  renderStageNotes()
  setStageLabel('Make another', '')
  CharcoalScene.update(getSceneSelection())
  if (groups.length) showGroup(groups.find(isRequired) ?? groups[0], { scroll: true })
  addButton.focus()
}

function renderNotFound() {
  document.title = 'Item not found · Er-Han Burger'
  builder.classList.add('is-not-found', 'is-simple')
  $('#product-title').textContent = 'Item not found'
  $('#product-category').textContent = 'Sorry'
  $('#intro').textContent = 'We couldn’t find that item. It may have been renamed or removed from the menu.'
  const link = make('a', 'button button--ink', 'Browse the menu')
  link.href = './menu.html'
  groupsNode.append(link)
  tabs.hidden = true
}

if (foundProduct) {
  renderTitle()
  renderGroups()
  updatePriceAndControls()
  renderStageNotes()
  if (activeGroup) showGroup(activeGroup)
  followScroll()
  CharcoalScene.init({ profile: preview, selection: getSceneSelection() })
  setStageLabel(groups.length ? (groups.some(isRequired) ? 'Choose your ' + groups.find(isRequired).name.replace(/^choose your /i, '').toLowerCase() : 'Tap a choice to add it') : 'Ready to order')
  const replay = $('#replay')
  replay.hidden = preview.visual === 'photo'
  replay.addEventListener('click', () => CharcoalScene.replay())
  addButton.addEventListener('click', addToBasket)
  makeAnother.addEventListener('click', startAgain)
  stacked.addEventListener('change', () => activeGroup && showGroup(activeGroup))
} else {
  renderNotFound()
}
if (new URLSearchParams(location.search).has('basket')) basketUI.open()
