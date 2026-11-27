import beefProducts from './products/beef.js';
import chickenProducts from './products/chicken.js';
import veggieProducts from './products/veggie.js';
import hotDogs from './products/hot-dogs.js';
import shishProducts from './products/shish.js';
import sidesAndDrinks from './products/sides.js';
import mealDeals from './products/deals.js';

const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const ingredientImage = id => `../burger-builder-demo/assets/${id}.webp`;
const option = (id, name, pricePence = 0, presentation = {}) => ({
  id,
  name,
  pricePence,
  ...presentation,
});

// Grouped like the live menu: Meal deals, Burgers, Kebabs, Hot dogs (with the
// halloumi sandwich), Sides & snacks and Drinks, with burgers split by type.
const categories = [
  { id: 'meal-deals', name: 'Meal deals' },
  { id: 'beef-burgers', name: 'Beef burgers' },
  { id: 'chicken-burgers', name: 'Chicken burgers' },
  { id: 'veggie-burgers', name: 'Veggie burgers' },
  { id: 'shish', name: 'Chicken shish' },
  { id: 'hot-dogs', name: 'Hot dogs and sandwiches' },
  { id: 'sides', name: 'Sides and snacks' },
  { id: 'drinks', name: 'Drinks' },
];

const saladLayers = ['lettuce', 'tomato', 'cucumber', 'onion', 'gherkin'];
const salad = [
  option('lettuce', 'Lettuce', 0, { image: ingredientImage('lettuce'), layerKeys: ['lettuce'] }),
  option('tomato', 'Tomato', 0, { image: ingredientImage('tomato'), layerKeys: ['tomato'] }),
  option('cucumber', 'Cucumber', 0, { image: ingredientImage('cucumber'), layerKeys: ['cucumber'] }),
  option('onion', 'Onion', 0, { image: ingredientImage('onion'), layerKeys: ['onion'] }),
  option('gherkin', 'Pickle (gherkin)', 0, { image: ingredientImage('pickle'), layerKeys: ['gherkin'] }),
  option('all-salad', 'All salad', 0, { layerKeys: saladLayers }),
];

const extras = [
  option('extra-cheese', 'Extra cheese', 30, {
    image: ingredientImage('cheese'),
    layerKeys: ['extra-cheese'],
  }),
  option('halloumi', 'Halloumi × 2', 200, {
    image: './assets/halloumi.webp', layerKeys: ['halloumi'],
  }),
  option('egg', 'Egg', 60, { image: './assets/egg.webp', layerKeys: ['egg'] }),
];

const preferences = [
  option('plain', 'Plain', 0, { removeLayerKeys: saladLayers }),
  option('no-salad', 'No Veggie'),
  option('no-onion', 'No onion', 0, { removeLayerKeys: ['onion'] }),
  option('no-pepper', 'No pepper'),
  option('no-cheese', 'No cheese', 0, { removeLayerKeys: ['cheese'] }),
];

const sauces = [
  option('burger-sauce', 'Burger sauce', 0, { image: './assets/sauces/burger-sauce.webp', layerKeys: ['burger-sauce'] }),
  option('ketchup', 'Ketchup', 0, { image: './assets/sauces/ketchup.webp', layerKeys: ['ketchup'] }),
  option('mayo', 'Mayonnaise', 0, { image: './assets/sauces/mayo.webp', layerKeys: ['mayo'] }),
  option('chilli-sauce', 'Chilli sauce', 0, { image: './assets/sauces/chilli-sauce.webp', layerKeys: ['chilli-sauce'] }),
  option('garlic-mayo', 'Garlic mayonnaise', 0, { image: './assets/sauces/garlic-mayo.webp', layerKeys: ['garlic-mayo'] }),
  option('bbq-sauce', 'BBQ sauce', 0, { image: './assets/sauces/bbq-sauce.webp', layerKeys: ['bbq-sauce'] }),
  option('mustard', 'Mustard', 0, { image: './assets/sauces/mustard.webp', layerKeys: ['mustard'] }),
  option('salt', 'Salt'),
  option('vinegar', 'Vinegar'),
];

const group = (id, name, options, display = 'text', min = 0, max = options.length) => ({
  id,
  name,
  min,
  max,
  display,
  options,
});

const includedPatties = group('patties', 'Patties', [
  option('included-beef', 'Beef patties', 0, {
    image: ingredientImage('beef'),
    locked: true,
  }),
], 'photos');

const sauceGroup = {
  ...group('sauces', 'Sauces', sauces, 'photos'),
  featuredCount: 3,
  moreLabel: 'More sauces',
};
const preferenceGroup = group('preferences', 'Preferences', preferences);
const toppingsGroup = {
  ...group('toppings', 'Toppings', [extras[0], salad[0], salad[4], salad[1],
    ...salad.slice(2, 4), salad[5], ...extras.slice(1)], 'photos'),
  featuredCount: 4,
  moreLabel: 'More toppings',
};
const toppingsGroups = [toppingsGroup, sauceGroup, preferenceGroup];

// index.html Half Pounder with Cheese menu row, TOPPINGS and SAUCES are the
// ordering source. The charcoal preview has two beef layers for presentation.
export const halfPounder = {
  id: 'half-pounder-with-cheese',
  name: 'Half Pounder with Cheese',
  titleLines: ['Half Pounder', 'with Cheese'],
  builderTitle: 'Customise your burger',
  builderDescription: 'Choose your fillings and sauces.',
  categoryId: 'beef-burgers',
  basePricePence: 690,
  image: './assets/products/burger-half.webp',
  preview: {
    id: 'half-pounder',
    fixedLayerKeys: ['bottom', 'patty-a', 'patty-b', 'cheese', 'top'],
  },
  optionGroups: [includedPatties, ...toppingsGroups],
};

