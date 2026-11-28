import { shishSceneProfile } from './shish-scene.js';

const sharedAssets = '../burger-builder-demo/assets/';
const menuAssets = './assets/menu/';
const photo = (key, width, step = 0, motion = 'slice') => ({
  asset: menuAssets + key + '.webp', width, step, motion, offset: 0,
});
const componentPhotos = {
  beef: { asset: sharedAssets + 'beef.webp', width: .98, step: .125, offset: 0, motion: 'patty' },
  chicken: photo('chicken', .91, .17, 'patty'),
  veggie: photo('veggie', .92, .147, 'patty'),
  'dog-bottom': photo('dog-open-roll', 1.08, 0, 'bread'),
  sausage: photo('dog-overhead-sausage', .91, 0, 'patty'),
  chips: photo('chips', .97),
  nugget: photo('nugget', .31, 0, 'patty'),
};

const dogToppings = {
  cheese: { width: .54, offset: -.09, positionY: .105 },
  'extra-cheese': { width: .51, offset: -.08, positionY: .112 },
  egg: { width: .35, offset: .17, positionY: .10 },
  halloumi: { width: .40, offset: -.17, positionY: .11 },
  lettuce: { width: .48, offset: .11, positionY: .125 },
  tomato: { width: .36, offset: -.15, positionY: .12 },
  cucumber: { width: .32, offset: .13, positionY: .13 },
  gherkin: { width: .30, offset: .18, positionY: .115 },
  onion: { width: .36, offset: -.08, positionY: .15 },
};
const foodTypes = new Set(['burger', 'hot-dog', 'meal', 'plate']);

export function productProfile(product, burgerProfile) {
  if (!product.visual) return { image: product.image, name: product.name, ...product.preview };
  if (product.categoryId === 'shish') return shishSceneProfile(product, burgerProfile);

  const reference = new Map(burgerProfile.layers.map(layer => [layer.key, layer]));
  const optionKeys = new Set(product.optionGroups.flatMap(group =>
    group.options.flatMap(option => option.layerKeys ?? [])));
  const meal = product.visual === 'meal';
  const hotDog = product.components.includes('dog-bottom');
  const standaloneChips = product.categoryId === 'chips';
  const mainOffset = meal ? -.20 : 0;
  const mainScale = meal ? .71 : 1;
  const planar = hotDog || product.visual === 'plate' || !product.components.includes('top');

  function onDog(position) {
    return {
      width: position.width * mainScale,
      offset: position.offset * mainScale + mainOffset,
      positionY: position.positionY * mainScale,
      step: 0,
    };
  }
  const fixedLayerKeys = [];
  const main = [];
  const accessories = [];
  let cover;
  let nuggets = 0;

  function add(target, layer, fixed = true) {
    if (!layer) return;
    target.push(layer);
    if (fixed) fixedLayerKeys.push(layer.key);
  }

  for (const [index, key] of product.components.entries()) {
    if (key === 'drink' || key === 'dog-top') continue;
    const component = componentPhotos[key] ?? reference.get(key);
    if (!component) continue;
    const layerKey = reference.has(key) ? key : key + '-' + index;
    const configured = {
      ...component, key: layerKey, required: false,
      offset: (component.offset ?? 0) * mainScale + mainOffset,
      width: component.width * mainScale, step: component.step * mainScale,
    };
    if (key === 'top') {
      cover = configured;
    } else if (key === 'chips') {
      if (standaloneChips) {
        add(accessories, { ...configured, key: 'chips-small', width: .80, positionY: 0, offset: 0 });
        add(accessories, { ...configured, key: 'chips-large', width: 1.03, positionY: 0, offset: 0 }, false);
      } else {
        add(accessories, { ...configured, width: meal ? .46 : .53, positionY: 0, offset: meal ? .36 : .41 });
      }
    } else if (key === 'nugget') {
      const row = Math.floor(nuggets / 3);
      const col = nuggets % 3;
      const width = meal ? .54 : .285;
      add(accessories, {
        ...configured, width, offset: meal ? -.27 : (col - 1) * .30 + (row % 2) * .035,
        positionY: row * .188, restingAngle: ((nuggets++ * 17) % 29) - 14,
      });
    } else {
      const dogPosition = dogToppings[key] ?? (key === 'sausage' ?
        { width: .91, offset: 0, positionY: .112 } :
        key === 'dog-bottom' ? { width: 1.08, offset: 0, positionY: 0 } : null);
      add(main, hotDog && dogPosition ? { ...configured, ...onDog(dogPosition) } : configured);
    }
  }

  // Standalone products and the sandwich can use the existing menu photograph.
  if (!foodTypes.has(product.visual)) {
    add(main, {
      key: 'menu-photo', asset: product.image, motion: 'slice', width: product.categoryId === 'drinks' ? .56 : .79,
      offset: 0, step: 0, positionY: 0, menuPhoto: product.categoryId !== 'sides',
    });
  }

  const represented = new Set(main.map(layer => layer.key));
  for (const layer of reference.values()) {
    if (!optionKeys.has(layer.key) || represented.has(layer.key)) continue;
    let placement = { width: layer.width * mainScale, step: layer.step * mainScale,
      offset: layer.offset * mainScale + mainOffset };
    if (hotDog) {
      const target = layer.sauce ? { width: .83, offset: 0, positionY: .21 } : dogToppings[layer.key];
      if (target) placement = { ...onDog(target), trace: layer.sauce ? 'lengthwise' : undefined };
    } else if (standaloneChips && layer.sauce) {
      placement = { width: .63, offset: layer.offset, positionY: .14, step: 0 };
    }
    add(main, { ...layer, required: false, ...placement }, false);
  }
  // Side dishes and a chosen drink stay beside the main during assembly.
  for (const choice of product.optionGroups.flatMap(group => group.options)) {
    const key = choice.layerKeys?.find(id => id.startsWith('drink-'));
    if (!key) continue;
    add(accessories, {
      key, asset: choice.image, width: .255, offset: .57, positionY: .05,
      motion: 'slice', menuPhoto: true, step: 0,
    }, false);
  }
  add(main, cover);
  return {
    name: product.name, visual: product.visual, fixedLayerKeys, planar,
    layers: [...accessories, ...main], closingLayerKey: cover?.key,
    timings: product.visual === 'photo' ? { drop: 360 } :
      product.visual === 'plate' ? { drop: 242, settle: 80 } : undefined,
  };
}
