import { catalog, formatPrice } from './catalog.js'
import { createBasketUI } from './basket-ui.js'
import { orderContact, formatHours } from './order-config.js'
import { initShell, make, productHref } from './shell.js'
import { productArt } from './art.js'

const status = initShell({ active: 'home' })
const statusNode = document.querySelector('#open-status')
statusNode.textContent = status.open ? status.text + ' · Collection only' :
  status.text + '. Pre-order now and we confirm it when we open.'
statusNode.classList.toggle('is-closed', !status.open)
if (!status.open && status.opensAt) {
  document.querySelector('#start-order').textContent = 'Pre-order for ' + status.opensAt
}

const halfPounder = catalog.products.find(({ id }) => id === 'half-pounder-with-cheese')
if (halfPounder) {
  for (const node of document.querySelectorAll('#hero-price, [data-hero-price]')) node.textContent = formatPrice(halfPounder.basePricePence)
}

const deals = document.querySelector('#popular-deals')
for (const deal of catalog.products.filter(({ popular }) => popular)) {
  const item = make('li', 'deal-card')
  const [, contents] = deal.name.split(' – ')
  const body = make('div', 'deal-body')
  const name = make('h3', 'deal-name')
  const link = make('a', 'deal-link', contents ?? deal.name)
  link.setAttribute('aria-label', deal.name)
  link.href = productHref(deal.id)
  name.append(link)
  const foot = make('div', 'deal-foot')
  foot.append(make('span', 'price', formatPrice(deal.basePricePence)), make('span', 'menu-customise', 'Choose a drink'))
  foot.lastChild.setAttribute('aria-hidden', 'true')
  body.append(make('p', 'label deal-no', 'Popular meal deal'), name, foot)
  item.append(productArt(deal, { eager: true }), body)
  deals.append(item)
}

const categoryGrid = document.querySelector('#category-grid')
for (const [index, category] of catalog.categories.entries()) {
  const items = catalog.products.filter(({ categoryId }) => categoryId === category.id)
  if (!items.length) continue
  const from = Math.min(...items.map(({ basePricePence }) => basePricePence))
  const item = make('li')
  const link = make('a', 'category-row')
  link.href = './menu.html#' + category.id
  const cover = items.find(product => !product.art) ?? items[0]
  link.append(make('span', 'category-no', String(index + 1).padStart(2, '0')),
    productArt(cover, { className: 'art--thumb', eager: true }),
    make('span', 'category-row-name', category.name),
    make('span', 'label category-row-meta', items.length + (items.length === 1 ? ' item' : ' items') + ' · from ' + formatPrice(from)))
  item.append(link)
  categoryGrid.append(item)
}

// The menu section's feature: a plated shish, built like the builder shows it.
const featured = catalog.products.find(({ id }) => id === 'chicken-shish-medium-with-chips')
if (featured) {
  const feature = document.querySelector('#feature-dish')
  feature.append(productArt(featured, { eager: true }),
    make('span', 'feature-caption', featured.name), make('span', 'price', formatPrice(featured.basePricePence)))
}

for (const link of document.querySelectorAll('.phone-link')) {
  link.href = orderContact.phoneHref
  link.textContent = orderContact.phoneLabel
}
document.querySelector('#visit-address').textContent = orderContact.address
document.querySelector('#visit-map').href = orderContact.mapUrl
document.querySelector('#visit-hours').append(...orderContact.hours.map(hours => {
  const [days, ...times] = formatHours(hours).split(' ')
  const row = make('li')
  row.append(make('span', '', days), make('span', '', times.join(' ')))
  return row
}))

createBasketUI({ dialog: document.querySelector('#basket-dialog') })