const kebabChilli = { ...group('chilli', 'Chilli preference', [
  option('chilli', 'Chilli', 0, { layerKeys: ['chilli-sauce'] }),
  option('extra-chilli', 'Extra chilli', 0, { layerKeys: ['chilli-sauce'] }),
  option('little-chilli', 'Little chilli', 0, { layerKeys: ['chilli-sauce'] }),
  option('no-chilli', 'No chilli'),
  option('bbq', 'BBQ', 0, { layerKeys: ['bbq-sauce'] }),
], 'text', 1), requiredMessage: 'Please choose a chilli preference.' };

const mealDrinkIds = [
  'water', 'coca-cola-classic', 'coca-cola-zero', 'diet-coke', 'pepsi',
  'tango-orange', 'fanta-orange', 'mirinda-strawberry', 'ribena-strawberry', 'ribena-blackcurrant',
];
const drinksById = new Map(sidesAndDrinks.filter(item => item.categoryId === 'drinks')
  .map(item => [item.id, item]));
const mealDrink = { ...group('drink', 'Choose your drink', mealDrinkIds.map(id => {
  const { name, image, cutout, sceneWidth } = drinksById.get(id);
  return option(id, name, 0, { image: cutout ?? image, cutout, sceneWidth, layerKeys: ['drink-' + id] });
}), 'photos', 1, 1), requiredMessage: 'Please choose a drink.' };

// Mirrors the source's openCustomise item types. A new menu entry supplies
// its own price, photo and preview profile, and may provide its own groups
// for variants such as portions. Choice IDs are unique within a product.
const sideSauces = {
  ...group('sauces', 'Sauces', sauces.filter(({ id }) => id !== 'salt' && id !== 'vinegar'), 'photos'),
  featuredCount: 3,
  moreLabel: 'More sauces',
}
const seasoning = group('seasoning', 'Seasoning', [option('salt', 'Salt'), option('vinegar', 'Vinegar')])
const chipsSize = { ...group('size', 'Size', [
  option('chips-regular', 'Regular', 0, { image: './assets/menu/chips.webp', layerKeys: ['chips-regular'] }),
  option('chips-large', 'Make it large', 100, { image: './assets/menu/chips.webp', layerKeys: ['chips-large'] }),
], 'photos', 1, 1), defaultOptionIds: ['chips-regular'], hideInSummary: ['chips-regular'] }
const nuggetCount = { ...group('pieces', 'Pieces', [
  option('nuggets-6', '6 pieces', 0, { image: './assets/menu/nugget.webp' }),
  option('nuggets-9', '9 pieces', 100, { image: './assets/menu/nugget.webp', layerKeys: ['nuggets-extra-0', 'nuggets-extra-1', 'nuggets-extra-2'] }),
], 'photos', 1, 1), defaultOptionIds: ['nuggets-6'] }

export const optionPolicies = {
  chips: [chipsSize, seasoning, sideSauces],
  nuggets: [nuggetCount, sideSauces],
  burger: toppingsGroups,
  kebab: [kebabChilli, ...toppingsGroups],
  meal: [
    mealDrink,
    group('toppings', 'Toppings', [...salad, ...extras, option('cheese', 'Cheese', 0, { image: ingredientImage('cheese'), layerKeys: ['cheese'] })], 'photos'),
    sauceGroup,
    preferenceGroup,
  ],
  none: [],
};

const otherProducts = [
  ...beefProducts, ...chickenProducts, ...veggieProducts, ...hotDogs,
  ...shishProducts, ...sidesAndDrinks, ...mealDeals,
].map(product => ({
  ...product,
  optionGroups: optionPolicies[product.policy],
}));

// Choices that cannot both apply to one item. Selecting one clears the other,
// so the kitchen never receives a self-contradicting ticket.
const saladIds = ['lettuce', 'tomato', 'cucumber', 'onion', 'gherkin', 'all-salad']
export const optionConflicts = [
  ['extra-cheese', 'no-cheese'], ['cheese', 'no-cheese'],
  ...saladIds.map(id => ['plain', id]),
  ...saladIds.map(id => ['no-salad', id]),
  ['onion', 'no-onion'], ['all-salad', 'no-onion'],
  ...['chilli', 'extra-chilli', 'little-chilli'].map(id => ['no-chilli', id]),
  ['chilli', 'extra-chilli'], ['chilli', 'little-chilli'], ['extra-chilli', 'little-chilli'],
]

export const catalog = {
  currency: 'GBP',
  categories,
  products: [...otherProducts, halfPounder],
};

export function formatPrice(pence) {
  return pounds.format(pence / 100);
}

export function createDefaultSelections(product, extraIds = []) {
  const selected = new Set(product.optionGroups.flatMap(({ options, defaultOptionIds = [] }) =>
    options.filter(({ id, defaultSelected }) => defaultSelected || defaultOptionIds.includes(id)).map(({ id }) => id)))
  for (const id of extraIds) {
    const group = product.optionGroups.find(({ options }) => options.some(option => option.id === id))
    if (!group) continue
    if (group.max === 1) for (const { id: other } of group.options) selected.delete(other)
    selected.add(id)
  }
  return selected
}

// Old menu links (e.g. chips-large) open the merged product with that choice made.
export function findProduct(id) {
  for (const product of catalog.products) {
    if (product.id === id) return { product, preset: [] }
    if (product.aliases && Object.hasOwn(product.aliases, id)) return { product, preset: product.aliases[id] }
  }
  return null
}

export function getUnitPricePence(product, selections) {
  return product.basePricePence + product.optionGroups.reduce((total, { options }) => {
    return total + options.reduce((sum, { id, pricePence }) => {
      return selections.has(id) ? sum + pricePence : sum;
    }, 0);
  }, 0);
}
