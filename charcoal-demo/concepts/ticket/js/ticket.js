// The basket as a kitchen ticket. The ticket prints the exact WhatsApp message
// (same format as ../../basket-ui.js), so what the customer reads is what is sent.
import { formatPrice } from './data.js'
import { readBasket, saveBasket, maxQuantity, readLastOrder, saveLastOrder } from '../../../basket-storage.js'
import { orderContact, openingStatus, formatHours } from '../../../order-config.js'

export { orderContact, openingStatus, formatHours }

const RULE = '━'.repeat(20)
const make = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

// ---------- store ----------
const listeners = new Set()
const state = {
  basket: readBasket(),
  note: '',
  name: (() => { try { return localStorage.getItem('erhan_order_name') ?? '' } catch { return '' } })(),
  phase: 'edit', // edit | sent-check | thanks
  lastSent: null,
  announce: '',
}
const emit = () => listeners.forEach(fn => fn(state))
export const store = {
  state,
  subscribe(fn) { listeners.add(fn); fn(state); return () => listeners.delete(fn) },
  count: () => state.basket.reduce((sum, line) => sum + line.quantity, 0),
  total: () => state.basket.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0),
  add(line) {
    state.basket = readBasket()
    const existing = state.basket.find(item => item.productId === line.productId &&
      item.unitPricePence === line.unitPricePence &&
      JSON.stringify(item.optionIds) === JSON.stringify(line.optionIds))
    if (existing) existing.quantity = Math.min(maxQuantity, existing.quantity + 1)
    else state.basket.push({ ...line, quantity: 1 })
    saveBasket(state.basket)
    state.phase = 'edit'
    state.announce = line.name + ' added to your ticket. ' + store.count() + ' items, ' + formatPrice(store.total()) + '.'
    emit()
    return existing?.quantity ?? 1
  },
  change(index, delta) {
    const line = state.basket[index]
    if (!line) return
    line.quantity = Math.min(maxQuantity, line.quantity + delta)
    if (line.quantity <= 0) {
      state.basket.splice(index, 1)
      state.announce = line.name + ' removed from your ticket.'
    } else state.announce = line.name + ': ' + line.quantity + '.'
    saveBasket(state.basket)
    emit()
  },
  setName(value) {
    state.name = value
    try { localStorage.setItem('erhan_order_name', value.trim()) } catch {}
    emit()
  },
  setNote(value) { state.note = value; emit() },
  setPhase(phase) { state.phase = phase; emit() },
  confirmSent() {
    const order = { sentAt: new Date().toISOString(), totalPence: store.total(),
      lines: state.basket.map(({ name, quantity, unitPricePence, options }) => ({ name, quantity, unitPricePence, options })) }
    saveLastOrder(order)
    state.lastSent = order
    state.basket = []
    state.note = ''
    saveBasket(state.basket)
    state.phase = 'thanks'
    state.announce = 'Thank you. We will confirm your order and collection time on WhatsApp.'
    emit()
  },
}
window.addEventListener('storage', () => { state.basket = readBasket(); emit() })
window.addEventListener('pageshow', () => { state.basket = readBasket(); emit() })

// ---------- message ----------
/** The WhatsApp message as tagged lines: [{ text, kind, index }]. */
export function messageLines() {
  const lines = []
  const push = (text, kind = 'text', index) => lines.push({ text, kind, index })
  push('🍔 *ER-HAN BURGER — NEW ORDER*', 'head')
  const who = state.name.trim()
  if (who) push('👤 *Name:* ' + who, 'name')
  push(RULE, 'rule')
  push('')
  state.basket.forEach((line, index) => {
    push('*' + (index + 1) + '. ' + line.name + '*  x' + line.quantity + '  →  ' +
      formatPrice(line.quantity * line.unitPricePence), 'item', index)
    for (const option of line.options) push('   ' + option, 'option', index)
    push('', 'gap', index)
  })
  push(RULE, 'rule')
  push('*TOTAL:  ' + formatPrice(store.total()) + '*', 'total')
  push(RULE, 'rule')
  const shop = openingStatus()
  if (!shop.open && shop.opensAt) { push(''); push('🕚 *Collection:* when you open (' + shop.opensAt + ')', 'closed') }
  const note = state.note.trim()
  if (note) { push(''); push('📝 *Note:* ' + note, 'note') }
  push('')
  push('_' + orderContact.closingLine + '_', 'closing')
  return lines
}
export const messageText = () => messageLines().map(line => line.text).join('\n')
export const whatsappHref = () => 'https://wa.me/' + orderContact.whatsappNumber + '?text=' + encodeURIComponent(messageText())

