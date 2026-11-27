// The Daylight customise screen. Choices are tiles with the real cut-outs; every
// tap is handed to the shared Er-Han scene engine, which drops or lifts the layer.
import { halfPounder, optionConflicts, findProduct, createDefaultSelections, getUnitPricePence } from '../../catalog.js'
import { CharcoalScene } from '../../scene.js'
import { productProfile } from '../../product-profiles.js'
import { catalog, formatPrice, setupChrome, lightProduct, asset, page, make } from './shared.js'

const requested = new URLSearchParams(location.search).get('product')
const match = requested === null ? { product: halfPounder, preset: [] } : findProduct(requested)
const found = match ? lightProduct(match.product) : null
const product = found ?? halfPounder
const selected = createDefaultSelections(product, match?.preset)
const options = product.optionGroups.flatMap(group => group.options)
const optionsById = new Map(options.map(option => [option.id, option]))
const controls = new Map()
const conflicts = new Map()
for (const [a, b] of optionConflicts) {
  if (!optionsById.has(a) || !optionsById.has(b)) continue
  conflicts.set(a, [...(conflicts.get(a) ?? []), b])
  conflicts.set(b, [...(conflicts.get(b) ?? []), a])
}

const $ = selector => document.querySelector(selector)
const builder = $('#builder')
const board = $('#stage')
const status = $('#status')
const addButton = $('#add-to-basket')
const totalNode = $('#basket-total')
const breakdown = $('#price-breakdown')
const delta = $('#delta')
const feedback = $('#panel-feedback')
const { basketUI } = setupChrome()
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const tick = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
let lastTotal = getUnitPricePence(product, selected)

function title() {
  const name = product.name
  const node = $('#product-title')
  const dash = name.indexOf(' – ')
  const withAt = name.search(/ (?=with )/i)
  const [first, separator, second] = product.titleLines ? [product.titleLines[0], ' ', product.titleLines[1]] :
    dash >= 0 ? [name.slice(0, dash), ' – ', name.slice(dash + 3)] :
    withAt >= 0 ? [name.slice(0, withAt), ' ', name.slice(withAt + 1)] : [name]
  node.classList.toggle('is-long', name.length > 26)
  node.replaceChildren(document.createTextNode(first))
  if (second) node.append(make('span', 'visually-hidden', separator), make('em', '', second))
  document.title = (product.optionGroups.length ? 'Customise ' : '') + name + ' · Er-Han Burger'
}

