import { paintShishPackaging } from './shish-scene.js';
import { paintSaucePour, paintSauceTrail, preloadSauceBottles, sauceProfiles } from './sauce-motion.js';
import { ingredientPose, ingredientTiming } from './ingredient-motion.js';

export const CharcoalScene = (() => {
  // Width, stacking step and offset are fractions of the rig width.
  const assets = '../burger-builder-demo/assets/';
  const sauceLayers = Object.entries(sauceProfiles).map(([key, sauce], index) => ({
    key, width: .63, step: .005, offset: (index - 3) * .008, sauce,
  }));
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
      ...sauceLayers,
      { key: 'top', width: .98, step: 0, offset: .003, required: true },
    ],
  };

  const defaultTimings = { drop: 285, settle: 95, enter: 240, pour: 650, exit: 215 };
  let timings = defaultTimings;
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
  const landingShadows = new Map();
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
    for (const shadow of landingShadows.values()) shadow.remove();
    landingShadows.clear();
    elements.clear();
    const claimed = new Set();
    profile.layers?.forEach((layer, index) => {
      if (layer.sauce) return;
      const existing = embedded.get(layer.embeddedKey ?? layer.key);
      const reuse = existing && !claimed.has(existing.image);
      const image = reuse ? existing.image : document.createElement('img');
      const url = layer.asset ?? existing?.url;
      if (url && image.getAttribute('src') !== url) image.src = url;
      image.alt = '';
      image.draggable = false;
      image.dataset.layer = layer.key;
      image.classList.add('ingredient');
      image.classList.toggle('menu-photo', Boolean(layer.menuPhoto));
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
    return layers.map(layer => {
      const surface = layer.sauce ? layer.sauce.surfaceLift ?? .015 : 0;
      const y = layer.positionY ?? height + surface;
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

  function paintLandingShadow(layer, image, strength, lift) {
    let shadow = landingShadows.get(layer.key);
    if (!strength) {
      if (shadow) shadow.style.visibility = 'hidden';
      return;
    }
    if (!shadow) {
      shadow = document.createElement('div');
      shadow.dataset.landingShadow = layer.key;
      Object.assign(shadow.style, {
        position: 'absolute',
        pointerEvents: 'none',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse, #170b06b0 2%, #20100a75 40%, transparent 72%)',
      });
      rig.append(shadow);
      landingShadows.set(layer.key, shadow);
    }
    Object.assign(shadow.style, {
      visibility: 'visible',
      width: `${layer.width * width * (.76 + lift * .27)}px`,
      height: `${width * (.087 + lift * .06)}px`,
      bottom: `${(layer.y - .018) * width}px`,
      left: `calc(50% + ${layer.offset * width}px)`,
      opacity: String(strength * .43),
      zIndex: String(Number(image.style.zIndex) - 1),
    });
  }

  function place(layer, {
    lift = 0, move = 0, angle = 0, squash = 1, spread = 1, skew = 0, yaw = 0, opacity = 1, shadow = 0, lidFold,
  } = {}) {
    if (layer.sauce) {
      paintTrail({ ...layer, y: layer.y + lift, offset: layer.offset + move }, 1, opacity);
      return;
    }
    const image = elements.get(layer.key);
    if (!image) return;
    image.style.visibility = opacity > 0 ? 'visible' : 'hidden';
    image.style.opacity = opacity;
    image.style.setProperty('--width', `${layer.width * 100}%`);
    image.style.transformOrigin = layer.packaging === 'lid' ? '50% 34.4%' :
      squash !== 1 || spread !== 1 ? '50% 100%' : '';
    // Fold around the slanted hinge visible in the aligned box photograph.
    const hinge = lidFold === undefined ? '' : ` rotate(-7deg) scaleY(${lidFold}) rotate(7deg)`;
    image.style.transform =
      `translate3d(calc(-50% + ${(layer.offset + move) * width}px), ${-(layer.y + lift) * width}px, 0) rotate(${angle + (layer.restingAngle ?? 0)}deg) rotateY(${yaw}deg) skewX(${skew}deg) scale(${spread}, ${squash})${hinge}`;
    paintLandingShadow(layer, image, shadow * opacity, lift);
  }

  function hide(key) {
    const image = elements.get(key);
    if (image) image.style.visibility = 'hidden';
    const shadow = landingShadows.get(key);
    if (shadow) shadow.style.visibility = 'hidden';
  }

  function resetDispenser() {
    bottle.style.visibility = 'hidden';
    canvas.style.zIndex = traceDepth;
    context?.clearRect(0, 0, canvasSize, canvasSize);
  }

  function paintTrail(layer, progress, opacity) {
    paintSauceTrail(context, layer, progress, opacity, width, canvasSize);
  }

  function drawSauce(layer, elapsed) {
    paintSaucePour({ context, bottle, canvas, traceDepth, layer, elapsed, timings, width, canvasSize, verticalRoom });
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

  function stackPressures(layers, poses) {
    const pressures = new Map();
    if (profile.planar) return pressures;
    let load = 0;
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const { key, sauce } = layers[index];
      if (sauce) continue;
      pressures.set(key, load);
      load = Math.max(poses.get(key)?.pressure ?? 0, load * .38);
    }
    return pressures;
  }

  function placeWithLanding(layer, pose, pressure) {
    if (!pressure) {
      place(layer, pose);
      return;
    }
    place(layer, {
      ...pose,
      lift: (pose?.lift ?? 0) - (layer.y > 0 ? pressure * .011 : 0),
      squash: (pose?.squash ?? 1) * (1 - pressure * .023),
    });
  }

  function landingPose(layer, motion, elapsed, start) {
    const pose = ingredientPose(motion, elapsed, start);
    if (!pose || !width) return pose;
    const image = elements.get(layer.key);
    const aspect = image.naturalWidth ? image.naturalHeight / image.naturalWidth : .56;
    const angle = Math.abs(pose.angle) * Math.PI / 180;
    const footprint = layer.width * (aspect + Math.sin(angle) * .55);
    const headroom = (verticalRoom - 8) / width - layer.y - footprint;
    // Keep the airborne photo inside the studio on shallow mobile viewports.
    return { ...pose, lift: Math.min(pose.lift, Math.max(0, headroom)) };
  }

  function parkedCover(layer, opening, hasSauce) {
    const capLift = opening * (hasSauce ? .43 : .31);
    const image = elements.get(layer.key);
    const aspect = image.naturalWidth ? image.naturalHeight / image.naturalWidth : .56;
    const margin = width > 0 ? (verticalRoom - 9) / width - layer.y - layer.width * aspect : 0;
    return {
      lift: Math.min(capLift, Math.max(0, margin - capLift * .07)),
      move: -capLift * .78,
      angle: -capLift * 9,
      yaw: -capLift * 76,
    };
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

  function paintReplay(elapsed, next, plan) {
    resetDispenser();
    if (profile.packaging) {
      const closed = profile.layers.find(layer => layer.key === profile.packaging.closedKey);
      const box = next.filter(layer => layer.packaging);
      paintShishPackaging(elapsed, profile.packaging, box, closed ? { ...closed, y: closed.positionY } : undefined, place);
    }
    const poses = new Map();
    for (const { layer, start, motion } of plan) {
      if (motion) poses.set(layer.key, landingPose(layer, motion, elapsed - start));
    }
    const pressures = stackPressures(next, poses);
    let pouring;
    for (const { layer, start } of plan) {
      const time = elapsed - start;
      if (layer.sauce) {
        paintSauce(layer, time);
        if (time >= 0 && time < pourDuration) pouring = layer.sauce.label;
      } else if (time < 0) {
        hide(layer.key);
      } else {
        placeWithLanding(layer, poses.get(layer.key) ?? undefined, pressures.get(layer.key));
      }
    }
    updateStatusForPour(pouring, profile.planar ? 'Preparing your order…' : 'Building your burger…');
  }

  function paintChange(elapsed, plan) {
    resetDispenser();
    const {
      next, previousByKey, removed, additions, clearanceKeys, clearAt, cover, closeAt, hasSauce,
    } = plan;
    const opening = ease(clamp(elapsed / 210));
    const clearance = opening * (1 - ease(clamp((elapsed - clearAt) / 170)));
    const movement = ease(clamp((elapsed - 135) / 420));
    const poses = new Map();
    for (const [key, { layer, start, motion }] of additions) {
      if (motion) poses.set(key, landingPose(layer, motion, elapsed - start));
    }
    if (cover && elapsed >= closeAt) {
      const parked = parkedCover(cover.layer, 1, hasSauce);
      poses.set(cover.layer.key, landingPose(cover.layer, cover.motion, elapsed - closeAt, parked));
    }
    const pressures = stackPressures(next, poses);
    let pouring;

    for (const layer of next) {
      const old = previousByKey.get(layer.key);
      const scheduled = additions.get(layer.key);
      if (scheduled) {
        const local = elapsed - scheduled.start;
        if (layer.sauce) {
          paintSauce(layer, local);
          if (local >= 0 && local < pourDuration) pouring = layer.sauce.label;
        } else if (local < 0) {
          hide(layer.key);
        } else {
          placeWithLanding(layer, poses.get(layer.key) ?? undefined, pressures.get(layer.key));
        }
        continue;
      }
      const position = { ...layer, y: old.y + (layer.y - old.y) * movement };
      if (layer.key === cover?.layer.key) {
        place(position, elapsed < closeAt ? parkedCover(position, opening, hasSauce) : poses.get(layer.key) ?? undefined);
      } else if (clearanceKeys.has(layer.key)) {
        placeWithLanding(position, { lift: clearance * .09, move: clearance * .26, angle: clearance * 6 }, pressures.get(layer.key));
      } else {
        placeWithLanding(position, undefined, pressures.get(layer.key));
      }
    }
    for (const layer of removed) {
      const exit = ease(clamp((elapsed - 110) / 240));
      place(layer, { lift: exit * .12, move: -exit * .31, angle: -exit * 9, opacity: 1 - exit });
    }
    updateStatusForPour(pouring, profile.planar ? 'Updating your selection…' : 'Adjusting your burger…');
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

    const leadIn = profile.packaging?.openDuration ?? 0;
    let start = leadIn;
    let landedAt = leadIn;
    const plan = next.filter(layer => !layer.packaging).map(layer => {
      const motion = layer.sauce ? null : ingredientTiming(layer, timings, profile.closingLayerKey);
      if (layer.sauce || layer.finishesReplay || layer.key === profile.closingLayerKey) start = Math.max(start, landedAt, leadIn + (layer.replayDelay ?? 0));
      else if (layer.replayDelay !== undefined) start = leadIn + layer.replayDelay;
      const entry = { layer, start, motion };
      landedAt = Math.max(landedAt, start + (motion?.duration ?? pourDuration));
      // Only overlap the next release with the previous layer's final settling.
      start += motion ? motion.fall + Math.round(motion.settle * .5) : pourDuration + 75;
      return entry;
    });
    startSequence(next, Math.max(start, landedAt) + 70, elapsed => paintReplay(elapsed, next, plan));
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
    const clearanceKeys = new Set(firstEdit < 0 || profile.planar ? [] : profile.layers.slice(firstEdit + 1).map(({ key }) => key));
    const additions = new Map();
    let releaseAt = 185;
    let landedAt = removed.length ? 350 : releaseAt;
    for (const layer of added.filter(item => !item.sauce)) {
      const motion = ingredientTiming(layer, timings, profile.closingLayerKey);
      additions.set(layer.key, { layer, start: releaseAt, motion });
      landedAt = Math.max(landedAt, releaseAt + motion.duration);
      releaseAt += motion.fall + Math.round(motion.settle * .35);
    }
    const sauces = added.filter(layer => layer.sauce);
    let sauceAt = added.some(layer => !layer.sauce) || removed.length ? landedAt + 35 : 165;
    for (const layer of sauces) {
      additions.set(layer.key, { layer, start: sauceAt });
      sauceAt += pourDuration + 65;
    }
    const coverLayer = next.find(layer => layer.key === profile.closingLayerKey && previousByKey.has(layer.key));
    const cover = coverLayer ? {
      layer: coverLayer, motion: ingredientTiming(coverLayer, timings, profile.closingLayerKey),
    } : null;
    const clearAt = Math.max(365, landedAt - 115);
    const closeAt = Math.max(565, clearAt + 155, sauces.length ? sauceAt : 0);
    const duration = closeAt + (cover?.motion.duration ?? 0) + 45;
    const plan = { next, previousByKey, removed, additions, duration, clearanceKeys, clearAt, cover, closeAt, hasSauce: sauces.length > 0 };
    startSequence(next, duration, elapsed => paintChange(elapsed, plan));
  }

  function init({ profile: product = defaultProfile, selection: selected = [] } = {}) {
    profile = product.id === defaultProfile.id ? { ...defaultProfile, ...product } : product;
    if (!reducedMotion.matches) preloadSauceBottles(profile.layers ?? []);
    timings = { ...defaultTimings, ...profile.timings };
    pourDuration = timings.enter + timings.pour + timings.exit;
    selection = new Set(selected);
    if (profile.visual) stage.dataset.visual = profile.visual;
    else stage.removeAttribute('data-visual');
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
