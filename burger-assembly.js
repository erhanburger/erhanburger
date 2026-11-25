import * as T from './vendor/three-burger.js';
import { sauceColors, saucePoint, sauceSegments, sauceIndicesPerSegment } from './burger-model.js';

const smooth = t => t * t * (3 - 2 * t);
const unit = value => T.MathUtils.clamp(value, 0, 1);

// The first leg accelerates downward. The short second leg absorbs the impact.
function drop(layer, time) {
  const t = unit(time);
  const rebound = t < .75 ? 0 : Math.sin(Math.PI * (t - .75) / .25) * (1 - t) * .25;
  layer.mesh.position.y = layer.y + 1.8 * (1 - Math.min(1, t / .75) ** 2) + rebound;
  layer.mesh.rotation.x = (1 - smooth(t)) * layer.pitch;
  layer.mesh.rotation.z = (1 - smooth(t)) * layer.roll;
}

export function dropIngredients(layers, added) {
  const first = layers.indexOf(added[0]);
  const initial = first === 0;
  const lifted = initial ? [] : layers.slice(first).filter(layer => !added.includes(layer));
  const lead = lifted.length ? 215 : 0;
  const landing = lead + (added.length - 1) * 135 + 490;
  const duration = landing + (lifted.length ? 360 : 0);
  return {
    duration,
    draw(elapsed) {
      const raise = smooth(unit(elapsed / 215));
      const returnProgress = unit((elapsed - landing) / 360);
      const lift = raise * (1 - returnProgress ** 2);
      for (const layer of lifted) {
        layer.mesh.position.x = -.9 * lift;
        layer.mesh.position.y = layer.y + 1.35 * lift;
        layer.mesh.rotation.z = .22 * lift;
      }
      added.forEach((layer, index) => {
        const time = elapsed - lead - index * 135;
        layer.mesh.visible = time >= 0;
        drop(layer, time / 490);
      });
    },
  };
}

function makeDispenser() {
  const bottle = new T.Group();
  const body = new T.MeshStandardMaterial({ roughness: .36 });
  const lid = new T.MeshStandardMaterial({ color: 0xf0e7d6, roughness: .35 });
  function lathe(profile, material) {
    const mesh = new T.Mesh(new T.LatheGeometry(profile.map(([r, y]) => new T.Vector2(r, y)), 40), material);
    mesh.castShadow = mesh.receiveShadow = true;
    bottle.add(mesh);
    return mesh;
  }
  const shell = lathe([[0, 0], [.16, 0], [.207, .025], [.224, .08], [.217, .55], [.205, .69], [.173, .76], [.135, .79]], body);
  lathe([[.134, .77], [.148, .785], [.151, .815], [.151, .87], [.145, .885], [.078, .91], [.031, 1.105], [.022, 1.125]], lid);
  const band = new T.MeshStandardMaterial({ color: 0xd4c9b8, roughness: .51 });
  for (const y of [.807, .826, .845, .864]) {
    lathe([[.151, y], [.155, y + .003], [.155, y + .007], [.151, y + .01]], band);
  }

  const stream = new T.Mesh(new T.CylinderGeometry(.018, .024, 1, 12),
    new T.MeshStandardMaterial({ roughness: .25 }));
  const group = new T.Group();
  group.visible = false;
  group.add(bottle, stream);
  const nozzle = new T.Vector3(), impact = new T.Vector3(), axis = new T.Vector3();
  const up = new T.Vector3(0, 1, 0);
  const plastic = new T.Color(0xe3c7a4);
  return {
    group,
    draw(name, line, index, base, progress, travel) {
      const inside = 1 - travel;
      bottle.rotation.z = 2.84 - .44 * travel;
      const angle = progress * Math.PI * 2;
      saucePoint(angle, index, impact);
      impact.y += base;
      impact.applyAxisAngle(up, line.rotation.y);
      nozzle.set(impact.x + travel * 1.8, impact.y + .43 + travel * .85, impact.z);
      bottle.position.copy(nozzle).sub(axis.set(0, 1.125, 0).applyEuler(bottle.rotation));
      body.color.setHex(sauceColors[name]).lerp(plastic, .18);
      shell.scale.setScalar(1 - .035 * inside * (1 + Math.sin(angle * 3)));
      shell.scale.y = 1;
      stream.visible = inside === 1 && progress < 1;
      if (!stream.visible) return;
      stream.material.color.setHex(sauceColors[name]);
      stream.position.copy(impact).lerp(nozzle, .5);
      axis.copy(nozzle).sub(impact);
      stream.scale.y = axis.length();
      stream.quaternion.setFromUnitVectors(up, axis.normalize());
    },
  };
}

export function createSauceApplication(stack) {
  const dispenser = makeDispenser();
  stack.add(dispenser.group);
  return (sauce, top, names, added) => {
    const lines = sauce.mesh.children;
    const steps = names.flatMap((name, index) => added.includes(name) ? [{ name, index, line: lines[index] }] : []);
    const pour = 830, start = 320, departure = start + steps.length * pour;
    const duration = departure + 530;
    return {
      duration,
      wide: true,
      unfinished(elapsed) {
        return steps.filter((_, step) => elapsed < start + (step + 1) * pour).map(({ name }) => name);
      },
      draw(elapsed) {
        const enter = smooth(unit(elapsed / start));
        const leave = smooth(unit((elapsed - departure) / 330));
        const lift = enter * (1 - smooth(unit((elapsed - departure - 150) / 380)));
        top.mesh.position.set(-2.25 * lift, top.y + .6 * lift, -.16 * lift);
        top.mesh.rotation.z = .24 * lift;
        dispenser.group.visible = elapsed > 45 && leave < 1;
        for (const [step, { line }] of steps.entries()) {
          const progress = unit((elapsed - start - step * pour) / pour);
          const geometry = line.children[0].geometry;
          geometry.setDrawRange(0, Math.floor(progress * sauceSegments) * sauceIndicesPerSegment);
        }
        const step = Math.min(steps.length - 1, Math.max(0, Math.floor((elapsed - start) / pour)));
        const { name, index, line } = steps[step];
        const progress = unit((elapsed - start - step * pour) / pour);
        dispenser.draw(name, line, index, sauce.y, progress, 1 - enter + leave);
      },
      finish() {
        top.mesh.position.set(0, top.y, 0);
        top.mesh.rotation.z = 0;
        dispenser.group.visible = false;
        for (const { line } of steps) line.children[0].geometry.setDrawRange(0, Infinity);
      },
    };
  };
}
