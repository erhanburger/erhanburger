const sharedAssets = '../burger-builder-demo/assets/';
const menuAssets = './assets/menu/';
const photo = (key, width, step = 0, motion = 'slice') => ({
  asset: menuAssets + key + '.webp', width, step, motion, offset: 0,
});
const componentPhotos = {
  beef: { asset: sharedAssets + 'beef.webp', width: .98, step: .125, offset: 0, motion: 'patty' },
  chicken: photo('chicken', .91, .17, 'patty'),
  veggie: photo('veggie', .92, .147, 'patty'),
  'dog-bottom': photo('roll-bottom', 1.08, .096, 'bread'),
  sausage: photo('sausage', .99, .058, 'patty'),
  'dog-top': photo('roll-top', 1.08, 0, 'crown'),
  chips: photo('chips', .97),
  nugget: photo('nugget', .31, 0, 'patty'),
  shish: photo('shish', .98, .18, 'patty'),
};

const roundClosers = new Set(['top', 'dog-top']);
const shishSalad = new Set(['lettuce', 'tomato', 'cucumber', 'onion']);
const foodTypes = new Set(['burger', 'hot-dog', 'meal', 'plate']);

export function productProfile(product, burgerProfile) {
  if (!product.visual) return { image: product.image, name: product.name, ...product.preview };

  const reference = new Map(burgerProfile.layers.map(layer => [layer.key, layer]));
  const optionKeys = new Set(product.optionGroups.flatMap(group =>
    group.options.flatMap(option => option.layerKeys ?? [])));
  const meal = product.visual === 'meal';
  const shish = product.categoryId === 'shish';
  const hotDog = product.components.includes('dog-bottom');
  const withChips = product.components.includes('chips');
  const mainOffset = meal ? -.20 : shish && withChips ? -.16 : 0;
  const mainScale = meal ? .71 : shish && withChips ? .83 : 1;
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
    if (key === 'drink') continue;
    const component = componentPhotos[key] ?? reference.get(key);
    if (!component) continue;
    const layerKey = reference.has(key) ? key : key + '-' + index;
    const configured = {
      ...component, key: layerKey, required: false,
      offset: (component.offset ?? 0) * mainScale + mainOffset,
      width: component.width * mainScale, step: component.step * mainScale,
    };
    if (roundClosers.has(key)) {
      cover = configured;
    } else if (key === 'chips') {
      const small = product.portion === 'small';
      const width = meal ? .46 : shish ? .52 : small ? .80 : 1.03;
      add(accessories, { ...configured, width, positionY: 0, offset: meal ? .36 : shish ? .38 : 0 });
    } else if (key === 'nugget') {
      const row = Math.floor(nuggets / 3);
      const col = nuggets % 3;
      const width = meal ? .54 : .285;
      add(accessories, {
        ...configured, width, offset: meal ? -.27 : (col - 1) * .30 + (row % 2) * .035,
        positionY: row * .188, restingAngle: ((nuggets++ * 17) % 29) - 14,
      });
    } else {
      add(main, key === 'shish' && product.name.includes('Large') ?
        { ...configured, width: configured.width * 1.12 } : configured);
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
    const scale = mainScale * (hotDog && !layer.sauce ? .74 : 1);
    add(main, {
      ...layer, required: false, width: layer.width * scale,
      step: layer.step * scale, offset: layer.offset * scale + mainOffset,
    }, shish && shishSalad.has(layer.key));
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
    name: product.name, visual: product.visual, fixedLayerKeys,
    layers: [...accessories, ...main], closingLayerKey: cover?.key,
    timings: product.visual === 'photo' ? { drop: 360 } :
      product.visual === 'plate' ? { drop: 242, settle: 80 } : undefined,
  };
}
