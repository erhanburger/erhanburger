// Each price, photo and main component comes from a Meal Deal in index.html.
// The shared meal policy requires one included drink and retains the optional extras.
// Card art is composed from the same cut-outs as the rest of the menu (main,
// chips and a drink) on one surface, rather than stock combo photographs. The
// drink shown varies by deal because the customer chooses it.
const cutouts = './assets/products/';
function meal(id, main, basePricePence, image, mainComponents, drink, popular = false) {
  return {
    id: 'deal-' + id,
    name: 'Deal ' + id + ' – ' + main + ', Chips & Drink',
    basePricePence,
    image,
    art: [
      { src: cutouts + 'chips.webp', w: .62, x: .2, base: .2, z: 1 },
      { src: image, w: .86, x: -.11, base: .12, z: 2 },
      { src: './assets/cutouts/' + drink + '.webp', w: .16, x: .36, base: .13, z: 3 },
    ],
    categoryId: 'meal-deals',
    policy: 'meal',
    visual: 'meal',
    components: [...mainComponents, 'chips', 'drink'],
    popular,
  };
}

export default [
  meal(1, 'Quarter Burger', 790, cutouts + 'burger-quarter.webp', ['bottom', 'beef', 'top'], 'drink-coke-classic', true),
  meal(2, 'Half Burger', 980, cutouts + 'burger-half.webp', ['bottom', 'beef', 'top'], 'drink-pepsi', true),
  meal(3, 'Chicken Burger', 790, cutouts + 'chicken-burger.webp', ['bottom', 'chicken', 'top'], 'drink-fanta'),
  meal(4, 'Chicken Nuggets', 780, cutouts + 'nuggets.webp', ['nugget'], 'drink-tango'),
  meal(5, 'Hot Dog', 790, cutouts + 'hot-dog.webp', ['dog-bottom', 'sausage', 'dog-top'], 'drink-coke-zero', true),
  meal(6, 'Veggie Burger', 790, cutouts + 'burger-veggie.webp', ['bottom', 'veggie', 'top'], 'drink-mirinda'),
];
