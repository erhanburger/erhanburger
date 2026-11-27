// Menu and order values from the Hot Dogs, Sides & Snacks and Drinks sections in index.html.
function menuItem(categoryId, id, name, basePricePence, image, presentation = {}) {
  return { id, name, basePricePence, image, categoryId, policy: 'none', visual: 'photo', components: [], ...presentation };
}

function sweet(id, name) {
  return menuItem('sides', id, name, 90, './assets/menu/' + id + '.webp');
}

const sides = [
  // One card per item. The menu prices 6pcs at £3.90 and 9pcs at £4.90, and
  // small chips at £2.90 and large at £3.90, so each upgrade is the difference.
  menuItem('sides', 'chips', 'Chips', 290, './assets/products/chips.webp', {
    visual: 'plate', policy: 'chips', components: ['chips'],
    aliases: { 'chips-small': [], 'chips-large': ['chips-large'] },
    builderDescription: 'Regular portion as standard. Make it large, then season it.',
  }),
  menuItem('sides', 'chicken-nuggets', 'Chicken Nuggets', 390, './assets/products/nuggets.webp', {
    visual: 'plate', policy: 'nuggets', components: Array(6).fill('nugget'),
    aliases: { 'chicken-nuggets-6': [], 'chicken-nuggets-9': ['nuggets-9'] },
    builderDescription: '6 pieces as standard, or make it 9.',
  }),
  sweet('snickers', 'Snickers'),
  sweet('kit-kat', 'Kit Kat'),
  sweet('mars', 'Mars'),
  sweet('bounty', 'Bounty'),
  menuItem('hot-dogs', 'halloumi-cheese-sandwich', 'Halloumi Cheese Sandwich', 550, './assets/products/halloumi-sandwich.webp', {
    sceneWidth: .6,
    // The only photo is a styled overhead shot, so the card is composed from cut-outs.
    art: [
      { src: './assets/menu/roll-bottom.webp', w: .62, base: .2, z: 1 },
      { src: './assets/halloumi.webp', w: .5, base: .245, z: 2 },
      { src: './assets/menu/roll-top.webp', w: .62, base: .31, z: 3, rotate: -4 },
    ],
    policy: 'burger', components: ['sandwich'],
  }),
];

// Drinks use the normalised photographs (assets/products) on cards and tight
// cut-outs of the same files (assets/cutouts) in the builder scene. sceneWidth is
// the preview width as a share of the stage, by pack shape.
const can = .3;
const bottle = .17;
const carton = .27;
function drink(id, name, basePricePence, file, sceneWidth) {
  return menuItem('drinks', id, name, basePricePence, './assets/products/' + file + '.webp', {
    cutout: './assets/cutouts/' + file + '.webp', sceneWidth,
  });
}

const drinks = [
  drink('water', 'Water', 150, 'drink-water', bottle),
  drink('coca-cola-classic', 'Coca-Cola Classic', 150, 'drink-coke-classic', can),
  drink('coca-cola-zero', 'Coca-Cola Zero', 150, 'drink-coke-zero', can),
  drink('diet-coke', 'Coca-Cola Diet', 150, 'drink-diet-coke', can),
  drink('pepsi', 'Pepsi', 150, 'drink-pepsi', can),
  drink('tango-orange', 'Tango Orange', 150, 'drink-tango', can),
  drink('fanta-orange', 'Fanta Orange', 150, 'drink-fanta', can),
  drink('mirinda-strawberry', 'Mirinda Strawberry', 150, 'drink-mirinda', can),
  drink('ribena-strawberry', 'Ribena Strawberry', 150, 'drink-ribena-strawberry', carton),
  drink('ribena-blackcurrant', 'Ribena Blackcurrant', 150, 'drink-ribena-blackcurrant', carton),
  drink('lucozade-orange', 'Lucozade Orange', 190, 'drink-lucozade', bottle),
  // The live site's Lucozade Original photo carries a stock-library watermark,
  // so a neutral bottle is shown until an approved photo is supplied.
  menuItem('drinks', 'lucozade-original', 'Lucozade Original', 190, './assets/props/drink-placeholder.webp', {
    cutout: './assets/props/drink-placeholder.webp', sceneWidth: bottle * 1.6,
  }),
  drink('red-bull', 'Red Bull', 230, 'drink-red-bull', can),
];

export default [...sides, ...drinks];
