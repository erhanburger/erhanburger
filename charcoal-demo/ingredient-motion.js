const materials = {
  bread: { fall: 1, settle: 1.53, height: .47, curve: 2, drift: -.038, roll: -6, yaw: 8,
    squash: .055, spread: .008, bounce: .009, weight: .61 },
  crown: { fall: 1.05, settle: 1.64, height: .45, curve: 2, drift: .039, roll: 7, yaw: -9,
    squash: .067, spread: .013, bounce: .011, weight: .68 },
  patty: { fall: .92, settle: 1.55, height: .52, curve: 2.08, drift: .030, roll: 5, yaw: 6,
    squash: .040, spread: .010, bounce: .004, weight: 1 },
  cheese: { fall: 1.19, settle: 1.60, height: .47, curve: 1.83, drift: -.041, roll: -11, yaw: 13,
    squash: .073, spread: .025, bounce: .002, weight: .16, flutter: 3.5, shear: 4.4 },
  leaf: { fall: 1.42, settle: 1.76, height: .56, curve: 1.76, drift: -.056, roll: 7, yaw: 10,
    squash: .071, spread: .020, bounce: .007, weight: .17, flutter: 10, shear: 5.3 },
  tomato: { fall: 1.02, settle: 1.73, height: .50, curve: 1.99, drift: .036, roll: 7, yaw: 9,
    squash: .077, spread: .017, bounce: .017, weight: .51 },
  slice: { fall: 1.13, settle: 1.43, height: .48, curve: 1.90, drift: -.041, roll: -8, yaw: 10,
    squash: .046, spread: .011, bounce: .009, weight: .31, flutter: 2.7, shear: 1.9 },
  egg: { fall: 1.07, settle: 1.65, height: .46, curve: 1.96, drift: .029, roll: 6, yaw: 9,
    squash: .077, spread: .015, bounce: .005, weight: .43, flutter: 1.4, shear: 1.5 },
  // Serving scenes. Plates and trays slide up from below and behind (negative height).
  plate: { fall: .85, settle: 1.15, height: -.05, curve: 1.6, drift: .03, roll: 0, yaw: 0,
    squash: .010, spread: .003, bounce: .002, weight: .9 },
  tray: { fall: .8, settle: 1.0, height: -.065, curve: 1.7, drift: -.04, roll: 0, yaw: 0,
    squash: .022, spread: .006, bounce: .004, weight: .5 },
  // Nuggets tip out a short way, tumble a little and bounce once.
  nugget: { fall: .42, settle: 1.2, height: .22, curve: 1.7, drift: .045, roll: 34, yaw: 0,
    squash: .035, spread: .012, bounce: .022, weight: .3 },
  // A tipped portion of chips: soft settle, no bounce.
  chips: { fall: .8, settle: 1.6, height: .2, curve: 1.9, drift: .012, roll: -7, yaw: 0,
    squash: .05, spread: .02, bounce: 0, weight: .45 },
  salad: { fall: 1.1, settle: 1.7, height: .22, curve: 1.7, drift: -.03, roll: 6, yaw: 8,
    squash: .05, spread: .02, bounce: .003, weight: .12, flutter: 7, shear: 3 },
  grill: { fall: .7, settle: 1.3, height: .3, curve: 2.1, drift: .02, roll: 3, yaw: 4,
    squash: .05, spread: .012, bounce: .004, weight: 1 },
  roll: { fall: .85, settle: 1.5, height: .26, curve: 1.9, drift: -.03, roll: -4, yaw: 6,
    squash: .045, spread: .01, bounce: .006, weight: .6 },
  sausage: { fall: .7, settle: 1.7, height: .26, curve: 2, drift: -.07, roll: 13, yaw: 0,
    squash: .04, spread: .01, bounce: .003, weight: .8 },
  drape: { fall: 1.0, settle: 1.7, height: .2, curve: 1.8, drift: -.03, roll: -6, yaw: 8,
    squash: .07, spread: .02, bounce: 0, weight: .1, flutter: 3, shear: 6 },
  yolk: { fall: 1.0, settle: 1.8, height: .2, curve: 1.9, drift: .02, roll: 4, yaw: 5,
    squash: .09, spread: .02, bounce: 0, weight: .25, flutter: 1, shear: 1.5 },
};

const ingredientMaterials = {
  bottom: 'bread',
  'patty-a': 'patty',
  'patty-b': 'patty',
  cheese: 'cheese',
  'extra-cheese': 'cheese',
  halloumi: 'tomato',
  egg: 'egg',
  lettuce: 'leaf',
  tomato: 'tomato',
};

const clamp = value => Math.max(0, Math.min(1, value));
const ease = t => t * t * (3 - 2 * t);
const arc = t => 4 * t * (1 - t);

export function ingredientTiming(layer, timings, closingKey) {
  const kind = layer.motion ?? (layer.key === closingKey ? 'crown' : ingredientMaterials[layer.key]);
  const material = materials[kind] ?? materials.slice;
  const fall = Math.round(timings.drop * material.fall);
  const settle = Math.round(timings.settle * material.settle);
  return { material, fall, settle, duration: fall + settle, flip: layer.key === 'patty-a' || (kind === 'nugget' && layer.restingAngle < 0) ? -1 : 1 };
}

export function ingredientPose(timing, elapsed, start) {
  const { material, fall, settle, duration, flip } = timing;
  if (elapsed < 0 || elapsed >= duration) return null;
  const t = clamp(elapsed / fall);
  const travel = t ** material.curve;
  const impact = clamp((elapsed - fall) / settle);
  const compression = arc(clamp(impact / .42));
  const release = arc(clamp((impact - .20) / .80)) * (1 - impact * .45);
  const airborne = 1 - travel;
  const flutter = Math.sin(t * Math.PI * 2.8) * arc(t) * (material.flutter ?? 0);
  const softWrap = (material.shear ?? 0) * (
    Math.sin(t * Math.PI * 2) * arc(t) * .55 + compression * .35 - release * .18
  );

  return {
    lift: (start?.lift ?? material.height) * airborne + release * material.bounce,
    move: (start?.move ?? material.drift * flip) * (1 - ease(t)) + flutter * .0017,
    angle: (start?.angle ?? material.roll * flip) * airborne + flutter - material.roll * release * .14,
    yaw: (start?.yaw ?? material.yaw * flip) * airborne + flutter * .85,
    skew: softWrap,
    squash: 1 - compression * material.squash,
    spread: 1 + compression * material.spread,
    opacity: start ? 1 : ease(clamp(elapsed / Math.min(66, fall * .26))),
    pressure: compression * material.weight,
    shadow: (1 - impact) * (1 - Math.max(0, airborne - .18) * .72),
  };
}
