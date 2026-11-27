// Shared pieces for the Daylight concept: URLs, light product imagery, the
// static food composer used on cards, the masthead and the basket.
import { catalog, formatPrice, createDefaultSelections } from '../../catalog.js'
import { productProfile } from '../../product-profiles.js'
import { createBasketUI } from '../../basket-ui.js'
import { readBasket } from '../../basket-storage.js'
import { orderContact, openingStatus, formatHours } from '../../order-config.js'

export { catalog, formatPrice, orderContact, openingStatus, formatHours }
export const root = new URL('../../', import.meta.url)
export const here = new URL('./', import.meta.url)
export const asset = path => new URL(path, root).href
export const page = path => new URL(path, here).href

export function make(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

// Drinks keyed from the existing photographs onto transparency (assets/drinks),
// so every can and bottle stands on the same light studio surface.
const keyedDrinks = new Set(['coca-cola-classic', 'coca-cola-zero', 'diet-coke', 'pepsi', 'tango-orange',
  'fanta-orange', 'mirinda-strawberry', 'ribena-strawberry', 'ribena-blackcurrant', 'lucozade-orange', 'red-bull', 'water'])
export const drinkImage = id => keyedDrinks.has(id) ? page('./assets/drinks/' + id + '.webp') : null

export function lightProduct(product) {
  return {
    ...product,
    image: drinkImage(product.id) ?? product.image,
    optionGroups: product.optionGroups.map(group => ({
      ...group,
      options: group.options.map(option => drinkImage(option.id) ? { ...option, image: drinkImage(option.id) } : option),
    })),
  }
}

// The Half Pounder layer set, shared with the charcoal builder's scene. Assets are
// the approved cut-outs (extracted to assets/layers) so cards match the builder.
const layer = name => page('./assets/layers/' + name + '.webp')
const bb = name => asset('../burger-builder-demo/assets/' + name + '.webp')
export const burgerReference = {
  id: 'half-pounder', closingLayerKey: 'top', name: 'Half Pounder with Cheese',
  layers: [
    { key: 'bottom', asset: layer('bottom'), width: .95, step: .141, offset: -.013, required: true },
    { key: 'patty-a', asset: layer('patty-a'), width: .98, step: .126, offset: .007, required: true },
    { key: 'patty-b', asset: layer('patty-b'), width: .96, step: .108, offset: -.014 },
    { key: 'cheese', asset: layer('cheese'), width: .97, step: .032, offset: .004 },
    { key: 'extra-cheese', asset: layer('cheese'), width: .955, step: .034, offset: -.012 },
    { key: 'halloumi', asset: asset('./assets/halloumi.webp'), width: .87, step: .068, offset: -.011 },
    { key: 'egg', asset: asset('./assets/egg.webp'), width: .89, step: .048, offset: .012 },
    { key: 'lettuce', asset: layer('lettuce'), width: 1.05, step: .048, offset: -.002 },
    { key: 'tomato', asset: layer('tomato'), width: .91, step: .068, offset: .017 },
    { key: 'cucumber', asset: bb('cucumber'), width: .91, step: .035, offset: -.012 },
    { key: 'gherkin', asset: bb('pickle'), width: .88, step: .033, offset: .014 },
    { key: 'onion', asset: bb('onion'), width: .90, step: .036, offset: .018 },
    { key: 'top', asset: layer('top'), width: .98, step: 0, offset: .003, required: true },
  ],
}

const kindOf = product => product.categoryId === 'drinks' ? 'drink' :
  product.id === 'halloumi-cheese-sandwich' ? 'sandwich' :
  ['snickers', 'kit-kat', 'mars', 'bounty'].includes(product.id) ? 'sweet' : 'food'

// Composes a product from cut-outs with the same profile the builder animates,
// frozen at rest: one surface, one scale rule, one contact shadow.
export function composeFood(product, { extraKeys = [] } = {}) {
  const light = lightProduct(product)
  let profile = productProfile(light, burgerReference)
  if (!profile.layers) profile = { ...burgerReference, ...profile }
  const selection = new Set([...(profile.fixedLayerKeys ?? []), ...extraKeys])
  for (const id of createDefaultSelections(light)) {
    const option = light.optionGroups.flatMap(group => group.options).find(item => item.id === id)
    for (const key of option?.layerKeys ?? []) selection.add(key)
  }
  if (light.visual === 'meal' && !extraKeys.length) selection.add('drink-coca-cola-classic')
  const food = make('div', 'food')
  food.dataset.visual = profile.visual ?? 'burger'
  food.dataset.kind = kindOf(product)
  food.setAttribute('aria-hidden', 'true')
  const rig = make('div', 'food-rig')
  rig.append(make('div', 'food-contact'))
  let height = 0
  for (const [index, item] of profile.layers.entries()) {
    if (item.sauce || !(item.required || selection.has(item.key))) continue
    const y = item.positionY ?? height
    height += item.step ?? 0
    if (!item.asset) continue
    const image = make('img')
    image.src = asset(item.asset)
    image.alt = ''
    image.loading = 'lazy'
    image.decoding = 'async'
    if (item.menuPhoto) image.className = kindOf(product) === 'sandwich' ? 'framed' : 'menu-photo-img'
    Object.assign(image.style, {
      width: item.width * 100 + 'cqw',
      left: 'calc(50% + ' + (item.offset ?? 0) * 100 + 'cqw)',
      bottom: y * 100 + 'cqw',
      zIndex: String(index + 1),
      transform: 'translateX(-50%) rotate(' + (item.restingAngle ?? 0) + 'deg)',
    })
    rig.append(image)
  }
  food.append(rig)
  return food
}

export const productHref = product => page('./product.html?product=' + encodeURIComponent(product.id))
export function describe(product) {
  if (!product.optionGroups.length) return product.categoryId === 'drinks' ? 'Chilled' : 'Ready as it comes'
  const open = product.optionGroups.find(group => group.min && !group.defaultOptionIds?.length)
  if (open) return open.name.toLowerCase().startsWith('choose') ? open.name.toLowerCase() : 'choose your ' + open.name.toLowerCase()
  const size = product.optionGroups.find(group => group.min && group.max === 1)
  if (size) return size.options.map(option => option.name.toLowerCase()).join(' or ')
  return 'toppings and sauces'
}

// A menu card: the studio picture links to the customise screen; items with
// nothing to choose also get a quick Add button.
export function dishCard(product, basketUI, { headingLevel = 'h3', mealNote } = {}) {
  const item = make('li', 'dish')
  const link = make('a', 'dish-link')
  link.href = productHref(product)
  const studio = make('div', 'studio')
  studio.append(composeFood(product))
  const body = make('div', 'dish-body')
  const name = make(headingLevel, 'dish-name', product.name)
  body.append(name, make('span', 'dish-price', formatPrice(product.basePricePence)))
  const meta = make('p', 'dish-meta')
  if (product.optionGroups.length) meta.append(make('span', 'dish-cta', 'Customise'), document.createTextNode(' · ' + (mealNote ?? describe(product))))
  else meta.textContent = describe(product)
  body.append(meta)
  link.append(studio, body)
  item.append(link)
  if (product.popular) item.append(make('span', 'dish-tag', 'Popular'))
  if (!product.optionGroups.length && basketUI) {
    const add = make('button', 'quick-add', 'Add')
    add.type = 'button'
    add.setAttribute('aria-label', 'Add ' + product.name + ' to basket, ' + formatPrice(product.basePricePence))
    add.addEventListener('click', () => {
      const quantity = basketUI.addQuietly({ productId: product.id, name: product.name,
        unitPricePence: product.basePricePence, optionIds: [], options: [] })
      add.textContent = quantity > 1 ? quantity + ' in basket' : 'Added'
      add.classList.add('is-added')
      clearTimeout(add.reset)
      add.reset = setTimeout(() => { add.textContent = 'Add'; add.classList.remove('is-added') }, 1800)
    })
    item.append(add)
  }
  return item
}

// Masthead, bottom bar and basket wiring shared by every page.
export function setupChrome() {
  const dialog = document.querySelector('#basket-dialog')
  const counts = [...document.querySelectorAll('[data-basket-count]')]
  const totals = [...document.querySelectorAll('[data-basket-total]')]
  const primary = counts[0]
  const basketUI = createBasketUI({ dialog, countNode: primary, keepBrowsingHref: page('./menu.html') })
  const sync = () => {
    const lines = readBasket()
    const count = lines.reduce((sum, line) => sum + line.quantity, 0)
    const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)
    for (const node of counts) if (node !== primary) node.textContent = String(count)
    for (const node of totals) node.textContent = count ? formatPrice(total) : ''
    for (const button of document.querySelectorAll('[data-open-basket]')) {
      button.dataset.empty = String(!count)
      const label = count ? 'Basket, ' + count + (count === 1 ? ' item, ' : ' items, ') + formatPrice(total) : 'Basket, empty'
      button.setAttribute('aria-label', label)
    }
  }
  let last = primary.textContent
  new MutationObserver(() => {
    sync()
    if (primary.textContent !== last && Number(primary.textContent) > Number(last)) {
      for (const button of document.querySelectorAll('.basket-toggle')) {
        button.classList.remove('is-bumped'); void button.offsetWidth; button.classList.add('is-bumped')
      }
    }
    last = primary.textContent
  }).observe(primary, { childList: true, characterData: true, subtree: true })
  sync()
  for (const button of document.querySelectorAll('[data-open-basket]')) button.addEventListener('click', () => basketUI.open())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  for (const node of document.querySelectorAll('[data-open-status]')) {
    const shop = openingStatus()
    node.textContent = shop.text
    node.dataset.open = String(shop.open)
  }
  if (new URLSearchParams(location.search).has('basket')) basketUI.open()
  return { basketUI, sync }
}
