import {
  catalog, halfPounder, createDefaultSelections, formatPrice, getUnitPricePence,
} from './catalog.js'
import { CharcoalScene } from './scene.js'
import { productProfile } from './product-profiles.js'
import { readBasket, saveBasket } from './basket-storage.js'
import { orderContact } from './order-config.js'

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
const basketItems = document.querySelector('#basket-items')
const basketCount = document.querySelector('#basket-count')
const basketSubtotal = document.querySelector('#basket-subtotal')
const basketFeedback = document.querySelector('#basket-feedback')
const addButton = document.querySelector('#add-to-basket')
const priceTotal = document.querySelector('#basket-total')
const priceBreakdown = document.querySelector('#price-breakdown')
const checkout = document.querySelector('#basket-checkout')
const orderNote = document.querySelector('#order-note')
const basketStatus = document.querySelector('#basket-status')
const maxQuantity = 20
const controls = new Map()
const optionsById = new Map(options.map(option => [option.id, option]))
let basket = readBasket()

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

function changeChoice(group, option) {
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
    selected.add(option.id)
  }
  updatePriceAndControls()
  basketFeedback.textContent = ''
  basketFeedback.classList.remove('basket-feedback--visible')
  CharcoalScene.update(getSceneSelection())
}

function renderBasket() {
  const count = basket.reduce((total, line) => total + line.quantity, 0)
  const total = basket.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)
  basketCount.textContent = String(count)
  basketSubtotal.textContent = formatPrice(total)
  checkout.hidden = !basket.length
  basketItems.replaceChildren()
  if (!basket.length) {
    basketItems.append(make('p', 'basket-empty', 'Your basket is empty.'))
    return
  }
  const list = make('ul', '')
  for (const [index, line] of basket.entries()) {
    const item = make('li', 'basket-item')
    const details = make('div', 'basket-item-details')
    details.append(make('strong', '', line.name))
    if (line.options.length) details.append(make('p', '', line.options.join(', ')))
    details.append(make('p', '', formatPrice(line.unitPricePence) + ' each'))
    const amount = make('div', 'basket-item-amount')
    const stepper = make('div', 'quantity-stepper')
    stepper.setAttribute('role', 'group')
    stepper.setAttribute('aria-label', 'Quantity of ' + line.name)
    const decrease = make('button', 'quantity-button', '−')
    decrease.type = 'button'
    decrease.dataset.basketAction = 'decrease'
    decrease.setAttribute('aria-label', line.quantity > 1 ? 'Decrease quantity of ' + line.name : 'Remove ' + line.name + ' from basket')
    const quantity = make('span', 'quantity-value', String(line.quantity))
    quantity.setAttribute('aria-label', line.quantity + ' in basket')
    const increase = make('button', 'quantity-button', '+')
    increase.type = 'button'
    increase.dataset.basketAction = 'increase'
    increase.setAttribute('aria-label', 'Increase quantity of ' + line.name)
    increase.disabled = line.quantity >= maxQuantity
    decrease.addEventListener('click', () => changeQuantity(index, -1, 'decrease'))
    increase.addEventListener('click', () => changeQuantity(index, 1, 'increase'))
    stepper.append(decrease, quantity, increase)
    const remove = make('button', 'basket-remove', 'Remove')
    remove.type = 'button'
    remove.dataset.basketAction = 'remove'
    remove.setAttribute('aria-label', 'Remove ' + line.name + ' from basket')
    remove.addEventListener('click', () => changeQuantity(index, -line.quantity, 'remove'))
    amount.append(make('strong', '', formatPrice(line.quantity * line.unitPricePence)), stepper, remove)
    item.append(details, amount)
    list.append(item)
  }
  basketItems.append(list)
}