// Renders WhatsApp's *bold* and _italic_ the way the app shows them.
function formatted(text) {
  const span = make('span', 'tl-text')
  const pattern = /(\*[^*]+\*|_[^_]+_)/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) span.append(text.slice(last, match.index))
    const inner = match[0].slice(1, -1)
    span.append(make(match[0][0] === '*' ? 'b' : 'i', '', inner))
    last = match.index + match[0].length
  }
  span.append(text.slice(last))
  return span
}

// ---------- ticket view ----------
let mountCount = 0
export function mountTicket(root, { variant = 'sheet', onClose } = {}) {
  const uid = 't' + (++mountCount)
  root.classList.add('ticket-view', 'ticket-view--' + variant)
  root.innerHTML = `
    <div class="tv-head">
      <h2 class="tv-title" id="${uid}-title">Your ticket</h2>
      ${onClose ? '<button type="button" class="btn-icon tv-close" aria-label="Close ticket"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' : ''}
    </div>
    <div class="tv-body">
      <p class="tv-shop" data-shop></p>
      <div class="tv-paper" data-paper>
        <p class="tv-caption"><span>Printed exactly as it will be sent</span></p>
        <div class="tv-lines" data-lines></div>
      </div>
      <div class="tv-empty" data-empty hidden></div>
      <div class="tv-form" data-form>
        <label class="field"><span class="field-label">Name for the order <em>optional</em></span>
          <input type="text" maxlength="40" autocomplete="given-name" data-name placeholder="So we know who it’s for"></label>
        <label class="field"><span class="field-label">Note for the kitchen <em>optional</em></span>
          <textarea rows="2" maxlength="300" data-note placeholder="For example, extra napkins or no salt on chips"></textarea></label>
        <p class="tv-hint">Collection only from Brent South Shopping Park. Pay when you collect. Allergies or dietary needs? Please call us before ordering.</p>
      </div>
      <div class="tv-check" data-check hidden>
        <p class="tv-check-title">Did WhatsApp open and did you press send?</p>
        <p>Your ticket stays here until you confirm, so nothing is lost if WhatsApp did not open.</p>
        <button type="button" class="btn btn--go" data-confirm>Yes, I’ve sent it</button>
        <button type="button" class="btn btn--ghost" data-not-sent>Not yet, keep my ticket</button>
      </div>
    </div>
    <div class="tv-foot" data-foot>
      <a class="btn btn--go btn--block" data-send target="_blank" rel="noopener" href="https://wa.me/">
        <svg class="wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4.5 4.5 0 0 1-2.2-2.2l.8-1-1-2Z" class="wa-fill"/></svg>
        <span>Send on WhatsApp</span><span class="btn-price" data-send-total></span></a>
      <a class="tv-call" href="${orderContact.phoneHref}">Or call to order: ${orderContact.phoneLabel}</a>
    </div>
    <p class="visually-hidden" role="status" data-status></p>`
  const $ = selector => root.querySelector(selector)
  const lines = $('[data-lines]')
  const nameField = $('[data-name]')
  const noteField = $('[data-note]')
  const send = $('[data-send]')
  nameField.value = state.name
  nameField.addEventListener('input', () => store.setName(nameField.value))
  noteField.addEventListener('input', () => store.setNote(noteField.value))
  const refresh = () => { send.href = whatsappHref() }
  send.addEventListener('pointerdown', refresh)
  send.addEventListener('focus', refresh)
  send.addEventListener('click', event => {
    if (!state.basket.length) { event.preventDefault(); return }
    refresh()
    setTimeout(() => { store.setPhase('sent-check'); root.querySelector('[data-confirm]')?.focus() })
  })
  $('[data-confirm]').addEventListener('click', () => store.confirmSent())
  $('[data-not-sent]').addEventListener('click', () => { store.setPhase('edit'); send.focus() })
  root.querySelector('.tv-close')?.addEventListener('click', onClose)

  function renderLines() {
    lines.replaceChildren()
    const all = messageLines()
    let block = null
    for (const line of all) {
      if (line.kind === 'item') {
        block = make('div', 'tl-item')
        block.dataset.index = line.index
        lines.append(block)
      }
      const row = make('div', 'tl tl--' + line.kind)
      row.append(line.text ? formatted(line.text) : ' ')
      if (line.kind === 'gap' && block) {
        block.append(controlsFor(line.index))
        block = null
        continue
      }
      ;(block ?? lines).append(row)
    }
  }

  function controlsFor(index) {
    const line = state.basket[index]
    const controls = make('div', 'tl-controls')
    controls.setAttribute('role', 'group')
    controls.setAttribute('aria-label', 'Quantity of ' + line.name)
    const minus = make('button', 'step', '−')
    minus.type = 'button'
    minus.setAttribute('aria-label', line.quantity > 1 ? 'One fewer ' + line.name : 'Remove ' + line.name)
    const qty = make('span', 'step-qty', String(line.quantity))
    qty.setAttribute('aria-hidden', 'true')
    const plus = make('button', 'step', '+')
    plus.type = 'button'
    plus.setAttribute('aria-label', 'One more ' + line.name)
    plus.disabled = line.quantity >= maxQuantity
    const remove = make('button', 'step-remove', 'Remove')
    remove.type = 'button'
    remove.setAttribute('aria-label', 'Remove ' + line.name)
    minus.addEventListener('click', () => { store.change(index, -1); focusAfter(index, 'minus') })
    plus.addEventListener('click', () => { store.change(index, 1); focusAfter(index, 'plus') })
    remove.addEventListener('click', () => { store.change(index, -line.quantity); focusAfter(index, 'remove') })
    controls.append(minus, qty, plus, remove)
    return controls
  }

  function focusAfter(index, which) {
    const blocks = lines.querySelectorAll('.tl-item')
    const block = blocks[Math.min(index, blocks.length - 1)]
    const buttons = block?.querySelectorAll('button')
    const target = !buttons ? null : which === 'plus' ? buttons[1] : which === 'minus' ? buttons[0] : buttons[2]
    ;(target && !target.disabled ? target : block?.querySelector('button') ?? nameField).focus()
  }

  function renderEmpty() {
    const empty = $('[data-empty]')
    empty.replaceChildren()
    if (state.phase === 'thanks' && state.lastSent) {
      empty.append(make('p', 'tv-stamp tv-stamp--go', 'Ticket sent'),
        make('p', 'tv-lead', 'Thank you. We’ll confirm your order and collection time on WhatsApp.'))
    } else {
      empty.append(make('p', 'tv-lead', 'No ticket yet.'),
        make('p', '', 'Add something from the menu and it prints here, line by line, ready to send.'))
    }
    const last = state.phase === 'thanks' ? state.lastSent : readLastOrder()
    if (last) {
      const box = make('div', 'tv-last')
      const sent = new Date(last.sentAt)
      const when = Number.isNaN(sent.getTime()) ? '' : ' · ' + sent.toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
      box.append(make('p', 'tv-last-title', (state.phase === 'thanks' ? 'Your order' : 'Your last order') + when))
      const list = make('ul', '')
      for (const line of last.lines) list.append(make('li', '', line.quantity + ' × ' + line.name + ' — ' + formatPrice(line.quantity * line.unitPricePence)))
      box.append(list, make('p', 'tv-last-total', 'Total ' + formatPrice(last.totalPence)),
        make('p', 'tv-small', 'Questions about this order? Call ' + orderContact.phoneLabel + '.'))
      empty.append(box)
    }
    const link = make('a', 'btn btn--ink', state.phase === 'thanks' ? 'Start a new order' : 'Open the menu')
    link.href = './menu.html'
    empty.append(link)
  }

  function render() {
    const has = state.basket.length > 0
    const checking = state.phase === 'sent-check' && has
    const shop = openingStatus()
    const shopLine = $('[data-shop]')
    shopLine.textContent = shop.open ? shop.text + ' · Collection only' :
      'We’re closed now. Send your order and we’ll confirm it for collection when we open at ' + shop.opensAt + '.'
    shopLine.classList.toggle('is-closed', !shop.open)
    $('[data-paper]').hidden = !has
    $('[data-form]').hidden = !has || checking
    $('[data-empty]').hidden = has
    $('[data-check]').hidden = !checking
    $('[data-foot]').hidden = !has || checking
    root.classList.toggle('is-empty', !has)
    if (has) renderLines(); else renderEmpty()
    $('[data-send-total]').textContent = formatPrice(store.total())
    send.href = whatsappHref()
    if (nameField !== document.activeElement && nameField.value !== state.name) nameField.value = state.name
    if (noteField !== document.activeElement && noteField.value !== state.note) noteField.value = state.note
    const status = $('[data-status]')
    if (state.announce && status.textContent !== state.announce) status.textContent = state.announce
  }
  store.subscribe(render)
  return { root, focus: () => (root.querySelector('[data-send]:not([hidden])') ?? root.querySelector('button, a')).focus() }
}

