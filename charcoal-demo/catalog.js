const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const ingredientImage = id => `../burger-builder-demo/assets/${id}.webp`;
const option = (id, name, pricePence = 0, presentation = {}) => ({
  id,
  name,
  pricePence,
  ...presentation,
});

const categories = [
  { id: 'beef-burgers', name: 'Beef burgers' },
  { id: 'chicken-burgers', name: 'Chicken burgers' },
  { id: 'veggie-burgers', name: 'Veggie burgers' },
  { id: 'hot-dogs', name: 'Hot dogs' },
  { id: 'shish', name: 'Shish' },
  { id: 'nuggets', name: 'Chicken nuggets' },
  { id: 'chips', name: 'Chips' },
  { id: 'sides', name: 'Sides and snacks' },
  { id: 'meal-deals', name: 'Meal deals' },
  { id: 'other', name: 'Other items' },
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
  option('burger-sauce', 'Burger sauce', 0, { image: ingredientImage('burger-sauce'), layerKeys: ['burger-sauce'] }),
  option('ketchup', 'Ketchup', 0, { image: ingredientImage('ketchup'), layerKeys: ['ketchup'] }),
  option('mayo', 'Mayonnaise', 0, { image: ingredientImage('mayo'), layerKeys: ['mayo'] }),
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
  image: '../IMG_0352.png',
  preview: {
    id: 'half-pounder',
    fixedLayerKeys: ['bottom', 'patty-a', 'patty-b', 'cheese', 'top'],
  },
  optionGroups: [includedPatties, ...toppingsGroups],
};

const kebabChilli = group('chilli', 'Chilli preference', [
  option('chilli', 'Chilli'),
  option('extra-chilli', 'Extra chilli'),
  option('little-chilli', 'Little chilli'),
  option('no-chilli', 'No chilli'),
  option('bbq', 'BBQ'),
], 'text', 1);

const mealDrink = group('drink', 'Choose your drink', [
  option('water', 'Water'),
  option('coca-cola-classic', 'Coca-Cola Classic'),
  option('coca-cola-zero', 'Coca-Cola Zero'),
  option('diet-coke', 'Coca-Cola Diet'),
  option('pepsi', 'Pepsi'),
  option('tango-orange', 'Tango Orange'),
  option('fanta-orange', 'Fanta Orange'),
  option('mirinda-strawberry', 'Mirinda Strawberry'),
  option('ribena-strawberry', 'Ribena Strawberry'),
  option('ribena-blackcurrant', 'Ribena Blackcurrant'),
], 'text', 1, 1);

// Mirrors the source's openCustomise item types. A new menu entry supplies
// its own price, photo and preview profile, and may provide its own groups
// for variants such as portions. Choice IDs are unique within a product.
export const optionPolicies = {
  burger: toppingsGroups,
  kebab: [kebabChilli, ...toppingsGroups],
  meal: [
    mealDrink,
    group('toppings', 'Toppings', [...salad, ...extras, option('cheese', 'Cheese')], 'photos'),
    sauceGroup,
    preferenceGroup,
  ],
  none: [],
};

export const catalog = {
  currency: 'GBP',
  categories,
  products: [halfPounder],
};

export function formatPrice(pence) {
  return pounds.format(pence / 100);
}

export function createDefaultSelections(product) {
  return new Set(
    product.optionGroups.flatMap(({ options }) =>
      options.filter(({ defaultSelected }) => defaultSelected).map(({ id }) => id),
    ),
  );
}

export function getUnitPricePence(product, selections) {
  return product.basePricePence + product.optionGroups.reduce((total, { options }) => {
    return total + options.reduce((sum, { id, pricePence }) => {
      return selections.has(id) ? sum + pricePence : sum;
    }, 0);
  }, 0);
}