function render() {
  title()
  const category = catalog.categories.find(({ id }) => id === product.categoryId)
  $('#back-link').href = page('./menu.html#' + product.categoryId)
  $('#back-link').textContent = '← ' + (category?.name ?? 'Menu')
  const kind = product.visual === 'meal' ? 'meal' : product.policy === 'burger' || product.policy === 'kebab' ? 'order' : 'order'
  $('#controls-title').textContent = product.builderTitle ?? (product.optionGroups.length ?
    (product.visual === 'meal' ? 'Customise your meal' : 'Customise your ' + kind) : 'Your order')
  $('#controls-intro').textContent = product.builderDescription ?? (product.visual === 'meal' ?
    'Chips and a drink are included. Choose your drink, then make the main your own.' :
    product.optionGroups.length ? 'Choose your options. The preview changes as you go.' :
    'Nothing to choose here. Add it to your basket, or keep browsing.')
  if (!product.optionGroups.length) {
    const back = make('a', 'link-arrow back-link', 'Back to ' + (category?.name.toLowerCase() ?? 'the menu') + ' →')
    back.href = page('./menu.html#' + product.categoryId)
    $('#controls-intro').after(back)
  }
  const tabs = $('#group-tabs')
  tabs.hidden = product.optionGroups.filter(group => !group.options.every(option => option.locked)).length < 2
  const groups = $('#choice-groups')
  for (const group of product.optionGroups) {
    if (group.options.every(option => option.locked)) {
      const line = make('div', 'included')
      line.id = group.id
      const well = make('span', 'included-well')
      const image = make('img')
      image.src = asset(group.options[0].image)
      image.alt = ''
      well.append(image)
      const text = make('p')
      text.append(make('strong', '', group.options.map(option => option.name).join(', ')), document.createTextNode(' · included in the price'))
      line.append(well, text)
      groups.append(line)
      continue
    }
    const link = make('a', '', group.name)
    link.href = '#' + group.id
    tabs.append(link)
    const section = make('section', 'choice-group')
    section.id = group.id
    const head = make('div', 'group-head')
    const heading = make('h3', '', group.name)
    heading.id = group.id + '-title'
    section.setAttribute('aria-labelledby', heading.id)
    head.append(heading)
    const free = group.options.every(({ pricePence }) => !pricePence)
    const rule = group.options.every(option => option.locked) ? 'Included' :
      group.min ? 'Required' :
      group.max === 1 ? 'Choose one' : free ? 'Optional · no charge' : 'Optional'
    const ruleNode = make('span', 'label' + (group.min ? ' req' : ''), rule)
    head.append(ruleNode)
    section.append(head)
    const photos = group.display === 'photos' && group.options.some(option => option.image)
    const grid = make('div', photos ? 'tiles' : 'chips')
    grid.setAttribute('role', 'group')
    grid.setAttribute('aria-labelledby', heading.id)
    for (const option of group.options) {
      const button = make('button', photos ? 'tile' : 'chip')
      button.type = 'button'
      button.dataset.choice = option.id
      const price = option.pricePence ? '+' + formatPrice(option.pricePence) : option.locked ? 'Included' : ''
      if (photos) {
        const well = make('span', 'tile-well')
        if (option.image) {
          const image = make('img')
          image.src = asset(option.image)
          image.alt = ''
          image.decoding = 'async'
          if (option.layerKeys?.some(key => key.startsWith('drink-'))) image.className = 'is-drink'
          well.append(image)
        } else {
          well.append(make('span', 'label', option.name.split(' ')[0]))
        }
        const mark = make('span', 'tile-tick')
        mark.innerHTML = tick
        button.append(well, mark, make('span', 'tile-name', option.name))
        if (price) button.append(make('span', 'tile-price', price))
      } else {
        button.append(document.createTextNode(option.name))
        if (price) button.append(make('span', 'tile-price', price))
      }
      if (price) button.setAttribute('aria-label', option.name + ', ' + price)
      button.disabled = Boolean(option.locked)
      button.addEventListener('click', () => change(group, option))
      grid.append(button)
      controls.set(option.id, button)
    }
    section.append(grid)
    groups.append(section)
  }
}

function sceneSelection() {
  const active = options.filter(option => selected.has(option.id))
  const keys = new Set(preview.fixedLayerKeys)
  for (const option of active) for (const key of option.layerKeys ?? []) keys.add(key)
  for (const option of active) for (const key of option.removeLayerKeys ?? []) keys.delete(key)
  return keys
}

function updatePrice() {
  for (const [id, button] of controls) {
    button.setAttribute('aria-pressed', String(Boolean(optionsById.get(id).locked) || selected.has(id)))
  }
  const total = getUnitPricePence(product, selected)
  const extras = total - product.basePricePence
  totalNode.textContent = formatPrice(total)
  $('#board-price').textContent = formatPrice(total)
  breakdown.textContent = extras ? formatPrice(product.basePricePence) + ' + ' + formatPrice(extras) + ' extras' : 'Base price'
  const change = total - lastTotal
  if (change) {
    delta.textContent = (change > 0 ? '+' : '−') + formatPrice(Math.abs(change))
    delta.classList.remove('is-visible'); void delta.offsetWidth; delta.classList.add('is-visible')
  }
  lastTotal = total
}

function setGroupError(group, message) {
  const section = document.getElementById(group.id)
  section.querySelector('.group-error')?.remove()
  section.toggleAttribute('data-invalid', Boolean(message))
  if (!message) return
  const error = make('p', 'group-error', message)
  error.setAttribute('role', 'alert')
  section.querySelector('.group-head').after(error)
}

