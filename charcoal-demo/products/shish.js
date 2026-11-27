// Card art: the grilled chicken served on the plate, as in the builder scene.
const plate = { src: './assets/props/plate.webp', w: .98, base: .14, z: 1 };
const chicken = { src: './assets/menu/shish.webp', w: .56, x: .1, base: .25, z: 3 };
const salad = { src: '../burger-builder-demo/assets/lettuce.webp', w: .42, x: -.22, base: .26, z: 2 };
const chips = { src: './assets/menu/chips.webp', w: .42, x: -.2, base: .27, z: 2 };
const saladDescription = 'Served with fresh onions, cucumber, tomatoes, lettuce, long chillies, mixed cabbage and sauce.';

function chickenShish(id, name, basePricePence, components) {
  return {
    id,
    name,
    basePricePence,
    image: './assets/menu/shish.webp',
    art: [plate, components.includes('chips') ? chips : salad, chicken],
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
