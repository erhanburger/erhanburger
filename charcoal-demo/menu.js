import { catalog, formatPrice } from './catalog.js';
import { createBasketUI } from './basket-ui.js';
import { orderContact } from './order-config.js';

const categories = document.querySelector('.menu-categories');
const products = document.querySelector('#menu-products');
const basketCount = document.querySelector('#basket-count');

function make(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
}


const basketUI = createBasketUI({
  dialog: document.querySelector('#basket-dialog'),
  countNode: basketCount,
  onKeepBrowsing: () => document.querySelector('#open-basket').focus(),
});

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
    link.href = './product.html?product=' + encodeURIComponent(product.id);
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
    // Items with nothing to choose are added straight from the menu.
    if (!product.optionGroups.length) {
      item.classList.add('menu-item--quick');
      const add = make('button', 'menu-quick-add', 'Add');
      add.type = 'button';
      add.setAttribute('aria-label', 'Add ' + product.name + ' to basket, ' + formatPrice(product.basePricePence));
      add.addEventListener('click', () => {
        basketUI.addQuietly({ productId: product.id, name: product.name,
          unitPricePence: product.basePricePence, optionIds: [], options: [] });
        add.textContent = 'Added';
        add.classList.add('is-added');
        setTimeout(() => { add.textContent = 'Add'; add.classList.remove('is-added'); }, 1400);
      });
      item.append(add);
    }
    grid.append(item);
  }
  section.append(heading, grid);
  products.append(section);
}

document.querySelector('#open-basket').addEventListener('click', () => basketUI.open());
const menuCall = document.querySelector('#menu-call');
menuCall.href = orderContact.phoneHref;
menuCall.textContent = orderContact.phoneLabel;
if (new URLSearchParams(location.search).has('basket')) basketUI.open();
