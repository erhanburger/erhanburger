import { catalog, formatPrice } from './catalog.js';
import { readBasket } from './basket-storage.js';

const categories = document.querySelector('.menu-categories');
const products = document.querySelector('#menu-products');
const basketCount = document.querySelector('#basket-count');

function make(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
}

function showBasketCount() {
  basketCount.textContent = readBasket().reduce((sum, line) => sum + line.quantity, 0);
}

for (const { id, name } of catalog.categories) {
  const items = catalog.products.filter(product => product.categoryId === id);
  if (!items.length) continue;
  const shortcut = make('a', '', name);
  shortcut.href = '#' + id;
  categories.append(shortcut);

  const section = make('section', 'menu-group');
  section.id = id;
  const heading = make('h2', '', name);
  heading.id = id + '-heading';
  section.setAttribute('aria-labelledby', heading.id);
  const grid = make('ul', 'menu-grid');
  for (const product of items) {
    const item = make('li');
    const link = make('a', 'menu-card');
    link.href = './?product=' + encodeURIComponent(product.id);
    const image = make('img', 'menu-card-photo');
    image.src = product.image;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    const details = make('div', 'menu-card-details');
    details.append(make('span', 'menu-card-name', product.name),
      make('span', 'menu-card-price', formatPrice(product.basePricePence)));
    link.append(image, details);
    item.append(link);
    grid.append(item);
  }
  section.append(heading, grid);
  products.append(section);
}

window.addEventListener('pageshow', showBasketCount);
window.addEventListener('storage', showBasketCount);
showBasketCount();
