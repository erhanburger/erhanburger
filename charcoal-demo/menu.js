import { catalog, formatPrice } from './catalog.js';
import { createBasketUI } from './basket-ui.js';
import { orderContact, openingStatus } from './order-config.js';

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
    if (product.popular) details.append(make('span', 'menu-card-tag', 'Popular'));
    details.append(make('span', 'menu-card-name', product.name),
      make('span', 'menu-card-price', formatPrice(product.basePricePence)));
    link.append(image, details);
    item.append(link);
    item.dataset.search = [product.name, name, ...(product.optionGroups ?? []).flatMap(group =>
      group.options.map(option => option.name))].join(' ').toLowerCase();
    // Items with nothing to choose are added straight from the menu.
    if (!product.optionGroups.length) {
      item.classList.add('menu-item--quick');
      const add = make('button', 'menu-quick-add', 'Add');
      add.type = 'button';
      add.setAttribute('aria-label', 'Add ' + product.name + ' to basket, ' + formatPrice(product.basePricePence));
      add.addEventListener('click', () => {
        const quantity = basketUI.addQuietly({ productId: product.id, name: product.name,
          unitPricePence: product.basePricePence, optionIds: [], options: [] });
        add.textContent = quantity > 1 ? quantity + ' in basket' : 'Added';
        add.classList.add('is-added');
        clearTimeout(add.reset);
        add.reset = setTimeout(() => { add.textContent = 'Add'; add.classList.remove('is-added'); }, 1800);
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

const shop = openingStatus();
const menuStatus = document.querySelector('#menu-status');
menuStatus.textContent = shop.open ? shop.text + '.' : shop.text + '. You can still send an order for collection when we open.';
menuStatus.dataset.open = String(shop.open);

const search = document.querySelector('#menu-search');
search.addEventListener('input', () => {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  for (const section of products.querySelectorAll('.menu-group')) {
    let visible = 0;
    for (const item of section.querySelectorAll('.menu-grid > li')) {
      const match = words.every(word => item.dataset.search.includes(word));
      item.hidden = !match;
      if (match) visible++;
    }
    section.hidden = !visible;
    shown += visible;
  }
  document.querySelector('#menu-no-results').hidden = shown > 0;
});
