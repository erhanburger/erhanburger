// Shared page chrome: basket dialog (the real message builder from
// basket-ui.js), basket count and total, opening status and the toast.
import { formatPrice } from '../../catalog.js'
import { createBasketUI } from '../../basket-ui.js'
import { readBasket } from '../../basket-storage.js'
import { openingStatus } from '../../order-config.js'

export function make(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

export function setupChrome({ keepBrowsingHref, onKeepBrowsing } = {}) {
  const dialog = document.querySelector('#basket-dialog')
  const count = document.querySelector('#basket-count')
  const basket = createBasketUI({ dialog, countNode: count, keepBrowsingHref, onKeepBrowsing })

  const totals = document.querySelectorAll('[data-basket-total]')
  const counts = document.querySelectorAll('[data-basket-count]')
  const refresh = () => {
    const lines = readBasket()
    const n = lines.reduce((sum, line) => sum + line.quantity, 0)
    const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPricePence, 0)
    for (const node of totals) node.textContent = n ? formatPrice(total) : 'Empty'
    for (const node of counts) node.textContent = String(n)
    document.documentElement.toggleAttribute('data-has-basket', n > 0)
  }
  new MutationObserver(refresh).observe(count, { childList: true, characterData: true, subtree: true })
  refresh()

  for (const button of document.querySelectorAll('[data-open-basket]')) {
    button.addEventListener('click', () => basket.open())
  }
  // Clicking the dimmed backdrop closes the sheet.
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })

  const status = openingStatus()
  for (const node of document.querySelectorAll('[data-open-status]')) {
    node.textContent = status.text
    node.closest('.status')?.setAttribute('data-open', String(status.open))
  }
  if (new URLSearchParams(location.search).has('basket')) basket.open()
  return { basket, refresh, status }
}

let toastTimer
export function toast(message, action) {
  let node = document.querySelector('.toast')
  if (!node) {
    node = make('div', 'toast')
    node.setAttribute('aria-hidden', 'true')
    document.body.append(node)
  }
  node.replaceChildren(make('span', '', message))
  if (action) {
    const button = make('button', 'toast-action', action.label)
    button.type = 'button'
    button.addEventListener('click', action.onClick)
    node.append(button)
    node.removeAttribute('aria-hidden')
  }
  node.classList.add('is-shown')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => node.classList.remove('is-shown'), 3200)
}
