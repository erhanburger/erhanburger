const assetDirectory = './assets/sauces/';
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);

// The photograph's nozzle coordinates are measured from its upper-left corner.
// The finish values describe the deposited sauce as well as the falling stream.
export const sauceProfiles = {
  ketchup: {
    label: 'Ketchup', bottleAsset: assetDirectory + 'ketchup.webp', nozzle: [0.5, 0.988], aspect: 2.80702, width: 0.151,
    colours: ['#62180f', '#b82d19', '#ff9569'], body: 1.04, shine: .56, resistance: .28, spread: .09,
  },
  'burger-sauce': {
    label: 'Burger sauce', bottleAsset: assetDirectory + 'burger-sauce.webp', nozzle: [0.5, 0.988], aspect: 1.63265, width: 0.228,
    colours: ['#84442f', '#d88357', '#ffc6a3'], body: 1.19, shine: .39, resistance: .64, spread: .045,
  },
  mayo: {
    label: 'Mayonnaise', bottleAsset: assetDirectory + 'mayo.webp', nozzle: [0.505, 0.988], aspect: 2.30769, width: 0.183,
    colours: ['#968364', '#dfcfab', '#fff4da'], body: 1.3, shine: .42, resistance: .88, spread: .025,
  },
  'chilli-sauce': {
    label: 'Chilli sauce', bottleAsset: assetDirectory + 'chilli-sauce.webp', nozzle: [0.504, 0.988], aspect: 3.63636, width: 0.12,
    colours: ['#742315', '#d04b24', '#ffb06a'], body: .75, shine: .64, resistance: .06, spread: .15,
  },
  'garlic-mayo': {
    label: 'Garlic mayonnaise', bottleAsset: assetDirectory + 'garlic-mayo.webp', nozzle: [0.496, 0.988], aspect: 1.73913, width: 0.217,
    colours: ['#9d8a62', '#e8d7af', '#fff7de'], body: 1.27, shine: .33, resistance: .82, spread: .035,
  },
  'bbq-sauce': {
    label: 'BBQ sauce', bottleAsset: assetDirectory + 'bbq-sauce.webp', nozzle: [0.498, 0.988], aspect: 1.88976, width: 0.214,
    colours: ['#36170f', '#793924', '#d1875c'], body: .93, shine: .66, resistance: .47, spread: .07,
  },
  mustard: {
    label: 'Mustard', bottleAsset: assetDirectory + 'mustard.webp', nozzle: [0.495, 0.992], aspect: 2.62295, width: 0.152,
    colours: ['#80540f', '#d99b20', '#ffe178'], body: 1.08, shine: .35, resistance: .69, spread: .055,
  },
};

export function preloadSauceBottles(layers) {
  const paths = new Set(layers.flatMap(layer => layer.sauce ? [layer.sauce.bottleAsset] : []));
  for (const path of paths) {
    const image = new Image();
    image.src = path;
  }
}

function surfacePoint(layer, width, progress) {
  if (layer.trace === 'lengthwise') {
    return {
      x: (layer.offset + (progress - .5) * layer.width) * width,
      y: (layer.y + Math.sin(progress * Math.PI * 8) * .023 * layer.width) * width,
    };
  }
  const rotation = .55 + progress * Math.PI * 3.55;
  const radius = .47 - progress * (.403 - layer.sauce.spread * .12);
  return {
    x: (layer.offset + Math.cos(rotation) * radius * layer.width) * width,
    y: (layer.y + (.205 + Math.sin(rotation) * radius * .38) * layer.width) * width,
  };
}

