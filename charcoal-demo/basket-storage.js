const key = 'erhan_product_builder_basket_v1';

export function readBasket() {
  try {
    const records = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(records)) return [];
    return records.filter(line => line && typeof line.productId === 'string' &&
      typeof line.name === 'string' && Number.isSafeInteger(line.unitPricePence) &&
      line.unitPricePence >= 0 && Number.isSafeInteger(line.quantity) &&
      line.quantity > 0 && Array.isArray(line.optionIds) && Array.isArray(line.options) &&
      line.options.every(option => typeof option === 'string'));
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
