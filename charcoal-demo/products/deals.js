// Each price, photo and main component comes from a Meal Deal in index.html.
// The shared meal policy requires one included drink and retains the optional extras.
// Cards show the builder scene at rest (art.js) with one drink chosen for the
// picture; the drink varies by deal because the customer chooses it.
const photos = './assets/products/';
function meal(id, main, basePricePence, image, mainComponents, cardDrink, popular = false) {
  return {
    id: 'deal-' + id,
    name: 'Deal ' + id + ' – ' + main + ', Chips & Drink',
    basePricePence,
    image,
    cardChoices: [cardDrink],
    categoryId: 'meal-deals',
    policy: 'meal',
    visual: 'meal',
    components: [...mainComponents, 'chips', 'drink'],
    popular,
  };
}

export default [
  meal(1, 'Quarter Burger', 790, photos + 'burger-quarter.webp', ['bottom', 'beef', 'top'], 'coca-cola-classic', true),
  meal(2, 'Half Burger', 980, photos + 'burger-half.webp', ['bottom', 'beef', 'beef', 'top'], 'pepsi', true),
  meal(3, 'Chicken Burger', 790, photos + 'chicken-burger.webp', ['bottom', 'chicken', 'top'], 'fanta-orange'),
  meal(4, 'Chicken Nuggets', 780, photos + 'nuggets.webp', ['nugget'], 'tango-orange'),
  meal(5, 'Hot Dog', 790, photos + 'hot-dog.webp', ['dog-bottom', 'sausage', 'dog-top'], 'coca-cola-zero', true),
  meal(6, 'Veggie Burger', 790, photos + 'burger-veggie.webp', ['bottom', 'veggie', 'top'], 'mirinda-strawberry'),
];
