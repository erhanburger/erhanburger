import { catalog, formatPrice } from './catalog.js'
import { createBasketUI } from './basket-ui.js'
import { orderContact } from './order-config.js'
import { initShell, make, productHref } from './shell.js'
import { productArt } from './art.js'

const shop = initShell({ active: 'menu' })
const categories = document.querySelector('.menu-categories')
const products = document.querySelector('#menu-products')
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

const basketUI = createBasketUI({
  dialog: document.querySelector('#basket-dialog'),
  rail: document.querySelector('#menu-ticket'),
  onKeepBrowsing: () => document.querySelector('.menu-categories a[aria-current]')?.focus({ preventScroll: true }),
})

// One honest line under each name, taken from the item's choices.
function describe(product) {
  const groups = product.optionGroups
  if (!groups.length) return 'Add straight to your basket'
  if (product.categoryId === 'meal-deals') return 'With chips and a drink of your choice'
  const required = groups.find(group => group.min && !group.defaultOptionIds?.length)
  if (required) return required.name.toLowerCase().startsWith('choose') ? required.name : 'Choose your ' + required.name.toLowerCase()
  const size = groups.find(group => group.min && group.max === 1)
  if (size) return size.options.map(option => option.name).join(' or ')
  return 'Toppings and sauces your way'
}

const sections = []
let number = 0
for (const { id, name } of catalog.categories) {
  const items = catalog.products.filter(product => product.categoryId === id)
  if (!items.length) continue
  number++
  const label = String(number).padStart(2, '0')
  const shortcut = make('a', 'category-link')
  shortcut.href = '#' + id
  shortcut.append(make('span', 'category-no', label), make('span', 'category-name', name), make('span', 'category-count', String(items.length)))
  shortcut.setAttribute('aria-label', name + ', ' + items.length + (items.length === 1 ? ' item' : ' items'))
  categories.append(shortcut)

  const section = make('section', 'menu-group')
  section.id = id
  const head = make('div', 'menu-group-head')
  const heading = make('h2', 'menu-group-title', name)
  heading.id = id + '-heading'
  head.append(make('span', 'menu-group-no', label), heading, make('span', 'label menu-group-count', items.length + (items.length === 1 ? ' item' : ' items')))
  section.setAttribute('aria-labelledby', heading.id)
  const grid = make('ul', 'menu-grid')
  for (const [index, product] of items.entries()) {
    const item = make('li', 'menu-item')
    const art = productArt(product, { eager: number === 1 && index < 4 })
    const body = make('div', 'menu-card-body')
    if (product.popular) body.append(make('span', 'tag', 'Popular'))
    const title = make('h3', 'menu-card-name')
    const link = make('a', 'menu-card-link', product.name)
    link.href = productHref(product.id)
    title.append(link)
    body.append(title, make('p', 'menu-card-note', describe(product)))
    const foot = make('div', 'menu-card-foot')
    foot.append(make('span', 'price', formatPrice(product.basePricePence)))
    item.dataset.search = [product.name, name, ...product.optionGroups.flatMap(group =>
      group.options.map(option => option.name))].join(' ').toLowerCase()
    if (!product.optionGroups.length) {
      // Items with nothing to choose are added straight from the menu.
      item.classList.add('menu-item--quick')
      const add = make('button', 'button button--small menu-quick-add')
      add.type = 'button'
      add.append(make('span', 'add-plus', '+'), make('span', 'add-text', 'Add'))
      add.setAttribute('aria-label', 'Add ' + product.name + ' to basket, ' + formatPrice(product.basePricePence))
      add.addEventListener('click', () => {
        const quantity = basketUI.addQuietly({ productId: product.id, name: product.name,
          unitPricePence: product.basePricePence, optionIds: [], options: [] })
        add.querySelector('.add-text').textContent = quantity > 1 ? quantity + ' in basket' : 'Added'
        add.querySelector('.add-plus').textContent = '✓'
        add.classList.add('is-added')
        clearTimeout(add.reset)
        add.reset = setTimeout(() => {
          add.querySelector('.add-text').textContent = 'Add'
          add.querySelector('.add-plus').textContent = '+'
          add.classList.remove('is-added')
        }, 1800)
      })
      foot.append(add)
    } else {
      const customise = make('span', 'menu-customise', 'Customise')
      customise.setAttribute('aria-hidden', 'true')
      foot.append(customise)
    }
    item.append(art, body, foot)
    grid.append(item)
  }
  section.append(head, grid)
  products.append(section)
  sections.push({ section, shortcut })
}

