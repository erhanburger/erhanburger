// Shared basket for every page: quantities, name, note, the WhatsApp collection
// order, the sent-check and the last order. The basket is shown as the kitchen
// ticket: its lines are the exact WhatsApp message, so what the customer reads
// is what is sent. The basket is only cleared once the customer confirms that
// they sent the message.
import { formatPrice } from './catalog.js'
import { readBasket, saveBasket, maxQuantity, readLastOrder, saveLastOrder } from './basket-storage.js'
import { orderContact, openingStatus } from './order-config.js'

function make(tag, className, label) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (label) node.textContent = label
  return node
}

const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
const whatsappIcon = '<svg class="wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path class="wa-fill" d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4.5 4.5 0 0 1-2.2-2.2l.8-1-1-2Z"/></svg>'

export const basketDialogMarkup = `
  <div class="basket-sheet">
    <div class="basket-dialog-heading">
      <div>
        <p class="label">Kitchen ticket</p>
        <h2 id="basket-heading" class="basket-title">Your basket</h2>
      </div>
      <button type="button" class="icon-button" id="close-basket" aria-label="Close basket">${closeIcon}</button>
    </div>
    <p class="basket-shop" id="checkout-closed"></p>
    <div id="basket-items"></div>
    <div class="basket-review" id="basket-review">
      <div class="basket-checkout" id="basket-checkout" hidden>
        <div class="field">
          <label for="order-name">Name for the order <span>optional</span></label>
          <input id="order-name" type="text" maxlength="40" autocomplete="given-name" placeholder="So we know who it’s for">
        </div>
        <div class="field">
          <label for="order-note">Note for the kitchen <span>optional</span></label>
          <textarea id="order-note" rows="2" maxlength="300" placeholder="For example, extra napkins or no salt on chips"></textarea>
        </div>
        <p class="checkout-hint">Collection only from Brent South Shopping Park. Your order opens in WhatsApp for you to send, and we confirm it there. Allergies or dietary needs? Please call us before ordering.</p>
      </div>
      <div class="basket-pay">
        <div class="basket-subtotal">
          <span>Total</span>
          <strong id="basket-subtotal">£0.00</strong>
        </div>
        <a class="button button--go button--block" id="order-whatsapp" href="https://wa.me/" target="_blank" rel="noopener" hidden>${whatsappIcon}<span>Send order on WhatsApp</span></a>
        <a class="call-link" id="call-link"></a>
      </div>
    </div>
    <div class="basket-sent-check" id="basket-sent-check" hidden>
      <p class="sent-title">Did you send your order on WhatsApp?</p>
      <p>Your basket is kept until you confirm, so nothing is lost if WhatsApp did not open.</p>
      <button type="button" class="button button--go button--block" id="confirm-sent">Yes, I’ve sent it</button>
      <button type="button" class="button button--ghost button--block" id="not-sent">Not yet, keep my basket</button>
    </div>
    <a class="button button--ghost button--block keep-browsing" id="keep-browsing" href="./menu.html">Keep browsing</a>
    <p id="basket-status" class="visually-hidden" role="status"></p>
  </div>`

const rule = '━'.repeat(20)

// The order message as tagged lines. Joined with line breaks, these are the
// exact text sent on WhatsApp; the ticket view prints the same lines.
function messageLines(basket, { note = '', name = '' } = {}) {
  const lines = []
  const push = (text, kind = 'text', index) => lines.push({ text, kind, index })
  const total = basket.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)
  push('🍔 *ER-HAN BURGER — NEW ORDER*', 'head')
  if (name) push('👤 *Name:* ' + name, 'name')
  push(rule, 'rule')
  push('', 'gap')
  for (const [index, line] of basket.entries()) {
    push('*' + (index + 1) + '. ' + line.name + '*  x' + line.quantity + '  →  ' +
      formatPrice(line.quantity * line.unitPricePence), 'item', index)
    for (const option of line.options) push('   ' + option, 'option', index)
    push('', 'end', index)
  }
  push(rule, 'rule')
  push('*TOTAL:  ' + formatPrice(total) + '*', 'total')
  push(rule, 'rule')
  const shop = openingStatus()
  if (!shop.open && shop.opensAt) {
    push('', 'gap')
    push('🕚 *Collection:* when you open (' + shop.opensAt + ')', 'closed')
  }
  if (note) {
    push('', 'gap')
    push('📝 *Note:* ' + note, 'note')
  }
  push('', 'gap')
  push('_' + orderContact.closingLine + '_', 'closing')
  return lines
}

