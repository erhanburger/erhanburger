const hotDogPhoto = './assets/products/hot-dog.webp';

export default [
  {
    id: 'hot-dog',
    name: 'Hot Dog',
    basePricePence: 470,
    image: hotDogPhoto,
    categoryId: 'hot-dogs',
    policy: 'burger',
    visual: 'hot-dog',
    components: ['dog-bottom', 'sausage', 'dog-top'],
  },
  {
    id: 'hot-dog-with-cheese',
    name: 'Hot Dog with Cheese',
    basePricePence: 490,
    image: hotDogPhoto,
    categoryId: 'hot-dogs',
    policy: 'burger',
    visual: 'hot-dog',
    components: ['dog-bottom', 'sausage', 'cheese', 'dog-top'],
  },
  {
    id: 'hot-dog-with-cheese-and-egg',
    name: 'Hot Dog with Cheese and Egg',
    basePricePence: 580,
    image: hotDogPhoto,
    categoryId: 'hot-dogs',
    policy: 'burger',
    visual: 'hot-dog',
    components: ['dog-bottom', 'sausage', 'cheese', 'egg', 'dog-top'],
  },
];
