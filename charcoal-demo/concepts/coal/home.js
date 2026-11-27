import { catalog, formatPrice, findProduct } from '../../catalog.js'
import { orderContact, formatHours } from '../../order-config.js'
import { compose, paintLayer, layerHeight, renderStill } from './compose.js'
import { setupChrome, make } from './shared.js'

setupChrome()

// Hero: the Half Pounder pulled apart layer by layer, like a menu-card diagram.
const board = document.querySelector('#hero-board')
const { product } = findProduct('half-pounder-with-cheese')
const comp = compose(product, new Set(['lettuce', 'tomato']))
const names = { bottom: 'Bun', beef: 'Two beef patties', cheese: 'Cheese', lettuce: 'Lettuce', tomato: 'Tomato', top: 'Bun lid' }
const rig = make('div', 'rig exploded')
const gap = .17
const placed = comp.layers.map((l, i) => ({ ...l, y: l.y + i * gap }))
for (const l of placed) rig.append(paintLayer(new Image(), l))
board.append(rig)
const leaders = placed.filter(l => names[l.id]).map(l => {
  const node = make('span', 'leader', names[l.id])
  node.setAttribute('aria-hidden', 'true')
  board.append(node)
  return [node, l]
})
function fitHero() {
  const { width, height } = board.getBoundingClientRect()
  const top = Math.max(...placed.map(l => l.y + layerHeight(l)))
  const W = Math.min(width * .5, height * .82 / (top + .1))
  rig.style.setProperty('--W', W + 'px')
  const base = height * .15
  for (const [node, l] of leaders) {
    node.style.bottom = base + (l.y + layerHeight(l) * .3) * W + 'px'
    node.style.left = width / 2 + W * (l.w / 2 + .04) + 'px'
  }
}
fitHero()
new ResizeObserver(fitHero).observe(board)

// Featured meal deals, composed from cut-outs on the same board as the builder.
const deals = catalog.products.filter(p => p.categoryId === 'meal-deals' && p.popular)
for (const deal of deals) {
  const [, number, name] = deal.name.match(/^(Deal \d+) – (.+)$/) ?? [, 'Meal deal', deal.name]
  const card = make('a', 'deal-card')
  card.href = './product.html?product=' + deal.id
  const well = make('div', 'well')
  const body = make('div', 'deal-body')
  const foot = make('div', 'deal-foot')
  foot.append(make('span', 'price', formatPrice(deal.basePricePence)), make('span', 'deal-cta', 'Customise →'))
  body.append(make('p', 'label', number + ' · with chips and a drink'), make('h3', '', name.replace(/, Chips & Drink$/, '')), foot)
  card.append(well, body)
  document.querySelector('#deals').append(card)
  renderStill(well, deal, new Set(), { fill: .86 })
}

// Menu index: every category with its starting price.
for (const category of catalog.categories) {
  const items = catalog.products.filter(p => p.categoryId === category.id)
  if (!items.length) continue
  const from = Math.min(...items.map(p => p.basePricePence))
  const link = make('a')
  link.href = './menu.html#' + category.id
  link.append(make('span', 'name', category.name), make('span', 'dots'), make('span', 'label', items.length + ' · from ' + formatPrice(from)))
  const li = make('li')
  li.append(link)
  document.querySelector('#menu-index').append(li)
}
document.querySelector('#menu-count').textContent = catalog.products.length + ' items'
document.querySelector('#visit-hours').replaceChildren(...orderContact.hours.flatMap((h, i) => i ? [make('br'), formatHours(h)] : [formatHours(h)]))
