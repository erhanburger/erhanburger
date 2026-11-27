import { catalog, formatPrice, halfPounder } from './catalog.js';
import { readBasket } from './basket-storage.js';

document.querySelector('#featured-price').textContent = formatPrice(halfPounder.basePricePence);
const links = document.querySelector('#home-category-links');
for (const category of catalog.categories) {
  if (!catalog.products.some(product => product.categoryId === category.id)) continue;
  const link = document.createElement('a');
  link.href = './menu.html#' + encodeURIComponent(category.id);
  link.textContent = category.name;
  links.append(link);
}
window.addEventListener('pageshow', () => {
  document.querySelector('#basket-count').textContent = readBasket().reduce((total, line) => total + line.quantity, 0);
});
