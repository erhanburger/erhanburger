import * as T from './vendor/three-burger.js';

const TAU = Math.PI * 2;

function random(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function grain(x, y, z) {
  const a = Math.floor(x), b = Math.floor(y), c = Math.floor(z);
  const smooth = t => t * t * (3 - 2 * t);
  const u = smooth(x - a), v = smooth(y - b), w = smooth(z - c);
  const hash = (i, j, k) => {
    const n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 982451653);
    return (Math.imul(n ^ (n >>> 13), 1274126177) >>> 0) / 4294967296;
  };
  const lerp = T.MathUtils.lerp;
  const layer = k => lerp(lerp(hash(a, b, k), hash(a + 1, b, k), u),
    lerp(hash(a, b + 1, k), hash(a + 1, b + 1, k), u), v);
  return lerp(layer(c), layer(c + 1), w) * 2 - 1;
}

function noise(x, y) {
  return Math.sin(x * 1.17 + Math.cos(y * 1.7)) * Math.cos(y * 0.87 + x * 0.48);
}

const materials = {
  crust: [0.52, 0.020],
  crumb: [0.86, 0.033],
  beef: [0.74, 0.11],
  chicken: [0.78, 0.10],
  veggie: [0.79, 0.087],
  cheese: [0.45, 0.009],
  lettuce: [0.54, 0.028],
  tomato: [0.42, 0.017],
  cucumber: [0.48, 0.019],
  pickle: [0.44, 0.020],
  onion: [0.43, 0.014],
  egg: [0.46, 0.017],
  halloumi: [0.61, 0.047],
  sauce: [0.33, 0.011],
};

function makeSurfaceMaterials() {
  const size = 256;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = size;
  const context = textureCanvas.getContext('2d');
  const pixels = context.createImageData(size, size);
  const next = random(591);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = 4 * (x + y * size);
      const tone = 156 + grain(x * .31, y * .31, 9) * 36 + (next() - 0.5) * 54;
      pixels.data.set([tone, tone, tone, 255], i);
    }
  }
  context.putImageData(pixels, 0, 0);
  const bumpMap = new T.CanvasTexture(textureCanvas);
  bumpMap.wrapS = bumpMap.wrapT = T.RepeatWrapping;
  bumpMap.repeat.set(4, 2);
  bumpMap.anisotropy = 4;
  return Object.fromEntries(Object.entries(materials).map(([name, [roughness, bumpScale]]) => [
    name, new T.MeshStandardMaterial({
      vertexColors: true, bumpMap, bumpScale, roughness, side: T.DoubleSide,
    }),
  ]));
}

function palette(...colors) {
  return colors.map(color => new T.Color(color));
}

function tint(colors, amount, target) {
  const index = T.MathUtils.clamp(amount, 0, 1) * (colors.length - 1);
  const start = Math.floor(index);
  return target.copy(colors[start]).lerp(colors[Math.min(start + 1, colors.length - 1)], index - start);
}

