const menuAssets = './assets/menu/';

const chickenPositions = [
  [-.23, .48, -16], [-.04, .50, 12], [.15, .49, -11],
  [-.34, .31, 22], [-.14, .31, -24], [.105, .31, 17],
  [-.38, .43, -5], [.27, .41, 28], [.02, .24, -19],
];

const freshSalad = [
  ['lettuce', 'shish-lettuce.webp', .38, .37, .30, 4, 'leaf'],
  ['mixed-cabbage', 'shish-cabbage.webp', .30, .41, .34, -6, 'leaf'],
  ['cucumber', 'shish-cucumber.webp', .24, .32, .35, 12, 'slice'],
  ['tomato', 'shish-tomato.webp', .24, .43, .28, -18, 'tomato'],
  ['onion', 'shish-onion.webp', .18, .41, .39, 9, 'slice'],
  ['long-chilli', 'shish-chilli.webp', .27, .33, .42, -22, 'slice'],
];

function imageLayer(key, file, width, offset, positionY, {
  pose = 0, motion = 'slice', delay, packaging,
} = {}) {
  return {
    key, asset: menuAssets + file, width, offset, positionY, step: 0,
    restingAngle: pose, motion, replayDelay: delay, packaging,
  };
}

export function shishSceneProfile(product, referenceProfile) {
  const large = product.portion === 'large';
  const withChips = product.components.includes('chips');
  const optionKeys = new Set(product.optionGroups.flatMap(group =>
    group.options.flatMap(option => option.layerKeys ?? [])));
  const layers = [];
  const fixedLayerKeys = [];

  function add(layer, fixed = true) {
    layers.push(layer);
    if (fixed) fixedLayerKeys.push(layer.key);
  }

  const boxWidth = 1.62;
  add(imageLayer('shish-box-base', 'shish-box-base.webp', boxWidth, 0, 0, { packaging: 'base' }));
  add(imageLayer('shish-box-lid', 'shish-box-base.webp', boxWidth, 0, 0, { packaging: 'lid' }));
  add(imageLayer('shish-box-closed', 'shish-box-closed.webp', boxWidth, 0, 0, { packaging: 'closed' }), false);
  if (withChips) {
    add(imageLayer('shish-chips', 'shish-chips.webp', .71, -.125, .19, { motion: 'slice', delay: 100 }));
  }
  const portions = chickenPositions.slice(0, large ? 9 : 6)
    .map(([offset, positionY, pose], index) => ({ offset, positionY, pose, index }))
    .sort((a, b) => b.positionY - a.positionY);
  for (const { index, offset, positionY, pose } of portions) {
    const variant = index % 4;
    const file = variant ? 'shish-chicken-' + (variant + 1) + '.webp' : 'shish-chicken.webp';
    add(imageLayer('shish-chicken-' + (index + 1), file, .335, offset, positionY + (withChips ? .018 : 0), {
      pose, motion: 'patty', delay: 260 + index * 70,
    }));
  }
  add(imageLayer('grilled-onion', 'shish-grilled-onion.webp', .185, -.245, .395, { pose: 16, delay: 840 }));
  add(imageLayer('red-pepper', 'shish-red-pepper.webp', .166, -.008, .47, { pose: 15, delay: 945 }));
  add(imageLayer('green-pepper', 'shish-green-pepper.webp', .173, .123, .416, { pose: -12, delay: 1015 }));
  for (const [index, [key, file, width, offset, positionY, pose, motion]] of freshSalad.entries()) {
    add(imageLayer(key, file, width, offset, positionY, {
      pose, motion, delay: 1100 + index * 75,
    }), false);
  }
  const existingLayers = new Set(layers.map(layer => layer.key));
  for (const layer of referenceProfile.layers) {
    if (!optionKeys.has(layer.key) || existingLayers.has(layer.key)) continue;
    if (layer.sauce) {
      add({ ...layer, width: .52, offset: -.14 + layer.offset, positionY: .46 + layer.offset * .7, step: 0,
        trace: 'lengthwise', replayDelay: 1800 }, false);
      continue;
    }
    // Paid extras remain visually distinct on the chicken; pickle stays with the salad.
    const onSalad = layer.key === 'gherkin';
    add({
      ...layer, width: onSalad ? .22 : .32, offset: onSalad ? .40 : -.12,
      positionY: onSalad ? .36 : .45, step: 0, required: false, replayDelay: 1570,
    }, false);
  }
  add({ ...imageLayer('pitta', 'shish-pitta.webp', .52, -.19, .63, { pose: -7, motion: 'bread' }), finishesReplay: true });
  add(imageLayer('shish-box-rim', 'shish-box-rim.webp', boxWidth, 0, 0, { packaging: 'rim' }));

  return {
    name: product.name, visual: 'shish-box', planar: true, fixedLayerKeys, layers,
    packaging: { openDuration: 440, closedKey: 'shish-box-closed' },
    timings: { drop: 248, settle: 71 },
  };
}

const ease = t => t * t * (3 - 2 * t);

export function paintShishPackaging(elapsed, packaging, layers, closed, place) {
  const progress = Math.min(1, elapsed / packaging.openDuration);
  const opening = ease(progress);
  const reveal = ease(Math.min(1, progress * 2.5));
  if (closed) {
    place(closed, { opacity: 1 - reveal, lift: opening * .015 });
  }
  for (const layer of layers) {
    if (layer.packaging === 'lid') {
      place(layer, { opacity: reveal, lidFold: .055 + opening * .945 });
    } else {
      place(layer, { opacity: reveal });
    }
  }
}
