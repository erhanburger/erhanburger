// Shared basket dialog for the menu and product pages: quantities, notes and
// the WhatsApp collection order. The basket is only cleared once the customer
// confirms that they sent the WhatsApp message.
import { formatPrice } from './catalog.js'
import { readBasket, saveBasket, maxQuantity } from './basket-storage.js'
import { orderContact } from './order-config.js'

function make(tag, className, label) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (label) node.textContent = label
  return node
}

export const basketDialogMarkup = `
  <div class="basket-dialog-heading">
    <h2 id="basket-heading">Your basket</h2>
    <button type="button" class="basket-button" id="close-basket">Close</button>
  </div>
  <div id="basket-items"></div>
  <div class="basket-review" id="basket-review">
    <div class="basket-subtotal">
      <span>Subtotal</span>
      <strong id="basket-subtotal">£0.00</strong>
    </div>
    <div class="basket-checkout" id="basket-checkout" hidden>
      <label for="order-note">Order notes <span>(optional)</span></label>
      <textarea id="order-note" rows="2" maxlength="300" placeholder="For example, extra napkins or no salt on chips"></textarea>
      <p class="checkout-hint">Collection only. Your order opens in WhatsApp for you to send, and we confirm it there. Allergies or dietary needs? Please call us before ordering.</p>
      <button type="button" class="order-button" id="order-whatsapp">Order via WhatsApp</button>
      <a class="call-link" id="call-link"></a>
    </div>
  </div>
  <div class="basket-sent-check" id="basket-sent-check" hidden>
    <p><strong>Did you send your order on WhatsApp?</strong></p>
    <p>Your basket is kept until you confirm, so nothing is lost if WhatsApp did not open.</p>
    <button type="button" class="order-button" id="confirm-sent">Yes, I’ve sent it</button>
    <button type="button" class="basket-secondary" id="not-sent">Not yet, keep my basket</button>
  </div>
  <a class="basket-secondary keep-browsing" id="keep-browsing" href="./menu.html">Keep browsing</a>
  <p id="basket-status" class="visually-hidden" role="status"></p>`

export function createBasketUI({ dialog, countNode, keepBrowsingHref, onKeepBrowsing }) {
  dialog.innerHTML = basketDialogMarkup
  const $ = selector => dialog.querySelector(selector)
  const items = $('#basket-items')
  const subtotal = $('#basket-subtotal')
  const review = $('#basket-review')
  const checkout = $('#basket-checkout')
  const sentCheck = $('#basket-sent-check')
  const note = $('#order-note')
  const status = $('#basket-status')
  const keepBrowsing = $('#keep-browsing')
  const callLink = $('#call-link')
  let basket = readBasket()

  callLink.href = orderContact.phoneHref
  callLink.textContent = 'Or call to order: ' + orderContact.phoneLabel
  keepBrowsing.href = keepBrowsingHref ?? './menu.html'
  if (onKeepBrowsing) {
    keepBrowsing.addEventListener('click', event => {
      event.preventDefault()
      dialog.close()
      onKeepBrowsing()
    })
  }

  const total = () => basket.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)

  function showSentCheck(visible) {
    sentCheck.hidden = !visible
    review.hidden = visible
    items.hidden = visible
  }

  function render() {
    countNode.textContent = String(basket.reduce((sum, line) => sum + line.quantity, 0))
    subtotal.textContent = formatPrice(total())
    checkout.hidden = !basket.length
    items.replaceChildren()
    if (!basket.length) {
      items.append(make('p', 'basket-empty', 'Your basket is empty.'))
      return
    }
    const list = make('ul', '')
    for (const [index, line] of basket.entries()) {
      const item = make('li', 'basket-item')
      const details = make('div', 'basket-item-details')
      details.append(make('strong', '', line.name))
      if (line.options.length) details.append(make('p', '', line.options.join(', ')))
      details.append(make('p', '', formatPrice(line.unitPricePence) + ' each'))
      const amount = make('div', 'basket-item-amount')
      const controls = make('div', 'basket-item-controls')
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
      amount.append(make('strong', '', formatPrice(line.quantity * line.unitPricePence)), controls)
      item.append(details, amount)
      list.append(item)
    }
    items.append(list)
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
    const rows = items.querySelectorAll('.basket-item')
    const row = rows[Math.min(index, rows.length - 1)]
    const next = removed ? row?.querySelector('[data-basket-action="remove"]') :
      row?.querySelector('[data-basket-action="' + action + '"]:not(:disabled)') ??
      row?.querySelector('[data-basket-action="remove"]')
    ;(next ?? $('#close-basket')).focus()
  }

  function buildOrderMessage(text) {
    const rule = '━'.repeat(20)
    let message = '🍔 *ER-HAN BURGER — NEW ORDER*\n' + rule + '\n\n'
    for (const [index, line] of basket.entries()) {
      message += '*' + (index + 1) + '. ' + line.name + '*  x' + line.quantity + '  →  ' +
        formatPrice(line.quantity * line.unitPricePence) + '\n'
      for (const option of line.options) message += '   ' + option + '\n'
      message += '\n'
    }
    message += rule + '\n*TOTAL:  ' + formatPrice(total()) + '*\n' + rule
    if (text) message += '\n\n📝 *Note:* ' + text
    return message + '\n\n_' + orderContact.closingLine + '_'
  }

  function orderViaWhatsApp() {
    if (!basket.length) return
    const url = 'https://wa.me/' + orderContact.whatsappNumber + '?text=' +
      encodeURIComponent(buildOrderMessage(note.value.trim()))
    const opened = window.open(url, '_blank')
    if (opened) opened.opener = null
    showSentCheck(true)
    status.textContent = 'WhatsApp has opened with your order. Send the message, then confirm here.'
    $('#confirm-sent').focus()
    if (!opened) location.href = url
  }

  $('#order-whatsapp').addEventListener('click', orderViaWhatsApp)
  $('#confirm-sent').addEventListener('click', () => {
    basket = []
    saveBasket(basket)
    note.value = ''
    showSentCheck(false)
    render()
    const message = 'Thank you. We will confirm your order and collection time on WhatsApp.'
    status.textContent = message
    items.replaceChildren(make('p', 'basket-confirmation', message))
    keepBrowsing.textContent = 'Start a new order'
    keepBrowsing.focus()
  })
  $('#not-sent').addEventListener('click', () => {
    showSentCheck(false)
    status.textContent = 'Your basket is still here.'
    $('#order-whatsapp').focus()
  })
  $('#close-basket').addEventListener('click', () => dialog.close())

  function open() {
    basket = readBasket()
    status.textContent = ''
    keepBrowsing.textContent = 'Keep browsing'
    showSentCheck(false)
    render()
    dialog.showModal()
  }

  function add(line) {
    basket = readBasket()
    const existing = basket.find(item => item.productId === line.productId &&
      item.unitPricePence === line.unitPricePence &&
      JSON.stringify(item.optionIds) === JSON.stringify(line.optionIds))
    if (existing) existing.quantity = Math.min(maxQuantity, existing.quantity + 1)
    else basket.push({ ...line, quantity: 1 })
    saveBasket(basket)
    open()
    status.textContent = line.name + ' added to your basket.'
  }

  window.addEventListener('pageshow', () => {
    basket = readBasket()
    render()
  })
  window.addEventListener('storage', () => {
    basket = readBasket()
    render()
  })
  render()
  return { open, add }
}