// The same tessellator is used for circular cross-sections and irregular sheets.
function surface(group, material, width, height, sample) {
  const positions = [], colors = [], uv = [], indices = [];
  const color = new T.Color();
  for (let j = 0; j <= height; j++) {
    for (let i = 0; i <= width; i++) {
      const u = i / width, v = j / height;
      positions.push(...sample(u, v, color));
      colors.push(color.r, color.g, color.b);
      uv.push(u, v);
      if (i < width && j < height) {
        const a = i + j * (width + 1), b = a + width + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new T.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function round(group, material, profile, colors, irregularity, shade, rows = 36) {
  return surface(group, material, 112, rows, (u, v, color) => {
    const a = u * TAU, f = v * (profile.length - 1), i = Math.floor(f);
    const [r1, y1] = profile[i], [r2, y2] = profile[Math.min(i + 1, profile.length - 1)];
    const r = T.MathUtils.lerp(r1, r2, f - i);
    const y = T.MathUtils.lerp(y1, y2, f - i);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const ripple = r * irregularity * (noise(x * 10, z * 10 + y * 14) + 0.32 * noise(x * 34 + y * 18, z * 34));
    tint(colors, shade(x, y, z, r, a), color);
    return [x + Math.cos(a) * ripple, y + ripple * 0.28, z + Math.sin(a) * ripple];
  });
}

const breadColors = palette(0x632708, 0xad5014, 0xcf7422, 0xe99a39, 0xffc167);
const crumbColors = palette(0xa7692f, 0xe3a958, 0xffdb9b, 0xffebba);
const crustShade = (x, y, z) => 0.58 + 0.25 * grain(x * 5, y * 7, z * 5) + 0.13 * grain(x * 66, y * 58, z * 62);

function bun(group, m, crown) {
  if (!crown) {
    round(group, m.crust, [[0, 0], [.88, 0], [1.06, .045], [1.16, .12], [1.19, .22], [1.16, .31]],
      breadColors, .012, (x, y, z) => crustShade(x, y, z) + y * .42);
    round(group, m.crumb, [[1.16, .31], [1.1, .35], [0, .35]],
      crumbColors, .014, (x, y, z) => .68 + .31 * noise(x * 86, z * 79 + y * 88));
    return;
  }

  const crownHeight = .65, radius = 1.21;
  const profile = [[0, .025], [.85, 0], [1.13, .015], [radius, .065]];
  for (let i = 0; i <= 16; i++) {
    const angle = (i / 16) * Math.PI / 2;
    profile.push([radius * Math.cos(angle), .11 + crownHeight * Math.sin(angle)]);
  }
  round(group, m.crust, profile, breadColors, .013,
    (x, y, z) => crustShade(x, y, z) + .24 * Math.exp(-y * 12) - .20 * y);
  const seeds = new T.InstancedMesh(new T.SphereGeometry(1, 9, 7),
    new T.MeshStandardMaterial({ color: 0xffe0a8, roughness: .55 }), 92);
  const next = random(29031);
  const seed = new T.Object3D();
  const color = new T.Color();
  for (let i = 0; i < seeds.count; i++) {
    const a = next() * TAU;
    const r = Math.sqrt(next()) * .93 + .04;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    seed.position.set(x, .109 + crownHeight * Math.sqrt(1 - (r / radius) ** 2), z);
    seed.rotation.set(0, 0, 0);
    seed.lookAt(x * 1.6, seed.position.y + .91, z * 1.6);
    seed.rotateX(Math.PI / 2);
    seed.rotateY(next() * TAU);
    seed.scale.set(.027 + next() * .014, .008 + next() * .004, .013 + next() * .004);
    seed.updateMatrix();
    seeds.setMatrixAt(i, seed.matrix);
    seeds.setColorAt(i, color.setRGB(.82 + next() * .18, .69 + next() * .29, .46 + next() * .48));
  }
  seeds.castShadow = true;
  seeds.receiveShadow = true;
  group.add(seeds);
}

const pattyStyles = {
  beef: [palette(0x201009, 0x381a10, 0x62351f, 0x8d5131, 0xb57848), .25],
  chicken: [palette(0x59270b, 0x9d4c14, 0xdd8e39, 0xf3bc68), .29],
  veggie: [palette(0x3f2a0c, 0x725023, 0xab8142, 0xe1bd64), .25],
};

function patty(group, m, kind) {
  const [colors, h] = pattyStyles[kind];
  round(group, m[kind], [[0, .025], [.88, .012], [1.09, .05], [1.15, .10], [1.16, h - .077],
    [1.11, h - .027], [.92, h], [0, h - .01]], colors, .058, (x, y, z) => {
    const sear = Math.max(0, Math.sin(x * 17 + z * 4 + noise(x * 8, z * 9)) - .66);
    return .50 + .38 * grain(x * 38, y * 54, z * 41) + .20 * grain(x * 12, y * 19, z * 13) - sear * .55;
  }, 60);

  const next = random(4519);
  const crumbs = new T.InstancedMesh(new T.IcosahedronGeometry(1, 0),
    new T.MeshStandardMaterial({ roughness: .83 }), 380);
  const crumb = new T.Object3D();
  const color = new T.Color();
  for (let i = 0; i < crumbs.count; i++) {
    const a = next() * TAU, y = .053 + next() * (h - .094);
    const x = Math.cos(a) * 1.135, z = Math.sin(a) * 1.135;
    const r = 1.137 + .050 * (noise(x * 10, z * 10 + y * 14) + .32 * noise(x * 34 + y * 18, z * 34));
    const scale = .011 + next() ** 2 * .037;
    crumb.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    crumb.rotation.set(next() * 3, next() * 3, next() * 3);
    crumb.scale.set(scale * 1.17, scale * .78, scale);
    crumb.updateMatrix();
    crumbs.setMatrixAt(i, crumb.matrix);
    crumbs.setColorAt(i, tint(colors, .14 + next() * .65, color));
  }
  group.add(crumbs);
}

const cheeseColors = palette(0xc0750b, 0xe69b18, 0xf7b927, 0xffcf54);

function cheese(group, material) {
  surface(group, material, 42, 42, (u, v, color) => {
    const x = (u - .5) * 2.04, z = (v - .5) * 2.04;
    const r = Math.hypot(x, z);
    const drape = Math.max(0, r - .94) * (.39 + .09 * Math.cos(x * 8 + z * 7));
    tint(cheeseColors, .62 + .12 * noise(x * 5, z * 5) - drape * .8, color);
    return [x + .013 * Math.sin(z * 11), .048 - drape + .011 * noise(x * 5, z * 6), z];
  });
  group.rotation.y = .31;
}

const leafColors = palette(0x193f12, 0x356d1c, 0x689b2c, 0xa4c34a, 0xd4d77a);

function lettuce(group, material) {
  for (let leaf = 0; leaf < 3; leaf++) {
    surface(group, material, 144, 32, (u, v, color) => {
      const a = u * TAU, phase = leaf * 2.35;
      const lobes = .13 * Math.sin(5 * a + phase) + .037 * Math.sin(19 * a - phase) + .03 * Math.sin(33 * a + phase);
      const r = v * (1.19 + lobes + .06 * Math.sin(3 * a - phase));
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const curl = v ** 2 * (.062 * Math.cos(a * 11 + phase) + .045 * Math.sin(a * 24 + leaf));
      const veins = Math.max(0, Math.cos(a * 12 + Math.sin(v * 12 + a * 6) * .55)) ** 14;
      const fine = grain(x * 37, leaf * .91, z * 40);
      tint(leafColors, .39 + .15 * fine + .20 * v + veins * (.24 - .14 * v) + .08 * noise(x * 7, z * 7), color);
      return [x, .032 + leaf * .045 + curl + .022 * noise(x * 18, z * 18) + veins * .012, z];
    });
  }
}

const produce = {
  tomato: { radius: .59, thickness: .13, colors: palette(0x8e190c, 0xc93417, 0xed4b2d, 0xff9571, 0xffc47c) },
  cucumber: { radius: .42, thickness: .095, colors: palette(0x1e461c, 0x4e7727, 0xa5be62, 0xe5e6a9) },
  pickle: { radius: .39, thickness: .079, colors: palette(0x465017, 0x73802b, 0xa5aa48, 0xc7c774) },
};

function slices(group, material, kind) {
  const { radius: r, thickness: h, colors } = produce[kind];
  const count = kind === 'tomato' ? 3 : 5;
  for (let i = 0; i < count; i++) {
    const piece = new T.Group();
    const angle = .4 + i * TAU / count;
    piece.position.set(Math.cos(angle) * (1.16 - r), (i % 2) * .02, Math.sin(angle) * (1.16 - r));
    piece.rotation.z = (i - 1) * .045;
    group.add(piece);
    round(piece, material, [[0, 0], [r * .86, 0], [r, .025], [r, h - .017], [r * .94, h], [r * .80, h + .006], [0, h + .006]],
      colors, .024, (x, y, z, rad, a) => {
        const edge = rad > r * .92, jitter = noise(x * 66, z * 72 + y * 63);
        if (edge) return (kind === 'tomato' ? .46 : .19) + .13 * jitter;
        const chambers = Math.cos(a * (kind === 'tomato' ? 6 : 11) + rad * 7);
        const seeds = Math.max(0, jitter - .38) * .44;
        return .59 + .13 * chambers + seeds + .09 * noise(x * 17, z * 17);
      }, 24);
  }
}

const onionColors = palette(0x70304f, 0xaa648c, 0xd6a6c1, 0xf0d7df);

function onion(group, material) {
  for (let i = 0; i < 4; i++) {
    const piece = new T.Group();
    const angle = i * 2.45;
    piece.position.set(Math.cos(angle) * .55, i * .017, Math.sin(angle) * .55);
    piece.rotation.z = Math.sin(angle) * .1;
    group.add(piece);
    const r = .60 - i * .069;
    round(piece, material, [[r - .063, .027], [r - .055, .055], [r, .054], [r + .014, .033], [r, .01], [r - .055, .01], [r - .063, .027]],
      onionColors, .031, (x, y, z, rad) => .42 + .30 * Math.cos(rad * 165) ** 2 + .10 * noise(x * 19, z * 19), 18);
  }
}

const eggWhite = palette(0xb47a42, 0xe8be7a, 0xffeaca, 0xfff6e2);
const yolk = palette(0xe57506, 0xf3a518, 0xffca37);

function egg(group, material) {
  round(group, material, [[0, .022], [.87, .01], [1.10, .025], [1.14, .062], [1.03, .12], [.72, .14], [0, .14]],
    eggWhite, .095, (x, y, z, r) => .81 - Math.max(0, r - .9) * 1.5 + .15 * noise(x * 19, z * 19));
  const center = new T.Group();
  center.position.set(.29, .10, -.08);
  round(center, material, [[0, .016], [.34, .03], [.35, .074], [.28, .15], [.16, .19], [0, .20]],
    yolk, .024, (x, y, z) => .57 + .12 * noise(x * 8, z * 8));
  group.add(center);
}

const halloumiColors = palette(0x633112, 0xa45c25, 0xe4b77a, 0xffe4aa, 0xfff1cc);

function halloumi(group, material) {
  const slice = round(group, material, [[0, 0], [.75, 0], [.98, .026], [1.05, .07], [1.03, .16],
    [.95, .203], [.7, .219], [0, .219]], halloumiColors, .042, (x, y, z) => {
    const grill = Math.max(0, Math.cos(x * 20 + z * 5) - .64);
    return .82 - grill * 1.22 + .15 * noise(x * 22 + y * 26, z * 26);
  });
  slice.scale.z = .61;
  group.rotation.y = .6;
}

export const sauceColors = {
  'Chilli Sauce': 0xb92e15, 'Garlic Mayo': 0xffe8bd, 'Burger Sauce': 0xd97c49,
  'BBQ Sauce': 0x682715, Ketchup: 0xd92615, Mayo: 0xffefcc, Mustard: 0xe4a519,
};

export const sauceSegments = 120;
const sauceSides = 10;
export const sauceIndicesPerSegment = sauceSides * 6;

export function saucePoint(angle, index, target) {
  const radius = .83 + .17 * Math.sin(angle * 4 + .2) + .065 * Math.cos(angle * 7);
  return target.set(radius * Math.cos(angle), .027 + index * .017, radius * Math.sin(angle));
}

function sauce(group, material, names) {
  const colors = names.map(name => sauceColors[name]).filter(Boolean);
  const point = new T.Vector3();
  colors.forEach((base, index) => {
    const tones = palette(new T.Color(base).multiplyScalar(.52), base, new T.Color(base).lerp(new T.Color(0xffe3ad), .24));
    const line = new T.Group();
    line.rotation.y = index * 1.35;
    line.position.y = index * .017;
    group.add(line);
    const mesh = surface(line, material, sauceSegments, sauceSides, (u, v, color) => {
      const a = u * TAU, b = v * TAU;
      saucePoint(a, 0, point);
      const thickness = .036 + .012 * Math.sin(a * 9 + index);
      const radial = Math.cos(b) * thickness;
      tint(tones, .65 + .11 * Math.sin(a * 13), color);
      return [point.x + radial * Math.cos(a), point.y + Math.sin(b) * thickness, point.z + radial * Math.sin(a)];
    });
    // Put all faces for each successive cross-section together for the pour reveal.
    const grid = mesh.geometry.index.array;
    const ordered = [];
    for (let segment = 0; segment < sauceSegments; segment++) {
      for (let row = 0; row < sauceSides; row++) {
        const offset = (row * sauceSegments + segment) * 6;
        ordered.push(...grid.subarray(offset, offset + 6));
      }
    }
    mesh.geometry.setIndex(ordered);
  });
}

export function createBurgerModels() {
  const m = makeSurfaceMaterials();
  const factories = {
    bun: group => bun(group, m, false),
    top: group => bun(group, m, true),
    beef: group => patty(group, m, 'beef'),
    chicken: group => patty(group, m, 'chicken'),
    veggie: group => patty(group, m, 'veggie'),
    cheese: group => cheese(group, m.cheese),
    lettuce: group => lettuce(group, m.lettuce),
    tomato: group => slices(group, m.tomato, 'tomato'),
    cucumber: group => slices(group, m.cucumber, 'cucumber'),
    pickle: group => slices(group, m.pickle, 'pickle'),
    onion: group => onion(group, m.onion),
    egg: group => egg(group, m.egg),
    halloumi: group => halloumi(group, m.halloumi),
    sauce: (group, names) => sauce(group, m.sauce, names),
  };
  const cache = new Map();
  return function model(type, sauces) {
    // Only fixed ingredient prototypes are cached. Sauce combinations change with each order.
    const cached = type !== 'sauce' && cache.get(type);
    if (cached) return cached.clone();
    const group = new T.Group();
    group.name = type;
    factories[type](group, sauces);
    if (type === 'sauce') return group;
    cache.set(type, group);
    return group.clone();
  };
}