// ---------- shell: status pill, tab bar counts, ticket sheet ----------
export function initShell({ active } = {}) {
  const shop = openingStatus()
  for (const pill of document.querySelectorAll('[data-open-status]')) {
    pill.textContent = shop.open ? shop.text.replace('Open now until', 'Open · till') : 'Closed · opens ' + shop.opensAt
    pill.classList.toggle('is-closed', !shop.open)
  }
  for (const link of document.querySelectorAll(`[data-tab="${active}"]`)) link.setAttribute('aria-current', 'page')

  let dialog = document.querySelector('#ticket-sheet')
  if (!dialog) {
    dialog = document.createElement('dialog')
    dialog.id = 'ticket-sheet'
    dialog.className = 'sheet'
    dialog.setAttribute('aria-labelledby', 't1-title')
    document.body.append(dialog)
  }
  const panel = make('div', 'sheet-panel')
  dialog.append(panel)
  let opener = null
  const sheet = mountTicket(panel, { variant: 'sheet', onClose: () => close() })
  dialog.setAttribute('aria-labelledby', panel.querySelector('.tv-title').id)
  function open() {
    opener = document.activeElement
    if (state.phase === 'thanks') store.setPhase('edit')
    dialog.showModal()
    document.documentElement.classList.add('has-sheet')
    sheet.focus()
  }
  function close() {
    dialog.classList.add('is-closing')
    const done = () => {
      dialog.classList.remove('is-closing')
      dialog.close()
    }
    matchMedia('(prefers-reduced-motion: reduce)').matches ? done() : setTimeout(done, 200)
  }
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-sheet')
    opener?.focus?.()
  })
  dialog.addEventListener('cancel', event => { event.preventDefault(); close() })
  dialog.addEventListener('click', event => { if (event.target === dialog) close() })
  for (const button of document.querySelectorAll('[data-open-ticket]')) {
    button.addEventListener('click', event => { event.preventDefault(); open() })
  }
  store.subscribe(() => {
    const count = store.count()
    for (const node of document.querySelectorAll('[data-ticket-count]')) {
      node.textContent = String(count)
      node.hidden = count === 0
    }
    for (const node of document.querySelectorAll('[data-ticket-total]')) node.textContent = count ? formatPrice(store.total()) : 'Empty'
    for (const node of document.querySelectorAll('[data-open-ticket]')) {
      node.setAttribute('aria-label', 'Basket, ' + (count ? count + (count === 1 ? ' item, ' : ' items, ') + formatPrice(store.total()) : 'empty'))
    }
  })
  if (new URLSearchParams(location.search).has('basket')) open()
  return { open, close }
}

export function bump(node) {
  if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  node.classList.remove('is-bumped')
  void node.offsetWidth
  node.classList.add('is-bumped')
}
