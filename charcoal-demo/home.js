import { catalog, formatPrice } from './catalog.js'
import { createBasketUI } from './basket-ui.js'
import { orderContact, openingStatus, formatHours } from './order-config.js'

function make(tag, className, label) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (label) node.textContent = label
  return node
}

const productLink = id => './product.html?product=' + encodeURIComponent(id)

const status = openingStatus()
const statusNode = document.querySelector('#open-status')
statusNode.textContent = status.text
statusNode.dataset.open = String(status.open)
if (!status.open && status.opensAt) {
  document.querySelector('.hero-actions .order-button').firstChild.textContent = 'Pre-order for ' + status.opensAt + ' '
}

const halfPounder = catalog.products.find(({ id }) => id === 'half-pounder-with-cheese')
if (halfPounder) document.querySelector('#hero-price').textContent = formatPrice(halfPounder.basePricePence)

const deals = document.querySelector('#popular-deals')
for (const deal of catalog.products.filter(({ popular }) => popular)) {
  const item = make('li')
  const link = make('a', 'deal-card')
  link.href = productLink(deal.id)
  const image = make('img')
  image.src = deal.image
  image.alt = ''
  image.loading = 'lazy'
  const [title, contents] = deal.name.split(' – ')
  const text = make('span', 'deal-text')
  text.append(make('span', 'deal-tag', 'Popular'), make('strong', '', contents ?? title),
    make('span', 'deal-meta', title + ' · drink included'), make('span', 'deal-price', formatPrice(deal.basePricePence)))
  link.append(image, text)
  item.append(link)
  deals.append(item)
}

const categoryGrid = document.querySelector('#category-grid')
for (const category of catalog.categories) {
  const items = catalog.products.filter(({ categoryId }) => categoryId === category.id)
  if (!items.length) continue
  const from = Math.min(...items.map(({ basePricePence }) => basePricePence))
  const item = make('li')
  const link = make('a', 'category-card')
  link.href = './menu.html#' + category.id
  const image = make('img')
  image.src = items[0].image
  image.alt = ''
  image.loading = 'lazy'
  link.append(image, make('strong', '', category.name),
    make('span', '', items.length + (items.length === 1 ? ' item' : ' items') + ' · from ' + formatPrice(from)))
  item.append(link)
  categoryGrid.append(item)
}

for (const link of document.querySelectorAll('.phone-link')) {
  link.href = orderContact.phoneHref
  link.textContent = orderContact.phoneLabel
}
document.querySelector('#visit-address').textContent = orderContact.address
document.querySelector('#visit-map').href = orderContact.mapUrl
document.querySelector('#visit-hours').append(...orderContact.hours.map(hours => make('li', '', formatHours(hours))))

const basketUI = createBasketUI({
  dialog: document.querySelector('#basket-dialog'),
  countNode: document.querySelector('#basket-count'),
})
document.querySelector('#open-basket').addEventListener('click', () => basketUI.open())
