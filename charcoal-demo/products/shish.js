const saladDescription = 'Choose your salad and sauces. All salad includes fresh onions, cucumber, tomatoes, lettuce, long chillies and mixed cabbage.';

function chickenShish(portion, basePricePence, withChips = false) {
  const variant = withChips ? portion + '-with-chips' : portion;
  const size = portion === 'large' ? 'Large' : 'Medium';
  const subtitle = '– ' + size + (withChips ? ' with Chips' : '');

  return {
    id: 'chicken-shish-' + variant,
    name: 'Chicken Shish ' + subtitle,
    titleLines: ['Chicken Shish ', subtitle],
    basePricePence,
    image: './assets/shish/' + variant + '.webp',
    categoryId: 'shish',
    policy: 'kebab',
    visual: 'plate',
    portion,
    components: withChips ? ['shish', 'chips'] : ['shish'],
    builderDescription: saladDescription,
  };
}

export default [
  chickenShish('medium', 980),
  chickenShish('medium', 1080, true),
  chickenShish('large', 1180),
  chickenShish('large', 1280, true),
];
