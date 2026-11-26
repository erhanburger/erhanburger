const key = 'erhan_product_builder_basket_v1';
export const maxQuantity = 20;

export function readBasket() {
  try {
    const records = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(records)) return [];
    return records.filter(line => line && typeof line.productId === 'string' &&
      typeof line.name === 'string' && Number.isSafeInteger(line.unitPricePence) &&
      line.unitPricePence >= 0 && Number.isSafeInteger(line.quantity) &&
      line.quantity > 0 && Array.isArray(line.optionIds) && Array.isArray(line.options) &&
      line.options.every(option => typeof option === 'string'))
      .map(line => ({ ...line, quantity: Math.min(maxQuantity, line.quantity) }));
  } catch {
    return [];
  }
}

export function saveBasket(basket) {
  try {
    localStorage.setItem(key, JSON.stringify(basket));
  } catch {
    // The in-memory basket still works when storage is unavailable.
  }
}

const lastOrderKey = 'erhan_product_builder_last_order_v1';

export function readLastOrder() {
  try {
    const order = JSON.parse(localStorage.getItem(lastOrderKey));
    if (!order || !Array.isArray(order.lines) || !Number.isSafeInteger(order.totalPence)) return null;
    const lines = order.lines.filter(line => line && typeof line.name === 'string' &&
      Number.isSafeInteger(line.quantity) && line.quantity > 0 &&
      Number.isSafeInteger(line.unitPricePence) && Array.isArray(line.options) &&
      line.options.every(option => typeof option === 'string'));
    return lines.length ? { sentAt: String(order.sentAt), totalPence: order.totalPence, lines } : null;
  } catch {
    return null;
  }
}

export function saveLastOrder(order) {
  try {
    localStorage.setItem(lastOrderKey, JSON.stringify(order));
  } catch {
    // The confirmation is still shown when storage is unavailable.
  }
}
