import {
  catalog, halfPounder, createDefaultSelections, formatPrice, getUnitPricePence,
} from './catalog.js'
import { CharcoalScene } from './scene.js'
import { productProfile } from './product-profiles.js'

const requestedProduct = new URLSearchParams(location.search).get('product')
const product = catalog.products.find(item => item.id === requestedProduct) ?? halfPounder
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
const controls = new Map()
const optionsById = new Map(options.map(option => [option.id, option]))
const basketKey = 'erhan_product_builder_basket_v1'

function readBasket() {
  try {
    const records = JSON.parse(localStorage.getItem(basketKey))
    if (!Array.isArray(records)) return []
    return records.filter(line => line && typeof line.productId === 'string' &&
      typeof line.name === 'string' && Number.isSafeInteger(line.unitPricePence) &&
      line.unitPricePence >= 0 && Number.isSafeInteger(line.quantity) &&
      line.quantity > 0 && Array.isArray(line.optionIds) && Array.isArray(line.options) &&
      line.options.every(option => typeof option === 'string'))
  } catch {
    return []
  }
}

let basket = readBasket()

function saveBasket() {
  try {
    localStorage.setItem(basketKey, JSON.stringify(basket))
  } catch {
    // The in-memory basket still works when storage is unavailable.
  }
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
    const splitAt = name.search(/ (?=with |– )/i)
    const [first, emphasis] = product.titleLines ?? (splitAt < 0 ? [name] :
      [name.slice(0, splitAt), name.slice(splitAt + 1)])
    title.replaceChildren(document.createTextNode(first))
    if (emphasis) title.append(make('em', '', emphasis))
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
  basketItems.replaceChildren()
  if (!basket.length) {
    basketItems.append(make('p', 'basket-empty', 'Your basket is empty.'))
    return
  }
  const list = make('ul', '')
  for (const [index, line] of basket.entries()) {
    const item = make('li', 'basket-item')
    const details = make('div', 'basket-item-details')
    details.append(make('strong', '', line.quantity + ' × ' + line.name))
    if (line.options.length) details.append(make('p', '', line.options.join(', ')))
    const amount = make('div', 'basket-item-amount')
    const remove = make('button', 'basket-remove', 'Remove')
    remove.type = 'button'
    remove.setAttribute('aria-label', 'Remove ' + line.name + ' from basket')
    remove.addEventListener('click', () => {
      basket = basket.filter((_, position) => position !== index)
      saveBasket()
      renderBasket()
      const nextControl = basketItems.querySelector('.basket-remove') ?? document.querySelector('#close-basket')
      nextControl.focus()
    })
    amount.append(make('strong', '', formatPrice(line.quantity * line.unitPricePence)), remove)
    item.append(details, amount)
    list.append(item)
  }
  basketItems.append(list)
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
  saveBasket()
  renderBasket()
  basketFeedback.textContent = product.name + ' added to your basket.'
  basketDialog.showModal()
}

renderProduct()
updatePriceAndControls()
renderBasket()
CharcoalScene.init({
  profile: preview,
  selection: getSceneSelection(),
})
document.querySelector('#replay').addEventListener('click', () => CharcoalScene.replay())
document.querySelector('#open-basket').addEventListener('click', () => basketDialog.showModal())
document.querySelector('#close-basket').addEventListener('click', () => basketDialog.close())
addButton.addEventListener('click', addToBasket)