// A strip of dishes in the heading, drawn like the cards (wide screens only).
const feature = document.querySelector('#menu-feature')
for (const id of ['half-pounder-with-cheese', 'chicken-shish-medium-with-chips', 'hot-dog-with-cheese']) {
  const product = catalog.products.find(item => item.id === id)
  if (!product) continue
  const tile = make('li')
  tile.append(productArt(product, { eager: true }))
  feature.append(tile)
}

const menuCall = document.querySelector('#menu-call')
menuCall.href = orderContact.phoneHref
menuCall.textContent = orderContact.phoneLabel
if (new URLSearchParams(location.search).has('basket')) basketUI.open()

const menuStatus = document.querySelector('#menu-status')
menuStatus.textContent = shop.open ? shop.text + '.' : shop.text + '. You can still send an order for collection when we open.'
menuStatus.dataset.open = String(shop.open)

// The category in view is marked in the chips and the contents rail.
const rail = document.querySelector('.menu-rail')
let marked = null
function markCurrent(current) {
  marked = current
  for (const { section, shortcut } of sections) {
    if (section === current) shortcut.setAttribute('aria-current', 'true')
    else shortcut.removeAttribute('aria-current')
  }
  const link = sections.find(({ section }) => section === current)?.shortcut
  if (link && categories.scrollWidth > categories.clientWidth) {
    const offset = link.getBoundingClientRect().left - categories.getBoundingClientRect().left
    categories.scrollTo({ left: categories.scrollLeft + offset - 16, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
  }
}
let ticking = false
let lockUntil = 0
function followScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    if (performance.now() < lockUntil) return
    // A section is current once its heading passes a line under the sticky bars.
    const bar = innerWidth < 900 ? rail.getBoundingClientRect().bottom : document.querySelector('.appbar').getBoundingClientRect().bottom
    const line = Math.max(bar + 48, innerHeight * .3)
    const visible = sections.filter(({ section }) => !section.hidden)
    let current = visible[0]?.section
    for (const { section } of visible) if (section.getBoundingClientRect().top <= line) current = section
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = visible[visible.length - 1]?.section
    if (current && current !== marked) markCurrent(current)
  })
}
addEventListener('scroll', followScroll, { passive: true })
addEventListener('resize', followScroll, { passive: true })
markCurrent(sections[0]?.section)
// Jumping to a section (chip, contents rail or a link with #section) marks it at once.
function markFromHash() {
  const target = sections.find(({ section }) => '#' + section.id === location.hash)
  if (!target) return
  markCurrent(target.section)
  lockUntil = performance.now() + 900
}
addEventListener('hashchange', markFromHash)
for (const { section, shortcut } of sections) {
  shortcut.addEventListener('click', () => {
    markCurrent(section)
    lockUntil = performance.now() + 900
  })
}
if (location.hash) requestAnimationFrame(markFromHash)

const search = document.querySelector('#menu-search')
const searchStatus = document.querySelector('#search-status')
function applySearch() {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean)
  let shown = 0
  for (const { section, shortcut } of sections) {
    let visible = 0
    for (const item of section.querySelectorAll('.menu-grid > li')) {
      const match = words.every(word => item.dataset.search.includes(word))
      item.hidden = !match
      if (match) visible++
    }
    section.hidden = !visible
    shortcut.hidden = !visible
    shown += visible
  }
  document.querySelector('#menu-no-results').hidden = shown > 0
  searchStatus.textContent = words.length ? shown + (shown === 1 ? ' item matches.' : ' items match.') : ''
  followScroll()
}
search.addEventListener('input', () => {
  applySearch()
  compactForSearch()
})
// On phones the heading folds away while searching and the results start right
// under the search field, above the on-screen keyboard.
function compactForSearch() {
  if (innerWidth >= 900) return
  document.body.classList.add('is-searching')
  const top = document.querySelector('.menu-shell').getBoundingClientRect().top + scrollY
  if (scrollY > top || search.value) scrollTo({ top, behavior: 'auto' })
}
search.addEventListener('focus', () => {
  if (innerWidth < 900) document.body.classList.add('is-searching')
})
search.addEventListener('blur', () => {
  if (!search.value) document.body.classList.remove('is-searching')
})
document.querySelector('#clear-search').addEventListener('click', () => {
  search.value = ''
  applySearch()
  search.focus()
})
