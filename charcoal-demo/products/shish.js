const saladDescription = 'Served with fresh onions, cucumber, tomatoes, lettuce, long chillies, mixed cabbage and sauce.';

function chickenShish(id, name, basePricePence, components, portion) {
  return {
    id,
    name,
    basePricePence,
    image: './assets/menu/shish.webp',
    categoryId: 'shish',
    policy: 'kebab',
    visual: 'plate',
    components,
    // Served in an open takeaway box: see box-recipes.js.
    box: { recipe: 'chicken-shish', portion, chips: components.includes('chips') },
    builderDescription: saladDescription,
  };
}

export default [
  chickenShish('chicken-shish-medium', 'Chicken Shish – Medium', 980, ['shish'], 'medium'),
  chickenShish('chicken-shish-medium-with-chips', 'Chicken Shish – Medium with Chips', 1080, ['shish', 'chips'], 'medium'),
  chickenShish('chicken-shish-large', 'Chicken Shish – Large', 1180, ['shish'], 'large'),
  chickenShish('chicken-shish-large-with-chips', 'Chicken Shish – Large with Chips', 1280, ['shish', 'chips'], 'large'),
];
