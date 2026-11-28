const saladDescription = 'Served with fresh onions, cucumber, tomatoes, lettuce, long chillies, mixed cabbage and sauce.';

const photos = './assets/products/shish/';

// Each variant is shown in the client's approved photograph of the box opened
// flat (salad and pitta in the lid, chicken in the base). Sauces are squeezed
// over the chicken (sauceArea: left, top, right, bottom as shares of the photo).
function chickenShish(id, name, basePricePence, components, photo, sauceArea) {
  return {
    id,
    name,
    basePricePence,
    image: photos + photo + '-700.webp',
    photo: {
      src: photos + photo + '-1400.webp', small: photos + photo + '-700.webp', width: 1448, height: 930,
      sauceArea, sauceAmounts: { 'little-chilli': 'little', 'extra-chilli': 'extra' },
    },
    categoryId: 'shish',
    policy: 'kebab',
    components,
    builderDescription: saladDescription,
  };
}

export default [
  chickenShish('chicken-shish-medium', 'Chicken Shish – Medium', 980, ['shish'], 'shish-medium', [.53, .12, .945, .87]),
  chickenShish('chicken-shish-medium-with-chips', 'Chicken Shish – Medium with Chips', 1080, ['shish', 'chips'], 'shish-medium-chips', [.53, .13, .87, .87]),
  chickenShish('chicken-shish-large', 'Chicken Shish – Large', 1180, ['shish'], 'shish-large', [.53, .12, .945, .87]),
  chickenShish('chicken-shish-large-with-chips', 'Chicken Shish – Large with Chips', 1280, ['shish', 'chips'], 'shish-large-chips', [.55, .15, .9, .85]),
];