function ribbon(context, points, colour, thickness, offset, canvasSize) {
  context.beginPath();
  for (const sign of [1, -1]) {
    for (let sample = 0; sample < points.length; sample++) {
      const i = sign === 1 ? sample : points.length - 1 - sample;
      const p = points[i];
      const previous = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      const dx = next.x - previous.x;
      const dy = next.y - previous.y;
      const length = Math.hypot(dx, dy) || 1;
      const distance = p.radius * (offset + sign * thickness);
      const x = canvasSize * .5 + p.x - dy / length * distance;
      const y = canvasSize - p.y - dx / length * distance;
      if (sign === 1 && sample === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
  }
  context.closePath();
  context.fillStyle = colour;
  context.fill();
}

function paintSauceRibbon(context, points, profile, canvasSize, alpha) {
  const [shadow, body, light] = profile.colours;
  context.save();
  context.globalAlpha = alpha;
  ribbon(context, points, shadow, 1, 0, canvasSize);
  ribbon(context, points, body, .83, -.11, canvasSize);
  context.globalAlpha *= profile.shine;
  ribbon(context, points, light, .21, -.47, canvasSize);
  context.restore();
}

export function paintSauceTrail(context, layer, progress, alpha, width, canvasSize) {
  if (!context || progress <= 0 || alpha <= 0) return;
  const depositWidth = width * .0117 * layer.sauce.body;
  const points = Array.from({ length: 42 }, (_, index) => {
    const t = progress * index / 41;
    const taper = Math.min(1, .22 + t * 18, .13 + (progress - t) * 27);
    return {
      ...surfacePoint(layer, width, t),
      radius: depositWidth * taper * (1 + .095 * Math.sin(t * 38) + layer.sauce.spread * (1 - t)),
    };
  });
  paintSauceRibbon(context, points, layer.sauce, canvasSize, alpha);
}

export function paintSaucePour({ context, bottle, canvas, traceDepth, layer, elapsed, timings, width, canvasSize, verticalRoom }) {
  const sauce = layer.sauce;
  const time = elapsed - timings.enter;
  const flight = Math.max(1, Math.min(27 + sauce.resistance * 25, timings.pour / 2, timings.exit / 2));
  const effectivePour = timings.pour - flight;
  const flow = ease(clamp((time - flight) / effectivePour));
  const arrival = 1 - ease(clamp(elapsed / timings.enter));
  const departure = ease(clamp((time - timings.pour - flight) / Math.max(1, timings.exit - flight)));
  const travel = arrival + departure;
  const impact = surfacePoint(layer, width, flow);
  const roomAbove = verticalRoom - (layer.y + .28 * layer.width) * width - 10;
  const bottleWidth = Math.max(0, Math.min(width * sauce.width, (roomAbove - width * .06) / sauce.aspect));
  const bottleHeight = bottleWidth * sauce.aspect;
  const gap = Math.max(width * .042, Math.min(width * (.127 + .15 * travel), roomAbove - bottleHeight));
  const pulse = ease(clamp(time / 118)) * (1 - ease(clamp((time - timings.pour + 65) / 124)));
  const squeeze = pulse * (.040 + sauce.resistance * .041) * (1 + .14 * Math.sin(time / 54));
  const tilt = 7 + travel * 23 - pulse * 2;
  const nozzleX = impact.x + (.047 + travel * .23) * width;
  const nozzleY = impact.y + gap;

  const [anchorX, anchorY] = sauce.nozzle;
  if (bottle.dataset.sauce !== layer.key || bottle.getAttribute('src') !== sauce.bottleAsset) {
    bottle.dataset.sauce = layer.key;
    bottle.dataset.nozzle = sauce.nozzle.join(',');
    bottle.style.transformOrigin = `${anchorX * 100}% ${anchorY * 100}%`;
    bottle.src = sauce.bottleAsset;
  }
  bottle.style.setProperty('--width', bottleWidth + 'px');
  bottle.style.transform = `translate3d(${nozzleX - bottleWidth * anchorX}px, ${-nozzleY + bottleHeight * (1 - anchorY)}px, 0) rotate(${tilt}deg) scale(${1 - squeeze}, ${1 + squeeze * .19})`;
  bottle.style.opacity = clamp((1 - travel) * 3);
  bottle.style.visibility = travel < .99 && bottleHeight >= 18 && bottle.complete && bottle.naturalWidth ? 'visible' : 'hidden';

  paintSauceTrail(context, layer, flow, 1, width, canvasSize);
  if (!context || time <= 0 || time >= timings.pour + flight) return;

  // Both endpoints and the deposited ribbon share the same nozzle and impact coordinates.
  canvas.style.zIndex = traceDepth + 2;
  const head = clamp(time / flight);
  const tail = clamp((time - timings.pour) / flight);
  const points = Array.from({ length: 22 }, (_, index) => {
    const t = tail + (head - tail) * index / 21;
    const gravity = t * (.74 + t * .26);
    const thinning = .67 + t * (.34 - sauce.resistance * .24);
    const pressure = .86 + pulse * .14 + .06 * Math.sin(time / 38 - t * 3);
    return {
      x: nozzleX + (impact.x - nozzleX) * t - Math.sin(t * Math.PI) * width * .006,
      y: nozzleY + (impact.y - nozzleY) * gravity,
      radius: width * .008 * sauce.body * thinning * pressure * (1 - tail * .53),
    };
  });
  // Let the narrow strand overlap the nozzle and its contact bead by a pixel.
  points[0].y += tail === 0 ? 1 : 0;
  points.at(-1).y -= head === 1 ? 1 : 0;
  paintSauceRibbon(context, points, sauce, canvasSize, 1);
}