function changeQuantity(index, delta, action) {
  const line = basket[index]
  if (!line) return
  line.quantity = Math.min(maxQuantity, line.quantity + delta)
  const removed = line.quantity <= 0
  if (removed) basket.splice(index, 1)
  saveBasket(basket)
  renderBasket()
  basketStatus.textContent = removed ? line.name + ' removed from your basket.' :
    line.name + ' quantity is now ' + line.quantity + '.'
  const rows = basketItems.querySelectorAll('.basket-item')
  const row = rows[Math.min(index, rows.length - 1)]
  const next = removed ? row?.querySelector('[data-basket-action="remove"]') :
    row?.querySelector('[data-basket-action="' + action + '"]:not(:disabled)') ??
    row?.querySelector('[data-basket-action="remove"]')
  ;(next ?? document.querySelector('#close-basket')).focus()
}

function buildOrderMessage(note) {
  const rule = '━'.repeat(20)
  let message = '🍔 *ER-HAN BURGER — NEW ORDER*\n' + rule + '\n\n'
  for (const [index, line] of basket.entries()) {
    message += '*' + (index + 1) + '. ' + line.name + '*  x' + line.quantity + '  →  ' +
      formatPrice(line.quantity * line.unitPricePence) + '\n'
    for (const option of line.options) message += '   ' + option + '\n'
    message += '\n'
  }
  const total = basket.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)
  message += rule + '\n*TOTAL:  ' + formatPrice(total) + '*\n' + rule
  if (note) message += '\n\n📝 *Note:* ' + note
  return message + '\n\n_' + orderContact.closingLine + '_'
}

function orderViaWhatsApp() {
  if (!basket.length) return
  const url = 'https://wa.me/' + orderContact.whatsappNumber + '?text=' +
    encodeURIComponent(buildOrderMessage(orderNote.value.trim()))
  const opened = window.open(url, '_blank')
  if (opened) opened.opener = null
  else location.href = url
  basket = []
  saveBasket(basket)
  orderNote.value = ''
  renderBasket()
  basketStatus.textContent = 'WhatsApp has opened with your order. Send the message to place it, and we will confirm your collection time.'
  basketItems.replaceChildren(make('p', 'basket-confirmation', basketStatus.textContent))
  document.querySelector('#close-basket').focus()
}

function addToBasket() {
  const missingGroup = product.optionGroups.find(group =>
    group.options.filter(option => selected.has(option.id)).length < group.min)
  if (missingGroup) {
    basketFeedback.textContent = missingGroup.requiredMessage ?? 'Please complete ' + missingGroup.name.toLowerCase() + '.'
    basketFeedback.classList.add('basket-feedback--visible')
    groups.querySelector('#' + CSS.escape(missingGroup.id) + ' button:not(:disabled)')?.focus()
    return
  }
  const choices = options.filter(option => selected.has(option.id) && !option.locked)
  const optionIds = choices.map(option => option.id)
  const unitPricePence = getUnitPricePence(product, selected)
  const existing = basket.find(line => line.productId === product.id &&
    line.unitPricePence === unitPricePence && JSON.stringify(line.optionIds) === JSON.stringify(optionIds))
  if (existing) existing.quantity += 1
  else basket.push({
    productId: product.id,
    name: product.name,
    unitPricePence,
    quantity: 1,
    optionIds,
    options: choices.map(option => option.name),
  })
  saveBasket(basket)
  basketStatus.textContent = ''
  renderBasket()
  basketFeedback.textContent = product.name + ' added to your basket.'
  basketDialog.showModal()
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
  document.querySelector('#replay').addEventListener('click', () => CharcoalScene.replay())
  addButton.addEventListener('click', addToBasket)
} else {
  renderNotFound()
}
renderBasket()
document.querySelector('#open-basket').addEventListener('click', () => {
  basketStatus.textContent = ''
  renderBasket()
  basketDialog.showModal()
})
document.querySelector('#close-basket').addEventListener('click', () => basketDialog.close())
document.querySelector('#order-whatsapp').addEventListener('click', orderViaWhatsApp)
const callLink = document.querySelector('.call-link')
callLink.href = orderContact.phoneHref
callLink.textContent = 'Or call to order: ' + orderContact.phoneLabel

if (new URLSearchParams(location.search).has('basket')) basketDialog.showModal()
