const saladDescription = 'Served with fresh onions, cucumber, tomatoes, lettuce, long chillies, mixed cabbage and sauce.';

function chickenShish(id, name, basePricePence, components) {
  return {
    id,
    name,
    basePricePence,
    image: './assets/menu/shish.webp',
    categoryId: 'shish',
    policy: 'kebab',
    visual: 'plate',
    components,
    builderDescription: saladDescription,
  };
}

export default [
  chickenShish('chicken-shish-medium', 'Chicken Shish – Medium', 980, ['shish']),
  chickenShish('chicken-shish-medium-with-chips', 'Chicken Shish – Medium with Chips', 1080, ['shish', 'chips']),
  chickenShish('chicken-shish-large', 'Chicken Shish – Large', 1180, ['shish']),
  chickenShish('chicken-shish-large-with-chips', 'Chicken Shish – Large with Chips', 1280, ['shish', 'chips']),
];
