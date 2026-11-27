const quarterPhoto = './assets/products/burger-quarter.webp';
const halfPhoto = './assets/products/burger-half.webp';

function beefBurger(id, name, basePricePence, image, components) {
  return {
    id,
    name,
    basePricePence,
    image,
    categoryId: 'beef-burgers',
    policy: 'burger',
    visual: 'burger',
    components,
  };
}

// The menu names determine the included cheese and egg. Patties use the
// approved Half Pounder layers: one for a quarter, two for a half pounder.
export default [
  beefBurger('quarter-pounder-burger', 'Quarter Pounder Burger', 470, quarterPhoto,
    ['bottom', 'patty-a', 'top']),
  beefBurger('quarter-pounder-with-cheese', 'Quarter Pounder with Cheese', 490, quarterPhoto,
    ['bottom', 'patty-a', 'cheese', 'top']),
  beefBurger('quarter-pounder-with-egg', 'Quarter Pounder with Egg', 570, quarterPhoto,
    ['bottom', 'patty-a', 'egg', 'top']),
  beefBurger('quarter-pounder-cheese-and-egg', 'Quarter Pounder Cheese and Egg', 590, quarterPhoto,
    ['bottom', 'patty-a', 'cheese', 'egg', 'top']),
  beefBurger('half-pounder-burger', 'Half Pounder Burger', 670, halfPhoto,
    ['bottom', 'patty-a', 'patty-b', 'top']),
  beefBurger('half-pounder-cheese-and-egg', 'Half Pounder Cheese and Egg', 770, halfPhoto,
    ['bottom', 'patty-a', 'patty-b', 'cheese', 'egg', 'top']),
];
