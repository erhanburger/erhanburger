// Each price, photo and main component comes from a Meal Deal in index.html.
// The shared meal policy requires one included drink and retains the optional extras.
function meal(id, main, basePricePence, image, mainComponents) {
  return {
    id: 'deal-' + id,
    name: 'Deal ' + id + ' – ' + main + ', Chips & Drink',
    basePricePence,
    image,
    categoryId: 'meal-deals',
    policy: 'meal',
    visual: 'meal',
    components: [...mainComponents, 'chips', 'drink'],
  };
}

export default [
  meal(1, 'Quarter Burger', 790, '../IMG_0401.jpeg', ['bottom', 'beef', 'top']),
  meal(2, 'Half Burger', 980, '../IMG_0405.jpeg', ['bottom', 'beef', 'top']),
  meal(3, 'Chicken Burger', 790, '../IMG_0400.jpeg', ['bottom', 'chicken', 'top']),
  meal(4, 'Chicken Nuggets', 780, '../IMG_0404.webp', ['nugget']),
  meal(5, 'Hot Dog', 790, '../IMG_0402.jpeg', ['dog-bottom', 'sausage', 'dog-top']),
  meal(6, 'Veggie Burger', 790, '../IMG_0403.jpeg', ['bottom', 'veggie', 'top']),
];