// Shows WhatsApp's *bold* and _italic_ the way the app displays them.
function formatted(text) {
  const span = make('span', 'tl-text')
  let last = 0
  for (const match of text.matchAll(/(\*[^*]+\*|_[^_]+_)/g)) {
    if (match.index > last) span.append(text.slice(last, match.index))
    span.append(make(match[0][0] === '*' ? 'b' : 'i', '', match[0].slice(1, -1)))
    last = match.index + match[0].length
  }
  span.append(text.slice(last))
  return span
}

// Prints message lines on a ticket. controls(index) may add quantity controls
// under each item.
function printTicket(lines, controls) {
  const paper = make('div', 'ticket-paper')
  const caption = make('p', 'ticket-caption')
  caption.append(make('span', '', 'Printed exactly as it will be sent'))
  paper.append(caption)
  const body = make('div', 'ticket-lines')
  body.setAttribute('aria-label', 'Your order message')
  let block = null
  for (const line of lines) {
    if (line.kind === 'item') {
      block = make('div', 'ticket-item')
      body.append(block)
    }
    if (line.kind === 'end') {
      if (block && controls) block.append(controls(line.index))
      block = null
      continue
    }
    const row = make('p', 'tl tl--' + line.kind)
    if (line.text) row.append(formatted(line.text))
    else row.setAttribute('aria-hidden', 'true')
    ;(block ?? body).append(row)
  }
  paper.append(body)
  return paper
}

