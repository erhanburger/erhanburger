import { catalog, formatPrice } from '../../catalog.js'
import { renderStill } from './compose.js'
import { setupChrome, make, toast } from './shared.js'

const { basket } = setupChrome({ onKeepBrowsing: () => document.querySelector('#menu-search').focus() })
const sections = document.querySelector('#menu-sections')
const tabs = document.querySelector('#menu-tabs')
const plus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'

// Thumbnails are composed only when they scroll near the screen.
const painter = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    painter.unobserve(entry.target)
    const product = catalog.products.find(p => p.id === entry.target.dataset.product)
    renderStill(entry.target, product, new Set(), { fill: .9 })
  }
}, { rootMargin: '300px' })

for (const category of catalog.categories) {
  const items = catalog.products.filter(p => p.categoryId === category.id)
  if (!items.length) continue
  const tab = make('a', '', category.name)
  tab.href = '#' + category.id
  tabs.append(tab)

  const section = make('section', 'menu-section' + (category.id === 'meal-deals' ? ' menu-section--feature' : ''))
  section.id = category.id
  const heading = make('h2', 'double-rule')
  heading.id = category.id + '-title'
  heading.append(make('span', '', category.name), make('span', 'label', items.length + (items.length === 1 ? ' item' : ' items')))
  section.setAttribute('aria-labelledby', heading.id)
  const list = make('ul', 'menu-list')
  for (const product of items) {
    const row = make('li', 'menu-row')
    row.dataset.search = [product.name, category.name, ...product.optionGroups.flatMap(g => g.options.map(o => o.name))].join(' ').toLowerCase()
    const well = make('div', 'well')
    well.dataset.product = product.id
    well.setAttribute('aria-hidden', 'true')
    painter.observe(well)
    const link = make('a', 'row-link')
    link.href = './product.html?product=' + encodeURIComponent(product.id)
    const meta = make('span', 'row-meta')
    meta.append(make('span', 'price', formatPrice(product.basePricePence)))
    if (product.optionGroups.some(g => g.min)) meta.append(make('span', '', 'Choose ' + product.optionGroups.find(g => g.min).name.replace(/^Choose your /i, '').toLowerCase()))
    else if (product.optionGroups.length) meta.append(make('span', '', 'Customise'))
    if (product.popular) meta.append(make('span', 'tag', 'Popular'))
    link.append(make('span', 'row-name', product.name), meta)
    row.append(well, link)
    if (product.optionGroups.length) {
      const go = make('span', 'row-action')
      go.innerHTML = arrow
      go.setAttribute('aria-hidden', 'true')
      row.append(go)
    } else {
      // Nothing to choose: add straight from the menu.
      const add = make('button', 'row-action row-action--add')
      add.type = 'button'
      add.innerHTML = plus
      add.setAttribute('aria-label', 'Add ' + product.name + ' to basket, ' + formatPrice(product.basePricePence))
      add.addEventListener('click', () => {
        const quantity = basket.addQuietly({ productId: product.id, name: product.name, unitPricePence: product.basePricePence, optionIds: [], options: [] })
        add.classList.add('is-added')
        setTimeout(() => add.classList.remove('is-added'), 900)
        toast(product.name + ' added' + (quantity > 1 ? ' · ' + quantity + ' in basket' : ''), { label: 'View basket', onClick: () => basket.open() })
      })
      row.append(add)
    }
    list.append(row)
  }
  section.append(heading, list)
  sections.append(section)
}

// Active tab follows the scroll position.
const tabLinks = [...tabs.querySelectorAll('a')]
const spy = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    for (const link of tabLinks) {
      const on = link.hash === '#' + entry.target.id
      link.setAttribute('aria-current', String(on))
      if (on) link.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }
}, { rootMargin: '-40% 0px -55% 0px' })
document.querySelectorAll('.menu-section').forEach(section => spy.observe(section))

// Search filters rows and hides empty sections.
const search = document.querySelector('#menu-search')
const empty = document.querySelector('#menu-empty')
search.addEventListener('input', () => {
  const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  let shown = 0
  for (const section of document.querySelectorAll('.menu-section')) {
    let count = 0
    for (const row of section.querySelectorAll('.menu-row')) {
      const match = words.every(word => row.dataset.search.includes(word))
      row.hidden = !match
      if (match) count++
    }
    section.hidden = !count
    shown += count
  }
  empty.hidden = shown > 0
  empty.textContent = shown ? '' : 'Nothing matches “' + search.value.trim() + '”. Try “cheese” or “chips”.'
})
