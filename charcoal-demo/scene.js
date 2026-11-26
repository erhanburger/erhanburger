'use strict';

export const CharcoalScene = (() => {
  // Width, stacking step and offset are fractions of the rig width.
  const approvedKetchup = {
    label: 'Ketchup',
    surfaceLift: .126,
    traceColours: ['#9b1c08', '#d63f19', '#ffb076ac'],
    flowColours: ['#b51c0b', '#ff944c9c'],
  };
  const assets = '../burger-builder-demo/assets/';
  const genericSauces = [
    { key: 'chilli-sauce', label: 'Chilli sauce', colours: ['#912c13', '#cf4922', '#f89a5f'] },
    { key: 'garlic-mayo', label: 'Garlic mayonnaise', colours: ['#aa9878', '#eadcb9', '#fff5df'] },
    { key: 'bbq-sauce', label: 'BBQ sauce', colours: ['#432316', '#773b26', '#ad7057'] },
    { key: 'mustard', label: 'Mustard', colours: ['#966215', '#d89b25', '#f4cc65'] },
  ];
  const defaultProfile = {
    id: 'half-pounder',
    closingLayerKey: 'top',
    name: 'Half Pounder with Cheese',
    layers: [
      { key: 'bottom', width: .95, step: .141, offset: -.013, required: true },
      { key: 'patty-a', width: .98, step: .126, offset: .007, required: true },
      { key: 'patty-b', width: .96, step: .108, offset: -.014 },
      { key: 'cheese', width: .97, step: .032, offset: .004 },
      { key: 'extra-cheese', embeddedKey: 'cheese', width: .955, step: .034, offset: -.012 },
      { key: 'halloumi', asset: './assets/halloumi.webp', width: .87, step: .068, offset: -.011 },
      { key: 'egg', asset: './assets/egg.webp', width: .89, step: .048, offset: .012 },
      { key: 'lettuce', width: 1.05, step: .048, offset: -.002 },
      { key: 'tomato', width: .91, step: .068, offset: .017 },
      { key: 'cucumber', asset: assets + 'cucumber.webp', width: .91, step: .035, offset: -.012 },
      { key: 'gherkin', asset: assets + 'pickle.webp', width: .88, step: .033, offset: .014 },
      { key: 'onion', asset: assets + 'onion.webp', width: .90, step: .036, offset: .018 },
      { key: 'ketchup', embeddedKey: 'sauce', width: .67, step: .005, offset: .013, sauce: approvedKetchup },
      { key: 'mayo', asset: assets + 'mayo.webp', width: .61, step: .005, offset: -.014, sauce: {
        label: 'Mayonnaise', traceColours: ['#bca482', '#e9d5a8', '#fff2d8bd'], flowColours: ['#e1caa1', '#ffefdaca'],
      } },
      { key: 'burger-sauce', asset: assets + 'burger-sauce.webp', width: .60, step: .005, offset: .018, sauce: {
        label: 'Burger sauce', traceColours: ['#a66743', '#df975f', '#f9c8a991'], flowColours: ['#d98b55', '#ffd3adad'],
      } },
      ...genericSauces.map(({ key, label, colours }) => ({
        key, width: .61, step: .005, offset: .01, sauce: {
          label, traceColours: colours, flowColours: colours.slice(1), generic: true,
        },
      })),
      { key: 'top', width: .98, step: 0, offset: .003, required: true },
    ],
  };

  const defaultTimings = { drop: 285, settle: 95, enter: 240, pour: 650, exit: 215 };
  let timings = defaultTimings;
  let fallDuration = defaultTimings.drop + defaultTimings.settle;
  let pourDuration = defaultTimings.enter + defaultTimings.pour + defaultTimings.exit;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const rig = document.querySelector('#rig');
  const stage = document.querySelector('#stage');
  const status = document.querySelector('#status');
  const bottle = document.querySelector('#bottle');
  const canvas = document.querySelector('#stream');
  const context = canvas.getContext('2d');
  const embedded = new Map([...rig.querySelectorAll('[data-layer]')].map(image =>
    [image.dataset.layer, { image, url: image.getAttribute('src') }],
  ));
  const elements = new Map();
  const generated = new Set();
  let photo;

  let profile = defaultProfile;
  let selection = new Set();
  let width = 0;
  let canvasSize = 0;
  let verticalRoom = 0;
  let traceDepth = 0;
  let current = [];
  let sequence;
  let frame = 0;

  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);

  function setStatus(phase, label) {
    stage.dataset.phase = phase;
    if (status.textContent !== label) status.textContent = label;
  }

  function mountLayers() {
    for (const image of elements.values()) image.style.visibility = 'hidden';
    for (const image of generated) image.remove();
    generated.clear();
    elements.clear();
    const claimed = new Set();
    profile.layers?.forEach((layer, index) => {
      if (layer.sauce?.generic) return;
      const existing = embedded.get(layer.embeddedKey ?? layer.key);
      const reuse = existing && !claimed.has(existing.image);
      const image = reuse ? existing.image : document.createElement('img');
      const url = layer.asset ?? existing?.url;
      if (url && image.getAttribute('src') !== url) image.src = url;
      image.alt = '';
      image.draggable = false;
      image.dataset.layer = layer.key;
      image.classList.add('ingredient');
      image.classList.toggle('sauce', Boolean(layer.sauce));
      image.style.zIndex = (index + 1) * 2;
      if (reuse) claimed.add(image);
      else {
        rig.append(image);
        generated.add(image);
      }
      elements.set(layer.key, image);
    });
    const closingIndex = profile.layers?.findIndex(({ key }) => key === profile.closingLayerKey) ?? -1;
    const canvasIndex = closingIndex < 0 ? (profile.layers?.length ?? 0) : closingIndex;
    traceDepth = (canvasIndex + 1) * 2 - 1;
    bottle.style.zIndex = ((profile.layers?.length ?? 0) + 1) * 2;
  }

  function layout() {
    let height = 0;
    const layers = (profile.layers ?? []).filter(({ key, required }) => required || selection.has(key));
    const multipleSauces = layers.filter(layer => layer.sauce).length > 1;
    return layers.map(layer => {
      const surface = layer.sauce ? (layer.sauce.surfaceLift ?? .126) - (multipleSauces ? .04 : 0) : 0;
      const y = height + surface;
      height += layer.step;
      return { ...layer, y };
    });
  }

  function setStackHeight(plan) {
    const closing = plan.find(layer => layer.key === profile.closingLayerKey);
    const tall = Boolean(closing && closing.y >= .685);
    if (tall === stage.hasAttribute('data-tall')) return;
    if (tall) stage.dataset.tall = 'true';
    else stage.removeAttribute('data-tall');
    measure();
  }

  function place(layer, { lift = 0, move = 0, angle = 0, squash = 1, yaw = 0, opacity = 1 } = {}) {
    if (layer.sauce?.generic) {
      paintTrail({ ...layer, y: layer.y + lift, offset: layer.offset + move }, 1, opacity);
      return;
    }
    const image = elements.get(layer.key);
    image.style.visibility = opacity > 0 ? 'visible' : 'hidden';
    image.style.opacity = opacity;
    image.style.setProperty('--width', `${layer.width * 100}%`);
    image.style.transform =
      `translate3d(calc(-50% + ${(layer.offset + move) * width}px), ${-(layer.y + lift) * width}px, 0) rotate(${angle}deg) rotateY(${yaw}deg) scaleY(${squash})`;
  }

  function hide(key) {
    const image = elements.get(key);
    if (image) image.style.visibility = 'hidden';
  }

  function getSaucePoint(layer, progress) {
    const rotation = .35 + progress * Math.PI * 4.05;
    const radius = .48 - progress * .426;
    return {
      x: (layer.offset + Math.cos(rotation) * radius * layer.width) * width,
      y: (layer.y + (.22 + Math.sin(rotation) * radius * .39) * layer.width) * width,
    };
  }

  function resetDispenser() {
    bottle.style.visibility = 'hidden';
    canvas.style.zIndex = traceDepth;
    context?.clearRect(0, 0, canvasSize, canvasSize);
  }

  function trace(points, color, lineWidth, shine = 0) {
    context.beginPath();
    points.forEach((point, index) => {
      const x = canvasSize * .5 + point.x;
      const y = canvasSize - point.y - shine;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  }

  function paintTrail(layer, progress, opacity) {
    if (!context || progress <= 0 || opacity <= 0) return;
    const [shadow, colour, shine] = layer.sauce.traceColours ?? approvedKetchup.traceColours;
    const points = Array.from({ length: 38 }, (_, index) => getSaucePoint(layer, progress * index / 37));
    context.globalAlpha = opacity;
    trace(points, shadow, width * .023);
    trace(points, colour, width * .016);
    trace(points, shine, width * .004, width * .003);
    context.globalAlpha = 1;
  }

  function drawSauce(layer, elapsed) {
    const flow = clamp((elapsed - timings.enter) / timings.pour);
    const arrival = 1 - ease(clamp(elapsed / timings.enter));
    const departure = ease(clamp((elapsed - timings.enter - timings.pour) / timings.exit));
    const travel = arrival + departure;
    const impact = getSaucePoint(layer, flow);
    const aspect = bottle.naturalWidth ? bottle.naturalHeight / bottle.naturalWidth : 1.6;
    const roomAboveSauce = verticalRoom - impact.y - 7;
    const bottleWidth = Math.max(width * .108, Math.min(width * .188, (roomAboveSauce - width * .055) / aspect));
    const bottleHeight = bottleWidth * aspect;
    const gap = Math.max(width * .048, Math.min(width * (.145 + .17 * travel), roomAboveSauce - bottleHeight));
    const nozzle = {
      x: impact.x + (.015 + .205 * travel) * width,
      y: impact.y + gap,
    };

    bottle.style.setProperty('--width', `${bottleWidth}px`);
    bottle.style.visibility = travel < .99 ? 'visible' : 'hidden';
    // The nozzle tip in the approved bottle image is at (7.8%, 99.4%).
    bottle.style.transform = `translate3d(${nozzle.x - bottleWidth * .078}px, ${-nozzle.y + bottleHeight * .006}px, 0)`;
    bottle.style.opacity = clamp((1 - travel) * 3);

    if (layer.sauce.generic) {
      paintTrail(layer, flow, 1);
    } else {
      const imprint = ease(clamp((flow - .82) / .18));
      place(layer, { opacity: context ? imprint : flow });
      paintTrail(layer, flow, 1 - imprint);
    }
    if (!context || flow <= 0 || flow >= 1) return;

    // The lifted bun sits behind the bottle and stream while they cross its open edge.
    canvas.style.zIndex = traceDepth + 2;
    const line = Array.from({ length: 10 }, (_, index) => {
      const t = index / 9;
      return {
        x: nozzle.x + (impact.x - nozzle.x) * t - Math.sin(t * Math.PI) * width * .008,
        y: nozzle.y + (impact.y - nozzle.y) * (t * .7 + t * t * .3),
      };
    });
    const [flowColour, flowShine] = layer.sauce.flowColours ?? approvedKetchup.flowColours;
    trace(line, flowColour, Math.max(1.5, width * .0105));
    trace(line, flowShine, Math.max(.5, width * .003), width * .001);
  }

  function measure() {
    width = rig.clientWidth;
    verticalRoom = rig.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
    canvasSize = width * 1.55;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvasSize * scale);
    canvas.height = Math.round(canvasSize * scale);
    context?.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function showRest(next) {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    sequence = undefined;
    current = next;
    resetDispenser();
    for (const key of elements.keys()) hide(key);
    next.forEach(layer => place(layer));
    setStatus('ready', 'Ready');
  }

  function drop(layer, elapsed) {
    if (elapsed < 0) {
      hide(layer.key);
      return;
    }
    const fall = clamp(elapsed / timings.drop);
    const settle = clamp((elapsed - timings.drop) / timings.settle);
    const impact = fall === 1 ? Math.sin(Math.PI * settle) : 0;
    const initialLift = layer.key === profile.closingLayerKey ? .39 : .44;
    place(layer, {
      lift: initialLift * (1 - fall * fall) + impact * .012,
      move: (1 - ease(fall)) * (layer.key === 'patty-b' ? .044 : -.038),
      angle: (1 - ease(fall)) * (layer.key === 'patty-b' ? 8 : -7),
      squash: 1 - .03 * impact,
      opacity: ease(clamp(elapsed / 90)),
    });
  }

  function paintSauce(layer, elapsed) {
    if (elapsed < 0) hide(layer.key);
    else if (elapsed < pourDuration) drawSauce(layer, elapsed);
    else place(layer);
  }

  function updateStatusForPour(label, fallback) {
    if (label) setStatus('saucing', `Adding ${label.startsWith('BBQ') ? label : label.toLowerCase()}…`);
    else setStatus('assembling', fallback);
  }

  function paintReplay(elapsed, plan) {
    resetDispenser();
    let pouring;
    for (const { layer, start } of plan) {
      const time = elapsed - start;
      if (!layer.sauce) drop(layer, time);
      else {
        paintSauce(layer, time);
        if (time >= 0 && time < pourDuration) pouring = layer.sauce.label;
      }
    }
    updateStatusForPour(pouring, 'Building your burger…');
  }

  function paintChange(elapsed, plan) {
    resetDispenser();
    const { next, previousByKey, removed, additions, duration, clearanceKeys, hasSauce } = plan;
    const opening = ease(clamp(elapsed / 210));
    const closing = ease(clamp((elapsed - (duration - 260)) / 260));
    const capLift = (opening - closing) * (hasSauce ? .43 : .31);
    const movement = ease(clamp((elapsed - 135) / 420));
    let pouring;

    for (const layer of next) {
      const old = previousByKey.get(layer.key);
      const scheduled = additions.get(layer.key);
      if (scheduled !== undefined) {
        if (!layer.sauce) drop(layer, elapsed - scheduled);
        else {
          const local = elapsed - scheduled;
          paintSauce(layer, local);
          if (local >= 0 && local < pourDuration) pouring = layer.sauce.label;
        }
        continue;
      }
      const y = old.y + (layer.y - old.y) * movement;
      if (layer.key === profile.closingLayerKey) {
        const image = elements.get(layer.key);
        const aspect = image.naturalWidth ? image.naturalHeight / image.naturalWidth : .56;
        const margin = width > 0 ? (verticalRoom - 9) / width - y - layer.width * aspect : 0;
        const lift = Math.min(capLift, Math.max(0, margin - capLift * .07));
        place({ ...layer, y }, { lift, move: -capLift * .78, angle: -capLift * 9, yaw: -capLift * 76 });
      } else if (clearanceKeys.has(layer.key)) {
        const lift = opening * (1 - ease(clamp((elapsed - 410) / 170)));
        place({ ...layer, y }, { lift: lift * .09, move: lift * .20, angle: lift * 6 });
      } else {
        place({ ...layer, y });
      }
    }
    for (const layer of removed) {
      const exit = ease(clamp((elapsed - 110) / 240));
      place(layer, { lift: exit * .12, move: -exit * .31, angle: -exit * 9, opacity: 1 - exit });
    }
    updateStatusForPour(pouring, 'Adjusting your burger…');
  }

  function advance(now) {
    frame = 0;
    if (!sequence) return;
    sequence.start ??= now;
    const elapsed = now - sequence.start;
    if (elapsed >= sequence.duration || reducedMotion.matches) {
      showRest(sequence.next);
      return;
    }
    sequence.draw(elapsed);
    frame = requestAnimationFrame(advance);
  }

  function startSequence(next, duration, draw) {
    sequence = { next, duration, draw };
    sequence.draw(0);
    frame = requestAnimationFrame(advance);
  }

  function replay() {
    const next = layout();
    setStackHeight(next);
    showRest(reducedMotion.matches ? next : []);
    if (reducedMotion.matches || !next.length) return;

    let start = 0;
    const plan = next.map(layer => {
      const entry = { layer, start };
      // Leave a short beat after each landing and before the bun closes.
      start += layer.sauce ? pourDuration + 90 : fallDuration - 65;
      return entry;
    });
    startSequence(next, start + 105, elapsed => paintReplay(elapsed, plan));
  }

  function update(nextSelection) {
    selection = new Set(nextSelection);
    const previous = sequence?.next ?? current;
    const next = layout();
    const previousByKey = new Map(previous.map(layer => [layer.key, layer]));
    const nextKeys = new Set(next.map(layer => layer.key));
    const removed = previous.filter(layer => !nextKeys.has(layer.key));
    const added = next.filter(layer => !previousByKey.has(layer.key));
    if (!removed.length && !added.length) return;

    setStackHeight(next);
    showRest(previous);
    if (reducedMotion.matches) {
      showRest(next);
      return;
    }

    const edited = new Set([...removed, ...added].filter(layer => !layer.sauce).map(layer => layer.key));
    const firstEdit = profile.layers.findIndex(({ key }) => edited.has(key));
    const clearanceKeys = new Set(firstEdit < 0 ? [] : profile.layers.slice(firstEdit + 1).map(({ key }) => key));
    const additions = new Map();
    const ingredients = added.filter(layer => !layer.sauce);
    ingredients.forEach((layer, index) => additions.set(layer.key, 175 + index * 100));
    const sauces = added.filter(layer => layer.sauce);
    const sauceStart = ingredients.length ? 175 + (ingredients.length - 1) * 100 + fallDuration : 155;
    sauces.forEach((layer, index) => additions.set(layer.key, sauceStart + index * pourDuration));
    const duration = Math.max(820 + 100 * Math.max(0, ingredients.length - 1), sauceStart + sauces.length * pourDuration + 260);
    const plan = { next, previousByKey, removed, additions, duration, clearanceKeys, hasSauce: sauces.length > 0 };
    startSequence(next, duration, elapsed => paintChange(elapsed, plan));
  }

  function init({ profile: product = defaultProfile, selection: selected = [] } = {}) {
    profile = product.id === defaultProfile.id ? { ...defaultProfile, ...product } : product;
    timings = { ...defaultTimings, ...profile.timings };
    fallDuration = timings.drop + timings.settle;
    pourDuration = timings.enter + timings.pour + timings.exit;
    selection = new Set(selected);
    stage.setAttribute('aria-label', `${profile.name} preview`);
    mountLayers();
    photo?.remove();
    photo = undefined;
    if (profile.image && !profile.layers?.length) {
      photo = document.createElement('img');
      photo.className = 'ingredient';
      photo.src = profile.image;
      photo.alt = '';
      photo.style.setProperty('--width', '115%');
      photo.style.transform = 'translateX(-50%)';
      photo.style.visibility = 'visible';
      rig.append(photo);
    }
    const next = layout();
    setStackHeight(next);
    measure();
    showRest(next);
  }

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && sequence) showRest(sequence.next);
  });
  const resize = new ResizeObserver(() => {
    measure();
    if (!sequence) current.forEach(layer => place(layer));
  });
  resize.observe(rig);
  resize.observe(stage);

  return { defaultProfile, init, update, replay };
})();
