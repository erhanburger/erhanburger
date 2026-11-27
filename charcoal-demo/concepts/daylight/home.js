import { catalog, formatPrice, orderContact, formatHours, setupChrome, composeFood, dishCard, page, make } from './shared.js'

const { basketUI } = setupChrome()
const half = catalog.products.find(product => product.id === 'half-pounder-with-cheese')
document.querySelector('#hero-plate').prepend(composeFood(half))

const deals = document.querySelector('#featured-deals')
for (const product of catalog.products.filter(item => item.categoryId === 'meal-deals' && item.popular)) {
  deals.append(dishCard(product, basketUI, { mealNote: 'chips and a drink included' }))
}

const index = document.querySelector('#menu-index')
for (const category of catalog.categories) {
  const items = catalog.products.filter(product => product.categoryId === category.id)
  if (!items.length) continue
  const from = Math.min(...items.map(item => item.basePricePence))
  const link = make('a')
  link.href = page('./menu.html#' + category.id)
  link.append(make('span', 'menu-index-name', category.name),
    make('span', 'menu-index-meta', items.length + (items.length === 1 ? ' item' : ' items')),
    make('span', 'menu-index-price', 'from ' + formatPrice(from)))
  const row = make('li')
  row.append(link)
  index.append(row)
}

const hours = document.querySelector('#hours')
for (const entry of orderContact.hours) {
  const [days, ...time] = formatHours(entry).split(' ')
  hours.append(make('dt', '', days), make('dd', '', time.join(' ')))
}
document.querySelector('#map-link').href = orderContact.mapUrl
