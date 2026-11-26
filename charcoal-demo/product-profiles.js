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

const props = './assets/props/';
const roundClosers = new Set(['top', 'dog-top']);

// Serving layouts for products that are not stacked like a burger. Positions are
// fractions of the rig width: offset is horizontal, positionY is height above the
// surface. Earlier entries sit further back.
const plate = { key: 'plate', asset: props + 'plate.webp', width: 1.34, offset: 0, positionY: -.035, step: 0, motion: 'slice' };
const tray = { key: 'tray', asset: props + 'tray.webp', width: 1.22, offset: 0, positionY: -.03, step: 0, motion: 'slice' };
const shishSaladLayout = {
  lettuce: { offset: -.27, positionY: .095, width: .50 },
  onion: { offset: -.36, positionY: .13, width: .30 },
  tomato: { offset: -.22, positionY: .115, width: .33 },
  cucumber: { offset: -.31, positionY: .085, width: .30 },
  gherkin: { offset: -.15, positionY: .10, width: .24 },
};
// Fillings on an open hot dog lie along the sausage instead of covering it.
const openRoll = {
  cheese: { width: .50, offset: -.14, positionY: .075 },
  'extra-cheese': { width: .44, offset: -.10, positionY: .08 },
  egg: { width: .36, offset: .19, positionY: .085 },
  halloumi: { width: .40, offset: -.02, positionY: .09 },
};
const nuggetSpots = [
  [-.25, .12, -12], [.02, .135, 9], [.27, .12, -5],
  [-.31, .05, 14], [-.04, .04, -8], [.22, .045, 11],
  [-.13, .17, 4], [.14, .18, -13], [.36, .08, 7],
];
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
  const mainOffset = meal ? -.20 : 0;
  const mainScale = meal ? .71 : 1;
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
    if (roundClosers.has(key) && hotDog && !meal) {
      // An open roll seen from slightly above: the far half stands behind the sausage.
      add(accessories, { ...configured, offset: .015, positionY: .14, width: configured.width * .97, step: 0 });
    } else if (roundClosers.has(key)) {
      cover = configured;
    } else if (key === 'chips' && optionKeys.has('chips-large')) {
      // Chips sold on their own: the portion choice swaps the regular and large serving.
      add(accessories, tray);
      add(accessories, { ...configured, key: 'chips-regular', width: .78, positionY: .06, offset: 0 }, false);
      add(accessories, { ...configured, key: 'chips-large', width: .98, positionY: .05, offset: 0 }, false);
    } else if (key === 'chips') {
      const width = meal ? .46 : shish ? .52 : 1.03;
      if (shish) add(main, { ...configured, width: .40, positionY: .095, offset: .37, step: 0 });
      else add(accessories, { ...configured, width, positionY: 0, offset: meal ? .36 : 0 });
    } else if (key === 'nugget' && !meal) {
      if (!nuggets) add(accessories, tray);
      const [x, y, turn] = nuggetSpots[nuggets++];
      add(accessories, { ...configured, width: .30, offset: x, positionY: y, restingAngle: turn });
    } else if (key === 'nugget') {
      const row = Math.floor(nuggets / 3);
      const col = nuggets % 3;
      const width = meal ? .54 : .285;
      add(accessories, {
        ...configured, width, offset: meal ? -.27 : (col - 1) * .30 + (row % 2) * .035,
        positionY: row * .188, restingAngle: ((nuggets++ * 17) % 29) - 14,
      });
    } else {
      if (key === 'shish') {
        // Served on a plate: grilled chicken on the right, salad beside it.
        const large = product.name.includes('Large')
        if (!main.some(layer => layer.key === 'plate')) {
          main.unshift(plate)
          fixedLayerKeys.push(plate.key)
        }
        add(main, { ...configured, width: large ? .62 : .56, offset: withChips ? .08 : .2, positionY: .07, step: 0 })
        continue
      }
      add(main, hotDog && !meal && openRoll[key] ? { ...configured, ...openRoll[key], step: 0 } : configured);
    }
  }

  // A larger nugget portion adds pieces to the same serving.
  if (optionKeys.has('nuggets-extra-0')) {
    for (let extra = 0; extra < 3; extra++) {
      const [x, y, turn] = nuggetSpots[6 + extra]
      add(accessories, {
        ...componentPhotos.nugget, key: 'nuggets-extra-' + extra, width: .30,
        offset: x, positionY: y, restingAngle: turn,
      }, false)
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
    const placed = shish && shishSaladLayout[layer.key] ? { ...shishSaladLayout[layer.key], step: 0 } :
      shish && layer.sauce ? { offset: withChips ? .05 : .2, positionY: .15, width: .50, path: 'zigzag' } :
      hotDog && !meal && layer.sauce ? { offset: 0, positionY: .105, width: .80, path: 'zigzag' } :
      hotDog && !meal && openRoll[layer.key] ? { ...openRoll[layer.key], step: 0 } :
      shish ? { offset: withChips ? .05 : .2, positionY: .14, width: .40, step: 0 } : {};
    add(main, {
      ...layer, required: false, width: layer.width * scale,
      step: layer.step * scale, offset: layer.offset * scale + mainOffset, ...placed,
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
