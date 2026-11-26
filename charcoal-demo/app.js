import {
  catalog, halfPounder, optionConflicts, createDefaultSelections, formatPrice, getUnitPricePence,
} from './catalog.js'
import { CharcoalScene } from './scene.js'
import { productProfile } from './product-profiles.js'
import { createBasketUI } from './basket-ui.js'

const requestedProduct = new URLSearchParams(location.search).get('product')
const foundProduct = requestedProduct === null ? halfPounder :
  catalog.products.find(item => item.id === requestedProduct)
const product = foundProduct ?? halfPounder
const selected = createDefaultSelections(product)
const preview = productProfile(product, CharcoalScene.defaultProfile)
const options = product.optionGroups.flatMap(group => group.options)
const groups = document.querySelector('#choice-groups')
const navigation = document.querySelector('.category-nav')
const basketDialog = document.querySelector('#basket-dialog')
const basketCount = document.querySelector('#basket-count')
const basketFeedback = document.querySelector('#basket-feedback')
const addButton = document.querySelector('#add-to-basket')
const priceTotal = document.querySelector('#basket-total')
const priceBreakdown = document.querySelector('#price-breakdown')
const controls = new Map()
const basketUI = createBasketUI({
  dialog: basketDialog,
  countNode: basketCount,
  keepBrowsingHref: './menu.html' + (foundProduct ? '#' + foundProduct.categoryId : ''),
})
const optionsById = new Map(options.map(option => [option.id, option]))
const conflicts = new Map()
for (const [a, b] of optionConflicts) {
  if (!optionsById.has(a) || !optionsById.has(b)) continue
  conflicts.set(a, [...(conflicts.get(a) ?? []), b])
  conflicts.set(b, [...(conflicts.get(b) ?? []), a])
}

function make(tag, className, label) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (label) node.textContent = label
  return node
}

function renderProduct() {
  const title = document.querySelector('#product-title')
  const name = product.displayName ?? product.name
  document.querySelector('#controls-title').textContent = product.builderTitle ?? (product.optionGroups.length ? 'Customise your order' : 'Your order')
  document.querySelector('.intro p').textContent = product.builderDescription ?? (product.optionGroups.length ? 'Choose your options.' : product.name)
  if (title) {
    // "Deal 1 – Quarter Burger…" shows the dash only to assistive technology,
    // so the second line never starts with punctuation.
    const dash = name.indexOf(' – ')
    const withAt = name.search(/ (?=with )/i)
    const [first, separator, emphasis] = product.titleLines ? [product.titleLines[0], ' ', product.titleLines[1]] :
      dash >= 0 ? [name.slice(0, dash), ' – ', name.slice(dash + 3)] :
      withAt >= 0 ? [name.slice(0, withAt), ' ', name.slice(withAt + 1)] : [name]
    title.replaceChildren(document.createTextNode(first))
    if (emphasis) title.append(make('span', 'visually-hidden', separator), make('em', '', emphasis))
  }
  document.title = product.name + ' · Er-Han Burger'
  navigation.replaceChildren()
  navigation.hidden = !product.optionGroups.length
  groups.replaceChildren()
  for (const group of product.optionGroups) {
    const link = make('a', '', group.name)
    link.href = '#' + group.id
    if (group === product.optionGroups[0]) link.setAttribute('aria-current', 'location')
    link.addEventListener('click', () => {
      navigation.querySelector('[aria-current]')?.removeAttribute('aria-current')
      link.setAttribute('aria-current', 'location')
      const disclosure = document.getElementById(group.id)?.querySelector('details')
      if (disclosure) disclosure.open = true
    })
    navigation.append(link)
    const section = make('section', 'choice-group')
    if (group.options.every(option => option.locked)) section.classList.add('choice-group--included')
    section.id = group.id
    const heading = make('h3', '', group.name)
    heading.id = group.id + '-title'
    section.setAttribute('aria-labelledby', heading.id)
    const grid = make('div', 'choice-grid')
    grid.id = group.id + '-choices'
    section.append(heading)
    if (group.min) {
      const instruction = group.max === 1 ? 'Choose one. Included in the price.' : 'Choose at least ' + group.min + '.'
      section.append(make('p', 'group-instruction', instruction))
    }
    section.append(grid)
    let secondaryGrid
    if (group.featuredCount < group.options.length) {
      const details = make('details', 'choice-more')
      const extraCount = group.options.length - group.featuredCount
      const summary = make('summary', '', (group.moreLabel ?? 'More options') + ' (' + extraCount + ')')
      secondaryGrid = make('div', 'choice-grid')
      details.append(summary, secondaryGrid)
      section.append(details)
    }
    groups.append(section)
    for (const [index, option] of group.options.entries()) {
      const button = make('button', 'choice-card')
      button.type = 'button'
      button.dataset.choice = option.id
      if (option.image) {
        const image = make('img', 'choice-image')
        image.src = option.image
        image.alt = ''
        image.decoding = 'async'
        button.append(image)
      } else {
        button.classList.add('choice-card--text')
      }
      const label = make('span', 'choice-label', option.name)
      const price = option.pricePence ? '+' + formatPrice(option.pricePence) :
        option.locked ? 'Included' : ''
      const mark = make('span', 'choice-mark')
      mark.setAttribute('aria-hidden', 'true')
      button.append(label)
      if (price) button.append(make('span', 'choice-price', price))
      button.append(mark)
      button.disabled = Boolean(option.locked)
      button.addEventListener('click', () => changeChoice(group, option))
      const optionGrid = secondaryGrid && index >= group.featuredCount ? secondaryGrid : grid
      optionGrid.append(button)
      controls.set(option.id, button)
    }
  }
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
  priceBreakdown.textContent = formatPrice(product.basePricePence) + ' base' +
    (extras ? ' + ' + formatPrice(extras) + ' extras' : '')
}