export function createBasketUI({ dialog, countNode, keepBrowsingHref, onKeepBrowsing, rail }) {
  dialog.innerHTML = basketDialogMarkup
  const $ = selector => dialog.querySelector(selector)
  const items = $('#basket-items')
  const subtotal = $('#basket-subtotal')
  const review = $('#basket-review')
  const checkout = $('#basket-checkout')
  const sentCheck = $('#basket-sent-check')
  const note = $('#order-note')
  const nameField = $('#order-name')
  const send = $('#order-whatsapp')
  try { nameField.value = localStorage.getItem('erhan_order_name') ?? '' } catch {}
  const status = $('#basket-status')
  const keepBrowsing = $('#keep-browsing')
  const callLink = $('#call-link')
  let basket = readBasket()
  let confirmation = null
  const quietStatus = document.createElement('p')
  quietStatus.className = 'visually-hidden'
  quietStatus.setAttribute('role', 'status')
  dialog.after(quietStatus)

  callLink.href = orderContact.phoneHref
  callLink.textContent = 'Or call to order: ' + orderContact.phoneLabel
  keepBrowsing.href = keepBrowsingHref ?? './menu.html'
  keepBrowsing.addEventListener('click', event => {
    // On the menu, keep browsing simply closes the basket.
    if (!onKeepBrowsing || confirmation) return
    event.preventDefault()
    close()
    onKeepBrowsing()
  })

  const count = () => basket.reduce((sum, line) => sum + line.quantity, 0)
  const total = () => basket.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)
  const lines = () => messageLines(basket, { note: note.value.trim(), name: nameField.value.trim() })

  function showSentCheck(visible) {
    sentCheck.hidden = !visible
    review.hidden = visible
    items.hidden = visible
    keepBrowsing.hidden = visible
  }

  // Every page shows the live count and total (app bar, phone bottom bar).
  function renderSummary() {
    const items = count()
    const summary = items ? items + (items === 1 ? ' item, ' : ' items, ') + formatPrice(total()) : 'empty'
    for (const node of document.querySelectorAll('[data-basket-count]')) {
      node.textContent = String(items)
      node.hidden = items === 0
    }
    if (countNode && !countNode.matches('[data-basket-count]')) countNode.textContent = String(items)
    for (const node of document.querySelectorAll('[data-basket-total]')) node.textContent = items ? formatPrice(total()) : 'Empty'
    for (const node of document.querySelectorAll('[data-open-basket]')) node.setAttribute('aria-label', 'Basket, ' + summary)
  }

  function quantityControls(index) {
    const line = basket[index]
    const controls = make('div', 'ticket-controls')
    const stepper = make('div', 'quantity-stepper')
    stepper.setAttribute('role', 'group')
    stepper.setAttribute('aria-label', 'Quantity of ' + line.name)
    const decrease = make('button', 'quantity-button', '−')
    decrease.type = 'button'
    decrease.dataset.basketAction = 'decrease'
    decrease.setAttribute('aria-label', line.quantity > 1 ? 'Decrease quantity of ' + line.name : 'Remove ' + line.name + ' from basket')
    const quantity = make('span', 'quantity-value', String(line.quantity))
    quantity.setAttribute('aria-label', line.quantity + ' in basket')
    const increase = make('button', 'quantity-button', '+')
    increase.type = 'button'
    increase.dataset.basketAction = 'increase'
    increase.setAttribute('aria-label', 'Increase quantity of ' + line.name)
    increase.disabled = line.quantity >= maxQuantity
    decrease.addEventListener('click', () => changeQuantity(index, -1, 'decrease'))
    increase.addEventListener('click', () => changeQuantity(index, 1, 'increase'))
    stepper.append(decrease, quantity, increase)
    const remove = make('button', 'basket-remove', 'Remove')
    remove.type = 'button'
    remove.dataset.basketAction = 'remove'
    remove.setAttribute('aria-label', 'Remove ' + line.name + ' from basket')
    remove.addEventListener('click', () => changeQuantity(index, -line.quantity, 'remove'))
    controls.append(stepper, remove)
    return controls
  }

  function emptyState() {
    const box = make('div', 'basket-empty')
    box.append(make('p', 'basket-empty-title', 'Nothing on your ticket yet.'),
      make('p', '', 'Add something from the menu and it prints here, line by line, ready to send.'))
    return box
  }

  function render() {
    renderSummary()
    subtotal.textContent = formatPrice(total())
    checkout.hidden = !basket.length
    send.hidden = !basket.length
    $('.basket-subtotal').hidden = !basket.length
    dialog.classList.toggle('is-empty', !basket.length)
    refreshOrderLink()
    renderRail()
    items.replaceChildren()
    if (confirmation) {
      items.append(confirmation)
      return
    }
    if (!basket.length) {
      items.append(emptyState())
      const last = readLastOrder()
      if (last) items.append(orderSummary(last, 'Your last order'))
      return
    }
    items.append(printTicket(lines(), quantityControls))
  }

  // The desktop menu's live ticket column: the same printed lines, read-only.
  function renderRail() {
    if (!rail) return
    rail.replaceChildren()
    const head = make('div', 'rail-head')
    head.append(make('p', 'label', 'Live ticket'), make('h2', 'rail-title', 'Your basket'))
    rail.append(head)
    if (!basket.length) {
      rail.append(emptyState())
      return
    }
    rail.append(printTicket(lines()))
    const open = make('button', 'button button--block')
    open.type = 'button'
    open.append(make('span', '', 'Check and send'), make('span', 'button-price', formatPrice(total())))
    open.addEventListener('click', () => api.open())
    rail.append(open)
  }

  function orderSummary(order, title) {
    const box = make('section', 'last-order')
    const sent = new Date(order.sentAt)
    const time = Number.isNaN(sent.getTime()) ? '' : ', sent ' +
      sent.toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    box.append(make('h3', '', title + time))
    const list = make('ul', '')
    for (const line of order.lines) {
      list.append(make('li', '', line.quantity + ' × ' + line.name +
        (line.options.length ? ' (' + line.options.join(', ') + ')' : '') + ' — ' +
        formatPrice(line.quantity * line.unitPricePence)))
    }
    box.append(list, make('p', 'last-order-total', 'Total ' + formatPrice(order.totalPence)))
    box.append(make('p', 'last-order-help', 'Questions about this order? Call ' + orderContact.phoneLabel + '.'))
    return box
  }

  function changeQuantity(index, delta, action) {
    const line = basket[index]
    if (!line) return
    line.quantity = Math.min(maxQuantity, line.quantity + delta)
    const removed = line.quantity <= 0
    if (removed) basket.splice(index, 1)
    saveBasket(basket)
    render()
    status.textContent = removed ? line.name + ' removed from your basket.' :
      line.name + ' quantity is now ' + line.quantity + '.'
    const rows = items.querySelectorAll('.ticket-item')
    const row = rows[Math.min(index, rows.length - 1)]
    const next = removed ? row?.querySelector('[data-basket-action="remove"]') :
      row?.querySelector('[data-basket-action="' + action + '"]:not(:disabled)') ??
      row?.querySelector('[data-basket-action="remove"]')
    ;(next ?? $('#close-basket')).focus()
  }

  function buildOrderMessage() {
    return lines().map(line => line.text).join('\n')
  }

  // A plain link opens WhatsApp in every browser, including sandboxed previews
  // where scripted pop-ups are blocked. Its address is refreshed just before use.
  function refreshOrderLink() {
    send.href = 'https://wa.me/' + orderContact.whatsappNumber + '?text=' + encodeURIComponent(buildOrderMessage())
  }

  function orderViaWhatsApp(event) {
    if (!basket.length) {
      event.preventDefault()
      return
    }
    refreshOrderLink()
    // Show the confirmation after the browser has followed the link.
    setTimeout(() => {
      showSentCheck(true)
      status.textContent = 'WhatsApp has opened with your order. Send the message, then confirm here.'
      $('#confirm-sent').focus()
    })
  }

  // Typing a name or note reprints the ticket without moving focus.
  function reprint() {
    refreshOrderLink()
    renderRail()
    if (!basket.length || confirmation) return
    items.replaceChildren(printTicket(lines(), quantityControls))
  }

  send.addEventListener('click', orderViaWhatsApp)
  send.addEventListener('pointerdown', refreshOrderLink)
  send.addEventListener('focus', refreshOrderLink)
  note.addEventListener('input', reprint)
  nameField.addEventListener('input', () => {
    try { localStorage.setItem('erhan_order_name', nameField.value.trim()) } catch {}
    reprint()
  })
  $('#confirm-sent').addEventListener('click', () => {
    const order = { sentAt: new Date().toISOString(), totalPence: total(),
      lines: basket.map(({ name, quantity, unitPricePence, options }) => ({ name, quantity, unitPricePence, options })) }
    saveLastOrder(order)
    basket = []
    saveBasket(basket)
    note.value = ''
    showSentCheck(false)
    const message = 'Thank you. We will confirm your order and collection time on WhatsApp.'
    confirmation = make('div', 'basket-confirmation')
    confirmation.append(make('p', 'sent-stamp', 'Ticket sent'), make('p', 'basket-confirmation-text', message),
      orderSummary(order, 'Your order'))
    render()
    status.textContent = message
    keepBrowsing.textContent = 'Start a new order'
    keepBrowsing.href = './menu.html'
    keepBrowsing.focus()
  })
  $('#not-sent').addEventListener('click', () => {
    showSentCheck(false)
    status.textContent = 'Your basket is still here.'
    send.focus()
  })

  // The sheet slides away before it closes, unless motion is reduced.
  let closing = 0
  function close() {
    if (!dialog.open) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.close()
      return
    }
    dialog.classList.add('is-closing')
    clearTimeout(closing)
    closing = setTimeout(() => {
      dialog.classList.remove('is-closing')
      dialog.close()
    }, 180)
  }
  $('#close-basket').addEventListener('click', close)
  dialog.addEventListener('cancel', event => {
    event.preventDefault()
    close()
  })
  // A tap on the dimmed page outside the sheet closes it.
  dialog.addEventListener('click', event => {
    if (event.target === dialog) close()
  })
  dialog.addEventListener('close', () => document.documentElement.classList.remove('has-sheet'))

  function showOpeningNotice() {
    const shop = openingStatus()
    const notice = $('#checkout-closed')
    notice.classList.toggle('is-closed', !shop.open)
    notice.textContent = shop.open ? shop.text + ' · Collection only' :
      'We’re closed now. Send your order and we’ll confirm it for collection when we open at ' + shop.opensAt + '.'
  }

  function open() {
    showOpeningNotice()
    basket = readBasket()
    confirmation = null
    status.textContent = ''
    keepBrowsing.textContent = 'Keep browsing'
    keepBrowsing.href = keepBrowsingHref ?? './menu.html'
    showSentCheck(false)
    render()
    clearTimeout(closing)
    dialog.classList.remove('is-closing')
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('has-sheet')
    ;(basket.length ? send : $('#close-basket')).focus({ preventScroll: true })
    dialog.scrollTop = 0
  }

  function merge(line) {
    basket = readBasket()
    confirmation = null
    const existing = basket.find(item => item.productId === line.productId &&
      item.unitPricePence === line.unitPricePence &&
      JSON.stringify(item.optionIds) === JSON.stringify(line.optionIds))
    if (existing) existing.quantity = Math.min(maxQuantity, existing.quantity + 1)
    else basket.push({ ...line, quantity: 1 })
    saveBasket(basket)
    return existing?.quantity ?? 1
  }

  function add(line) {
    merge(line)
    open()
    status.textContent = line.name + ' added to your basket.'
  }

  // Adds without opening the basket (quick add and the builder) and announces it.
  // Returns how many of exactly this line are now in the basket.
  function addQuietly(line) {
    const quantity = merge(line)
    render()
    status.textContent = ''
    quietStatus.textContent = line.name + ' added. ' + count() + (count() === 1 ? ' item' : ' items') +
      ' in your basket, ' + formatPrice(total()) + '.'
    return quantity
  }

  window.addEventListener('pageshow', () => {
    basket = readBasket()
    render()
  })
  window.addEventListener('storage', () => {
    basket = readBasket()
    render()
  })
  for (const button of document.querySelectorAll('[data-open-basket]')) {
    button.addEventListener('click', event => {
      event.preventDefault()
      open()
    })
  }
  showOpeningNotice()
  render()
  const api = { open, close, add, addQuietly, count, total }
  return api
}
