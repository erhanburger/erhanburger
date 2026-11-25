import * as T from './vendor/three-burger.js';
import { createBurgerModels } from './burger-model.js';

const heights = {
  bun: .337, beef: .244, chicken: .275, veggie: .244, cheese: .049,
  egg: .169, halloumi: .205, lettuce: .151, tomato: .125, cucumber: .086,
  onion: .075, pickle: .071, sauce: .064, top: .78,
};
const initialAngle = -.32;
const initialTilt = .29;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let preview;

function studio() {
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;

  const scene = new T.Scene();
  const camera = new T.OrthographicCamera();
  const stack = new T.Group();
  scene.add(stack, new T.HemisphereLight(0xfff4e5, 0x9a7860, 1.1));

  const key = new T.DirectionalLight(0xfff1e1, 2.12);
  key.position.set(-3.1, 5.4, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(768, 768);
  Object.assign(key.shadow.camera, { left: -3.1, right: 3.1, top: 4.8, bottom: -2.7, near: .3, far: 13 });
  key.shadow.normalBias = .017;
  key.shadow.bias = -.00015;
  scene.add(key);

  const fill = new T.DirectionalLight(0xfff6ea, .50);
  fill.position.set(4, 2, 2);
  const rim = new T.DirectionalLight(0xffd6a9, 1.50);
  rim.position.set(1, 4, -4);
  scene.add(fill, rim);

  const floor = new T.Mesh(new T.PlaneGeometry(12, 12), new T.ShadowMaterial({ opacity: .12 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.018;
  floor.receiveShadow = true;
  scene.add(floor);

  const contact = document.createElement('canvas');
  contact.width = contact.height = 128;
  const context = contact.getContext('2d');
  const fade = context.createRadialGradient(64, 64, 15, 64, 64, 64);
  fade.addColorStop(0, 'rgba(8,4,2,0.65)');
  fade.addColorStop(.6, 'rgba(8,4,2,0.30)');
  fade.addColorStop(1, 'rgba(8,4,2,0)');
  context.fillStyle = fade;
  context.fillRect(0, 0, 128, 128);
  const contactShadow = new T.Mesh(new T.PlaneGeometry(3.9, 3.9), new T.MeshBasicMaterial({
    map: new T.CanvasTexture(contact), transparent: true, depthWrite: false, toneMapped: false,
  }));
  contactShadow.rotation.x = -Math.PI / 2;
  scene.add(contactShadow);

  return { renderer, scene, camera, stack, model: createBurgerModels() };
}

function makePreview() {
  const { renderer, scene, camera, stack, model } = studio();
  const canvas = renderer.domElement;
  canvas.className = 'bb-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', '3D burger. Use arrow keys to rotate or tilt, and Home to reset.');
  canvas.setAttribute('role', 'group');
  canvas.setAttribute('aria-describedby', 'bb-rotate-help');

  let host, fallback, pointer, frame, observer, layers = new Map();
  let angle = initialAngle, tilt = initialTilt;
  let height = 1.5, targetHeight = height;
  let setImmediately = true;
  let lost = false;
  let lastWidth, lastHeight;
  let shadowDirty = true;

  function schedule() {
    if (host && !lost && !frame) frame = requestAnimationFrame(draw);
  }

  function draw() {
    frame = 0;
    const width = host.clientWidth, viewHeight = host.clientHeight;
    if (!width || !viewHeight) return;
    const amount = motion.matches || setImmediately ? 1 : .23;
    let moving = false;
    for (const { mesh, y } of layers.values()) {
      if (mesh.position.y === y) continue;
      const position = T.MathUtils.lerp(mesh.position.y, y, amount);
      const needsFrame = Math.abs(y - position) > .002;
      mesh.position.y = needsFrame ? position : y;
      shadowDirty = true;
      moving ||= needsFrame;
    }
    height = T.MathUtils.lerp(height, targetHeight, amount);
    moving ||= Math.abs(targetHeight - height) > .002;
    setImmediately = false;

    const aspect = width / viewHeight;
    const fit = Math.max(3.00 / aspect, height + .91) / 2;
    Object.assign(camera, { left: -fit * aspect, right: fit * aspect, top: fit, bottom: -fit, near: .1, far: 25 });
    camera.updateProjectionMatrix();
    const center = height * .50;
    const distance = 8;
    camera.position.set(
      distance * Math.sin(angle) * Math.cos(tilt),
      center + distance * Math.sin(tilt),
      distance * Math.cos(angle) * Math.cos(tilt),
    );
    camera.lookAt(0, center, 0);
    if (width !== lastWidth || viewHeight !== lastHeight) {
      renderer.setSize(width, viewHeight, false);
      lastWidth = width;
      lastHeight = viewHeight;
    }
    renderer.shadowMap.needsUpdate = shadowDirty;
    renderer.render(scene, camera);
    shadowDirty = false;
    if (moving) schedule();
  }

  function remove(layer) {
    stack.remove(layer.mesh);
    layer.mesh.traverse(node => {
      if (node.isInstancedMesh) node.dispose();
      if (layer.mesh.name === 'sauce') node.geometry?.dispose();
    });
  }

  function update(order, exploded, sauces) {
    const next = new Map();
    const gap = exploded ? Math.min(.29, 2.25 / (order.length - 1)) : 0;
    let y = 0;
    for (const [type, key] of order) {
      const signature = type === 'sauce' ? sauces.join('|') : type;
      let layer = layers.get(key);
      if (layer?.signature !== signature) {
        if (layer) remove(layer);
        const mesh = model(type, sauces);
        mesh.position.y = y;
        stack.add(mesh);
        layer = { mesh, signature };
      }
      layer.y = y;
      next.set(key, layer);
      y += (type === 'sauce' ? heights.sauce + Math.max(0, sauces.length - 1) * .017 : heights[type]) + gap;
    }
    for (const [key, layer] of layers) if (!next.has(key)) remove(layer);
    layers = next;
    shadowDirty = true;
    targetHeight = y - gap;
    schedule();
  }

  function reset() {
    angle = initialAngle;
    tilt = initialTilt;
    schedule();
  }

  function rotate(dx, dy) {
    angle += dx;
    tilt = T.MathUtils.clamp(tilt + dy, .08, .85);
    schedule();
  }

  function unmount() {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.remove();
    for (const layer of layers.values()) remove(layer);
    layers.clear();
    host = fallback = pointer = undefined;
  }

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = event;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (pointer?.pointerId !== event.pointerId) return;
    rotate((pointer.clientX - event.clientX) * .014, (event.clientY - pointer.clientY) * .010);
    pointer = event;
  });
  canvas.addEventListener('lostpointercapture', () => { pointer = undefined; });
  canvas.addEventListener('keydown', event => {
    const input = { ArrowLeft: [.17, 0], ArrowRight: [-.17, 0], ArrowUp: [0, .10], ArrowDown: [0, -.10] };
    if (event.key === 'Home') reset();
    else if (Object.hasOwn(input, event.key)) rotate(...input[event.key]);
    else return;
    event.preventDefault();
  });
  canvas.addEventListener('webglcontextlost', () => {
    lost = true;
    preview = undefined;
    const showFallback = fallback;
    unmount();
    renderer.dispose();
    showFallback?.();
  });

  return {
    mount(target, showFallback) {
      host = target;
      fallback = showFallback;
      host.append(canvas);
      observer = new ResizeObserver(schedule);
      observer.observe(host);
      setImmediately = true;
      reset();
      return { update, reset, unmount };
    },
  };
}

export function mountBurger3D(host, fallback) {
  preview ??= makePreview();
  return preview.mount(host, fallback);
}
