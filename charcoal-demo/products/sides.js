// Menu and order values from the Hot Dogs, Sides & Snacks and Drinks sections in index.html.
function menuItem(categoryId, id, name, basePricePence, image, presentation = {}) {
  return { id, name, basePricePence, image, categoryId, policy: 'none', visual: 'photo', components: [], ...presentation };
}

const sides = [
  // One card per item. The menu prices 6pcs at £3.90 and 9pcs at £4.90, and
  // small chips at £2.90 and large at £3.90, so each upgrade is the difference.
  menuItem('nuggets', 'chicken-nuggets', 'Chicken Nuggets', 390, '../IMG_0373.jpeg', {
    visual: 'plate', policy: 'nuggets', components: Array(6).fill('nugget'),
    aliases: { 'chicken-nuggets-6': [], 'chicken-nuggets-9': ['nuggets-9'] },
    builderDescription: '6 pieces as standard, or make it 9.',
  }),
  menuItem('chips', 'chips', 'Chips', 290, '../IMG_0356.jpeg', {
    visual: 'plate', policy: 'chips', components: ['chips'],
    aliases: { 'chips-small': [], 'chips-large': ['chips-large'] },
    builderDescription: 'Regular portion as standard. Make it large, then season it.',
  }),
  menuItem('sides', 'snickers', 'Snickers', 90, './assets/menu/snickers.webp'),
  menuItem('sides', 'kit-kat', 'Kit Kat', 90, './assets/menu/kit-kat.webp'),
  menuItem('sides', 'mars', 'Mars', 90, './assets/menu/mars.webp'),
  menuItem('sides', 'bounty', 'Bounty', 90, './assets/menu/bounty.webp'),
  menuItem('other', 'halloumi-cheese-sandwich', 'Halloumi Cheese Sandwich', 550, '../IMG_0355.jpeg', {
    policy: 'burger', components: ['sandwich'],
  }),
];

const drinks = [
  menuItem('drinks', 'water', 'Water', 150, '../IMG_0397.jpeg'),
  menuItem('drinks', 'coca-cola-classic', 'Coca-Cola Classic', 150, '../IMG_0358.jpeg'),
  menuItem('drinks', 'coca-cola-zero', 'Coca-Cola Zero', 150, '../IMG_0359.webp'),
  menuItem('drinks', 'diet-coke', 'Coca-Cola Diet', 150, '../IMG_0360.png'),
  menuItem('drinks', 'pepsi', 'Pepsi', 150, '../IMG_0357.png'),
  menuItem('drinks', 'tango-orange', 'Tango Orange', 150, '../IMG_0361.jpeg'),
  menuItem('drinks', 'fanta-orange', 'Fanta Orange', 150, '../IMG_0362.jpeg'),
  menuItem('drinks', 'mirinda-strawberry', 'Mirinda Strawberry', 150, '../IMG_0363.png'),
  menuItem('drinks', 'ribena-strawberry', 'Ribena Strawberry', 150, '../IMG_0368.webp'),
  menuItem('drinks', 'ribena-blackcurrant', 'Ribena Blackcurrant', 150, '../IMG_0369.jpeg'),
  menuItem('drinks', 'lucozade-orange', 'Lucozade Orange', 190, '../IMG_0366.jpeg'),
  menuItem('drinks', 'lucozade-original', 'Lucozade Original', 190, '../IMG_0367.jpeg'),
  menuItem('drinks', 'red-bull', 'Red Bull', 230, '../IMG_0364.png'),
];

export default [...sides, ...drinks];
