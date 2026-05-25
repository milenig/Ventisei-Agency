import { loop } from '../webgl/core/loop.js';

const RING_COUNT = 24;
const SPHERE_R = 1;
/** Dots along each latitude ring (horizontal emphasis). */
const MAX_RING_DOTS = 108;
const MIN_RING_DOTS = 6;
const MAX_VEL = 1.35;
const POINTER_RANGE = 0.42;
const VEL_SMOOTH = 5.5;
const IDLE_SPIN_Y = 0.12;

function buildSpherePoints() {
  const pts = [];
  for (let ri = 0; ri < RING_COUNT; ri++) {
    // Even spacing on Y so horizontal rings read evenly top-to-bottom.
    const y = (1 - ri / (RING_COUNT - 1) * 2) * SPHERE_R;
    const ringR = Math.sqrt(Math.max(0, SPHERE_R * SPHERE_R - y * y));
    const dotCount = Math.max(MIN_RING_DOTS, Math.round(MAX_RING_DOTS * (ringR / SPHERE_R)));
    for (let di = 0; di < dotCount; di++) {
      const theta = (di / dotCount) * Math.PI * 2;
      const ringSpan = ringR / SPHERE_R;
      pts.push({
        x: ringR * Math.cos(theta),
        y,
        z: ringR * Math.sin(theta),
        ringSpan,
      });
    }
  }
  return pts;
}

function rotateY(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotateX(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function project(p, scale) {
  const perspective = 2.8;
  const depth = perspective / (perspective + p.z);
  return {
    sx: p.x * scale * depth,
    sy: -p.y * scale * depth,
    depth: p.z,
    depthScale: depth,
  };
}

/**
 * @param {object} opts
 * @param {HTMLElement | null} opts.container
 * @param {boolean} opts.reducedMotion
 * @param {boolean} opts.pointerControl
 * @param {() => boolean} [opts.isActive]
 */
export function initHeroGlobe({ container, reducedMotion, pointerControl, isActive = () => true }) {
  const svg = container?.querySelector('.hero-globe');
  const group = svg?.querySelector('.hero-globe__dots');
  if (!svg || !group) return () => {};

  const points = buildSpherePoints();
  const circles = points.map(() => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.setAttribute('class', 'hero-globe__dot');
    el.setAttribute('r', '0.68');
    group.appendChild(el);
    return el;
  });

  const viewScale = 88;
  let rotX = 0.28;
  let rotY = 0;
  let velX = 0;
  let velY = 0;
  let targetVelX = 0;
  let targetVelY = 0;
  let pointerInside = false;
  let unsub = null;

  const render = () => {
    const sorted = points.map((p, i) => {
      let q = rotateY(p, rotY);
      q = rotateX(q, rotX);
      const pr = project(q, viewScale);
      return { i, ringSpan: p.ringSpan, ...pr };
    });
    sorted.sort((a, b) => a.depth - b.depth);

    for (const { i, sx, sy, depth, depthScale, ringSpan } of sorted) {
      const el = circles[i];
      const front = (depth + SPHERE_R) / (SPHERE_R * 2);
      const horizontalBoost = 0.78 + ringSpan * 0.38;
      const alpha = (0.13 + front * 0.4 * depthScale) * horizontalBoost;
      const r = (0.41 + front * 0.31) * (0.92 + ringSpan * 0.18);
      el.setAttribute('cx', sx.toFixed(2));
      el.setAttribute('cy', sy.toFixed(2));
      el.setAttribute('r', r.toFixed(2));
      el.setAttribute('fill-opacity', alpha.toFixed(3));
    }
  };

  render();

  if (reducedMotion) {
    return () => {
      group.replaceChildren();
    };
  }

  const pointerTargetFromEvent = (e) => {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const halfW = Math.max(1, rect.width * 0.5);
    const halfH = Math.max(1, rect.height * 0.5);
    const nx = (e.clientX - cx) / halfW;
    const ny = (e.clientY - cy) / halfH;
    const dist = Math.min(1, Math.hypot(nx, ny) / POINTER_RANGE);
    const strength = dist * dist;
    return {
      targetVelY: nx * strength * MAX_VEL,
      targetVelX: -ny * strength * MAX_VEL,
    };
  };

  const onPointerMove = (e) => {
    if (!pointerControl) return;
    const rect = container.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    pointerInside = inside;
    if (!inside) {
      targetVelX = 0;
      targetVelY = 0;
      return;
    }
    const t = pointerTargetFromEvent(e);
    targetVelX = t.targetVelX;
    targetVelY = t.targetVelY;
  };

  const onPointerLeave = () => {
    pointerInside = false;
    targetVelX = 0;
    targetVelY = 0;
  };

  if (pointerControl) {
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }

  unsub = loop.subscribe(({ dt }) => {
    if (!isActive()) return;

    if (!pointerControl || !pointerInside) {
      targetVelY = IDLE_SPIN_Y;
      targetVelX = 0;
    }

    const smooth = 1 - Math.exp(-VEL_SMOOTH * dt);
    velX += (targetVelX - velX) * smooth;
    velY += (targetVelY - velY) * smooth;

    rotX += velX * dt;
    rotY += velY * dt;
    render();
  });

  return () => {
    unsub?.unsubscribe();
    document.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerleave', onPointerLeave);
    group.replaceChildren();
  };
}
