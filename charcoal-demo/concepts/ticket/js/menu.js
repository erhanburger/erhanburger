import { catalog, halfPounder, formatPrice, createDefaultSelections, productUrl, productsIn, needsChoice, getUnitPricePence } from './data.js'
import { createFood } from './food.js'
import { initShell, mountTicket, store, bump } from './ticket.js'

initShell({ active: 'menu' })
const rail = document.querySelector('[data-rail]')
if (matchMedia('(min-width: 1100px)').matches) mountTicket(rail, { variant: 'rail' })
else matchMedia('(min-width: 1100px)').addEventListener('change', function once(event) {
  if (!event.matches) return
  mountTicket(rail, { variant: 'rail' })
  event.target.removeEventListener('change', once)
})

const sections = document.querySelector('[data-sections]')
const chips = document.querySelector('[data-chips]')
const plusIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
const cards = []
document.querySelector('[data-menu-count]').textContent = catalog.products.length + ' items'

const tags = product => {
  const out = []
  if (product.popular) out.push('Popular')
  if (product.categoryId === 'veggie-burgers') out.push('Vegetarian')
  return out
}

function card(product) {
  const li = document.createElement('li')
  li.className = 'item'
  li.dataset.search = (product.name + ' ' + product.categoryId).toLowerCase()
  const choose = needsChoice(product)
  const required = product.optionGroups.find(group => group.min > 0 && !group.defaultOptionIds)
  const hint = required ? required.name.replace('Choose your', 'Choose a') : choose ? 'Customise' : ''
  li.innerHTML = `<div class="plate"><div class="food-slot"></div></div>
    <div class="item-text"><h3 class="item-name"><a></a></h3>
      <div class="item-meta"><span class="price">${formatPrice(product.basePricePence)}</span>${hint ? `<span class="label">${hint}</span>` : ''}${tags(product).map(t => `<span class="tag">${t}</span>`).join('')}</div></div>
    <div class="item-action"></div>`
  const link = li.querySelector('.item-name a')
  link.textContent = product.name
  link.href = productUrl(product)
  const action = li.querySelector('.item-action')
  if (choose) {
    const btn = document.createElement('a')
    btn.className = 'custom-btn'
    btn.href = productUrl(product)
    btn.textContent = required ? 'Choose' : 'Customise'
    btn.setAttribute('aria-label', (required ? 'Choose options for ' : 'Customise ') + product.name)
    action.append(btn)
  } else {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'add-btn'
    btn.innerHTML = plusIcon
    btn.setAttribute('aria-label', 'Add ' + product.name + ' to basket, ' + formatPrice(product.basePricePence))
    let timer
    btn.addEventListener('click', () => {
      const quantity = store.add({ productId: product.id, name: product.name, unitPricePence: product.basePricePence, optionIds: [], options: [] })
      btn.classList.add('is-added')
      btn.innerHTML = `<span class="add-n">${quantity}</span>`
      bump(btn)
      document.querySelectorAll('[data-ticket-count]').forEach(bump)
      clearTimeout(timer)
      timer = setTimeout(() => { btn.classList.remove('is-added'); btn.innerHTML = plusIcon }, 1400)
    })
    action.append(btn)
  }
  const slot = li.querySelector('.food-slot')
  slot.style.cssText = 'position:absolute;inset:0'
  li.foodSlot = slot
  li.product = product
  cards.push(li)
  return li
}

// Featured builder card at the top of the beef burgers, like a ticket header.
function feature() {
  const a = document.createElement('a')
  a.className = 'feature'
  a.href = './product.html'
  a.innerHTML = `<div class="feature-body"><div><p class="label">Build your own</p><p class="display">Half Pounder with Cheese</p></div>
    <span class="btn">Build it · ${formatPrice(halfPounder.basePricePence)}</span></div><div class="plate"><div class="food-slot" style="position:absolute;inset:4% 0 0"></div></div>`
  sections.querySelector('#beef-burgers .items').before(a)
  createFood(a.querySelector('.food-slot'), halfPounder, { mode: 'thumb' }).update(createDefaultSelections(halfPounder, ['lettuce', 'tomato']))
}

for (const category of catalog.categories) {
  const products = productsIn(category.id)
  const section = document.createElement('section')
  section.className = 'menu-section'
  section.id = category.id
  section.setAttribute('aria-labelledby', category.id + '-h')
  section.innerHTML = `<div class="menu-section-head"><h2 class="display" id="${category.id}-h"></h2><span class="label">${products.length} items</span></div><ul class="items"></ul>`
  section.querySelector('h2').textContent = category.name
  const list = section.querySelector('.items')
  const sorted = category.id === 'beef-burgers' ? [...products].sort((a, b) => a.basePricePence - b.basePricePence) : products
  for (const product of sorted) list.append(card(product))
  sections.append(section)
  const chip = document.createElement('a')
  chip.className = 'chip'
  chip.href = '#' + category.id
  chip.dataset.target = category.id
  chip.innerHTML = `<span></span><span class="chip-n">${products.length}</span>`
  chip.firstChild.textContent = category.name
  chips.append(chip)
}
feature()

// Draw food only when a card is near the viewport.
const drawObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    const li = entry.target
    drawObserver.unobserve(li)
    createFood(li.foodSlot, li.product, { mode: 'thumb' }).update(createDefaultSelections(li.product))
  }
}, { rootMargin: '400px 0px' })
cards.forEach(li => drawObserver.observe(li))

// Scroll spy for the sticky chips.
const chipFor = id => chips.querySelector(`[data-target="${id}"]`)
let currentId = null
function setActive(id) {
  if (id === currentId) return
  currentId = id
  chips.querySelectorAll('[aria-current]').forEach(chip => chip.removeAttribute('aria-current'))
  const chip = chipFor(id)
  if (!chip) return
  chip.setAttribute('aria-current', 'true')
  const left = chip.offsetLeft - chips.clientWidth / 2 + chip.clientWidth / 2
  chips.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
function spy() {
  const line = document.querySelector('.chips-bar').getBoundingClientRect().bottom + 24
  let active = null
  for (const section of sections.children) {
    if (section.hidden) continue
    if (section.getBoundingClientRect().top <= line) active = section.id
  }
  setActive(active ?? sections.querySelector('.menu-section:not([hidden])')?.id)
}
addEventListener('scroll', spy, { passive: true })
spy()

// Search: filters cards and hides empty sections.
const search = document.querySelector('#menu-search')
const empty = document.querySelector('[data-empty]')
const status = document.querySelector('[data-search-status]')
function filter() {
  const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean)
  let shown = 0
  for (const li of cards) {
    const match = words.every(word => li.dataset.search.includes(word))
    li.hidden = !match
    if (match) shown++
  }
  for (const section of sections.children) {
    const visible = section.querySelectorAll('.item:not([hidden])').length
    section.hidden = !visible
    chipFor(section.id).hidden = !visible
  }
  const feat = sections.querySelector('.feature')
  if (feat) feat.hidden = words.length > 0
  empty.hidden = shown > 0
  status.textContent = words.length ? shown + (shown === 1 ? ' item' : ' items') + ' found.' : ''
  spy()
}
search.addEventListener('input', filter)
document.querySelector('[data-clear]').addEventListener('click', () => { search.value = ''; filter(); search.focus() })