function resetOrderButton() {
  if (addButton.dataset.state === 'add') return
  clearTimeout(addButton.timer)
  addButton.dataset.state = 'add'
  addButton.textContent = 'Add to basket'
  board.removeAttribute('data-finished')
  builder.removeAttribute('data-busy')
}

function change(group, option) {
  resetOrderButton()
  const cleared = []
  if (selected.has(option.id)) {
    if (group.min === 1 && group.max === 1) return
    selected.delete(option.id)
  } else {
    const active = group.options.filter(choice => selected.has(choice.id))
    if (active.length >= group.max) {
      if (group.max !== 1 || active[0].locked) {
        feedback.textContent = 'Choose up to ' + group.max + ' from ' + group.name + '.'
        return
      }
      selected.delete(active[0].id)
    }
    for (const id of conflicts.get(option.id) ?? []) {
      if (selected.delete(id)) cleared.push(optionsById.get(id).name)
    }
    selected.add(option.id)
  }
  updatePrice()
  setGroupError(group, '')
  feedback.textContent = cleared.length ? cleared.join(' and ') + ' removed, as it conflicts with ' + option.name + '.' : ''
  CharcoalScene.update(sceneSelection())
}

// The ready moment: the food settles, steam rises, the button confirms and
// then becomes the next step.
function addToBasket() {
  if (addButton.dataset.state === 'view') { basketUI.open(); return }
  if (addButton.dataset.state === 'added') return
  const missing = product.optionGroups.find(group => group.options.filter(option => selected.has(option.id)).length < group.min)
  if (missing) {
    setGroupError(missing, missing.requiredMessage ?? 'Please complete ' + missing.name.toLowerCase() + '.')
    const section = document.getElementById(missing.id)
    section.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' })
    section.querySelector('button:not(:disabled)')?.focus({ preventScroll: true })
    return
  }
  const choices = options.filter(option => selected.has(option.id) && !option.locked)
  basketUI.addQuietly({
    productId: product.id, name: product.name, unitPricePence: getUnitPricePence(product, selected),
    optionIds: choices.map(option => option.id), options: choices.map(option => option.name),
  })
  builder.dataset.busy = 'true'
  board.dataset.finished = 'true'
  status.textContent = product.visual === 'photo' ? 'Added to your order' : 'Hot and ready'
  addButton.dataset.state = 'added'
  addButton.innerHTML = tick.replace('aria-hidden', 'width="18" height="18" aria-hidden') + ' Added to basket'
  addButton.timer = setTimeout(() => {
    builder.removeAttribute('data-busy')
    const count = document.querySelector('[data-basket-count]').textContent
    addButton.dataset.state = 'view'
    addButton.replaceChildren(document.createTextNode('View basket '), make('span', 'pill', count))
    addButton.setAttribute('aria-label', 'View basket, ' + count + (count === '1' ? ' item' : ' items'))
  }, reduced.matches ? 600 : 1400)
}

function notFound() {
  document.title = 'Item not found · Er-Han Burger'
  builder.replaceChildren()
  const box = make('section', 'not-found')
  box.append(make('p', 'label', 'Sorry'), make('h1', '', 'We couldn’t find that item'),
    make('p', '', 'It may have been renamed or taken off the menu.'))
  const link = make('a', 'btn', 'Browse the menu')
  link.href = page('./menu.html')
  box.append(link)
  builder.append(box)
}

let preview
if (found) {
  preview = productProfile(product, CharcoalScene.defaultProfile)
  render()
  updatePrice()
  CharcoalScene.init({ profile: preview, selection: sceneSelection() })
  status.textContent = product.optionGroups.length ? 'Tap a choice to add it' : 'As it comes'
  const replay = $('#replay')
  replay.hidden = preview.visual === 'photo'
  replay.addEventListener('click', () => { resetOrderButton(); CharcoalScene.replay() })
  addButton.addEventListener('click', addToBasket)
  // Watch for a basket emptied elsewhere so the button never points at nothing.
  addEventListener('pageshow', () => { if (addButton.dataset.state === 'view') resetOrderButton() })
} else {
  notFound()
}
