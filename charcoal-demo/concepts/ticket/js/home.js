import { catalog, halfPounder, formatPrice, createDefaultSelections, productUrl, productsIn, shortName } from './data.js'
import { createFood } from './food.js'
import { initShell, orderContact, formatHours } from './ticket.js'

initShell({ active: 'home' })

// Hero: the Half Pounder as it comes, with lettuce and burger sauce like the ticket above it.
const heroSelection = createDefaultSelections(halfPounder, ['lettuce', 'burger-sauce'])
createFood(document.querySelector('[data-hero-food]'), halfPounder, { mode: 'hero', lidOpen: false }).update(heroSelection)
document.querySelector('[data-hero-price]').textContent = formatPrice(halfPounder.basePricePence)

// Featured deals: the three the catalogue marks as popular.
const deals = document.querySelector('[data-deals]')
for (const deal of catalog.products.filter(product => product.categoryId === 'meal-deals' && product.popular)) {
  const card = document.createElement('a')
  card.className = 'deal'
  card.href = productUrl(deal)
  const number = deal.name.match(/^Deal (\d+)/)?.[1]
  card.innerHTML = `<div class="plate"><div class="food-slot"></div></div>
    <div class="deal-body"><div><p class="label deal-no">Deal ${number}</p><h3></h3></div>
    <div class="deal-foot"><span class="price">${formatPrice(deal.basePricePence)}</span><span class="deal-go">Choose your drink</span></div></div>`
  card.querySelector('h3').textContent = shortName(deal.name)
  card.setAttribute('aria-label', deal.name + ', ' + formatPrice(deal.basePricePence) + '. Choose your drink.')
  deals.append(card)
  const slot = card.querySelector('.food-slot')
  slot.style.cssText = 'position:absolute;inset:6% 4% 0'
  // Shown with Coca-Cola Classic as an example drink; the customer chooses on the next screen.
  createFood(slot, deal, { mode: 'thumb' }).update(createDefaultSelections(deal, ['coca-cola-classic']))
}

// Categories with item counts and starting prices from the catalogue.
const cats = document.querySelector('[data-cats]')
for (const category of catalog.categories) {
  const items = productsIn(category.id)
  const from = Math.min(...items.map(product => product.basePricePence))
  const li = document.createElement('li')
  li.innerHTML = `<a href="./menu.html#${category.id}"><span class="display"></span><span class="label">${items.length} items<br>from ${formatPrice(from)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>`
  li.querySelector('.display').textContent = category.name
  cats.append(li)
}

const hours = document.querySelector('[data-hours]')
for (const slot of orderContact.hours) {
  const [days, ...time] = formatHours(slot).split(' ')
  const row = hours.insertRow()
  row.insertCell().textContent = days
  row.insertCell().textContent = time.join(' ')
}
for (const link of document.querySelectorAll('[data-phone]')) {
  link.href = orderContact.phoneHref
  if (!link.textContent.trim() || link.textContent === 'Call') link.textContent = 'Call ' + orderContact.phoneLabel
}
document.querySelector('[data-map]').href = orderContact.mapUrl
