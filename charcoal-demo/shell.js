// The page shell shared by home, menu and builder: opening-status pills and the
// current page in the app bar and the phone bottom bar. Basket counts and totals
// are kept up to date by basket-ui.js.
import { openingStatus } from './order-config.js'

export function initShell({ active } = {}) {
  const shop = openingStatus()
  for (const pill of document.querySelectorAll('[data-open-status]')) {
    // Narrow screens show "Opens 11am"; wide ones "Closed · opens 11am tomorrow".
    const [time, ...day] = (shop.opensAt ?? 'soon').split(' ')
    if (shop.open) pill.replaceChildren(shop.text.replace('Open now until', 'Open till'))
    else {
      const wide = text => Object.assign(document.createElement('span'), { className: 'status-long', textContent: text })
      pill.replaceChildren(wide('Closed · '), 'Opens ' + time, wide(day.length ? ' ' + day.join(' ') : ''))
    }
    pill.classList.toggle('is-closed', !shop.open)
  }
  for (const link of document.querySelectorAll('[data-nav="' + active + '"]')) link.setAttribute('aria-current', 'page')
  return shop
}

export function make(tag, className, label) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (label) node.textContent = label
  return node
}

export const productHref = id => './product.html?product=' + encodeURIComponent(id)