function setGroupError(group, message) {
  const section = document.getElementById(group.id)
  if (!section) return
  section.querySelector('.group-error')?.remove()
  section.toggleAttribute('data-invalid', Boolean(message))
  if (!message) return
  const error = make('p', 'group-error', message)
  error.id = group.id + '-error'
  error.setAttribute('role', 'alert')
  section.querySelector('h3').after(error)
}

function changeChoice(group, option) {
  const cleared = []
  if (selected.has(option.id)) {
    selected.delete(option.id)
  } else {
    const active = group.options.filter(choice => selected.has(choice.id))
    if (active.length >= group.max) {
      if (group.max !== 1 || active[0].locked) {
        basketFeedback.textContent = 'Choose up to ' + group.max + ' from ' + group.name + '.'
        return
      }
      selected.delete(active[0].id)
    }
    for (const id of conflicts.get(option.id) ?? []) {
      if (selected.delete(id)) cleared.push(optionsById.get(id).name)
    }
    selected.add(option.id)
  }
  updatePriceAndControls()
  setGroupError(group, '')
  basketFeedback.textContent = cleared.length ? cleared.join(' and ') + ' removed, as it conflicts with ' + option.name + '.' : ''
  basketFeedback.classList.remove('basket-feedback--visible')
  CharcoalScene.update(getSceneSelection())
}

function addToBasket() {
  const missingGroup = product.optionGroups.find(group =>
    group.options.filter(option => selected.has(option.id)).length < group.min)
  if (missingGroup) {
    const message = missingGroup.requiredMessage ?? 'Please complete ' + missingGroup.name.toLowerCase() + '.'
    setGroupError(missingGroup, message)
    const section = document.getElementById(missingGroup.id)
    section.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    section.querySelector('button:not(:disabled)')?.focus({ preventScroll: true })
    return
  }
  const choices = options.filter(option => selected.has(option.id) && !option.locked)
  const optionIds = choices.map(option => option.id)
  basketUI.add({
    productId: product.id,
    name: product.name,
    unitPricePence: getUnitPricePence(product, selected),
    optionIds,
    options: choices.map(option => option.name),
  })
}

function renderNotFound() {
  document.title = 'Item not found · Er-Han Burger'
  document.body.classList.add('is-not-found')
  document.querySelector('#product-title').textContent = 'Item not found'
  document.querySelector('#controls-title').textContent = 'Sorry, we couldn’t find that item'
  const intro = document.querySelector('.intro p')
  intro.textContent = 'It may have been renamed or removed from the menu. '
  const link = make('a', 'not-found-link', 'Browse the menu')
  link.href = './menu.html'
  intro.append(link)
  navigation.hidden = true
}

if (foundProduct) {
  renderProduct()
  updatePriceAndControls()
  CharcoalScene.init({
    profile: preview,
    selection: getSceneSelection(),
  })
  const replay = document.querySelector('#replay')
  replay.hidden = preview.visual === 'photo'
  replay.addEventListener('click', () => CharcoalScene.replay())
  addButton.addEventListener('click', addToBasket)
} else {
  renderNotFound()
}
document.querySelector('#open-basket').addEventListener('click', () => basketUI.open())
if (new URLSearchParams(location.search).has('basket')) basketUI.open()
