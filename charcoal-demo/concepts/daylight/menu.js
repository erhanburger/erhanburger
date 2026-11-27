import { catalog, setupChrome, dishCard, make } from './shared.js'

const { basketUI } = setupChrome()
const nav = document.querySelector('#cat-nav')
const sections = document.querySelector('#menu-sections')
const noResults = document.querySelector('#no-results')
const links = new Map()

let number = 0
for (const category of catalog.categories) {
  const items = catalog.products.filter(product => product.categoryId === category.id)
  if (!items.length) continue
  number += 1
  const link = make('a', '', category.name)
  link.href = '#' + category.id
  link.append(make('span', '', String(items.length)))
  nav.append(link)
  links.set(category.id, link)

  const section = make('section', 'menu-section')
  section.id = category.id
  const header = make('header')
  const heading = make('h2', '', category.name)
  heading.id = category.id + '-title'
  section.setAttribute('aria-labelledby', heading.id)
  header.append(make('span', 'num', String(number).padStart(2, '0')), heading)
  if (category.id === 'meal-deals') header.append(make('p', '', 'Each with chips and a drink of your choice'))
  if (category.id === 'drinks') header.append(make('p', '', 'Cans, bottles and cartons, chilled'))
  const grid = make('ul', 'dish-grid')
  for (const product of items) {
    const card = dishCard(product, basketUI, product.categoryId === 'meal-deals' ? { mealNote: 'chips and a drink' } : {})
    card.dataset.search = [product.name, category.name, ...product.optionGroups.flatMap(group =>
      group.options.map(option => option.name))].join(' ').toLowerCase()
    grid.append(card)
  }
  section.append(header, grid)
  sections.append(section)
}

// Highlight the category in view and keep its tab visible on phones.
let current
function setCurrent(id) {
  if (id === current) return
  current = id
  for (const [key, link] of links) link.toggleAttribute('aria-current', key === id)
  const link = links.get(id)
  if (link) link.setAttribute('aria-current', 'true')
  if (link && matchMedia('(max-width: 900px)').matches) {
    nav.scrollTo({ left: link.offsetLeft - 16, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
}
function onScroll() {
  const offset = matchMedia('(max-width: 900px)').matches ? 200 : 140
  let active = sections.querySelector('.menu-section:not([hidden])')?.id
  for (const section of sections.querySelectorAll('.menu-section:not([hidden])')) {
    if (section.getBoundingClientRect().top - offset <= 0) active = section.id
  }
  setCurrent(active)
}
addEventListener('scroll', onScroll, { passive: true })
onScroll()

const search = document.querySelector('#menu-search')
search.addEventListener('input', () => {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean)
  let shown = 0
  for (const section of sections.querySelectorAll('.menu-section')) {
    let visible = 0
    for (const item of section.querySelectorAll('.dish')) {
      const match = words.every(word => item.dataset.search.includes(word))
      item.hidden = !match
      if (match) visible++
    }
    section.hidden = !visible
    links.get(section.id).hidden = !visible
    shown += visible
  }
  noResults.hidden = shown > 0
  onScroll()
})
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
