import { loop } from '../webgl/core/loop.js';
import { initHeroGlobeCursor } from './heroGlobeCursor.js';

const RING_COUNT = 24;
const SPHERE_R = 1;
/** Dots along each latitude ring (horizontal emphasis). */
const MAX_RING_DOTS = 108;
const MIN_RING_DOTS = 6;
const MAX_VEL = 1.35;
const POINTER_RANGE = 0.42;
const VEL_SMOOTH = 5.5;
const IDLE_SPIN_Y = 0.12;
const GLOW_CYAN = '1, 230, 225';
const GLOW_DOT_RADIUS = 0.32;
const VIEWBOX_HALF = 120;

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

function pointerToSvg(svg, clientX, clientY) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(ctm.inverse());
}

/** Globe disc in host-local px (matches SVG meet + viewBox scale). */
function globeDiscMetrics(svg, hostEl, viewScale) {
  const host = hostEl.getBoundingClientRect();
  const box = svg.getBoundingClientRect();
  const side = Math.min(box.width, box.height);
  const cx = box.left + box.width * 0.5 - host.left;
  const cy = box.top + box.height * 0.5 - host.top;
  const radius = (side * 0.5) * (viewScale / VIEWBOX_HALF);
  return { cx, cy, radius };
}

function applyCircleClip(el, metrics) {
  if (!el) return;
  const clip = `circle(${metrics.radius.toFixed(2)}px at ${metrics.cx.toFixed(2)}px ${metrics.cy.toFixed(2)}px)`;
  el.style.clipPath = clip;
  el.style.webkitClipPath = clip;
}

/**
 * @param {object} opts
 * @param {HTMLElement | null} opts.container
 * @param {HTMLElement | null} [opts.glowEl]
 * @param {boolean} opts.reducedMotion
 * @param {boolean} opts.pointerControl
 * @param {() => boolean} [opts.isActive]
 */
export function initHeroGlobe({ container, glowEl, reducedMotion, pointerControl, isActive = () => true }) {
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

  const viewScale = 88 * 1.2;
  let rotX = 0.28;
  let rotY = 0;
  let velX = 0;
  let velY = 0;
  let targetVelX = 0;
  let targetVelY = 0;
  let pointerInside = false;
  let pointerEngaged = false;
  let lastPointerX = null;
  let lastPointerY = null;
  let unsub = null;

  const glowHost = glowEl ?? container?.querySelector('.hero-visual');
  const visualStack = glowHost?.querySelector('.hero-visual__stack');
  const glowLayer =
    glowHost?.querySelector('.hero-visual__glow') ??
    (() => {
      if (!glowHost) return null;
      const el = document.createElement('div');
      el.className = 'hero-visual__glow';
      el.setAttribute('aria-hidden', 'true');
      glowHost.querySelector('.hero-visual__stack')?.prepend(el);
      return el;
    })();

  let glowX = 0.5;
  let glowY = 0.5;
  let targetGlowX = 0.5;
  let targetGlowY = 0.5;
  let glowOpacity = 0;
  let targetGlowOpacity = 0;
  let glowPulseT = 0;
  let pointerSvgX = 0;
  let pointerSvgY = 0;

  const pointerInGlowHost = (e) => {
    if (!glowHost) return false;
    const rect = glowHost.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  };

  const syncPointerSvg = (e) => {
    const p = pointerToSvg(svg, e.clientX, e.clientY);
    if (p) {
      pointerSvgX = p.x;
      pointerSvgY = p.y;
    }
  };

  const paintGlowLayer = () => {
    if (!glowLayer || !glowHost) return;
    const rect = glowHost.getBoundingClientRect();
    const disc = globeDiscMetrics(svg, glowHost, viewScale);
    applyCircleClip(visualStack ?? glowLayer, disc);

    const x = glowX * rect.width;
    const y = glowY * rect.height;
    const r = disc.radius * (0.42 + 0.05 * Math.sin(glowPulseT));
    glowLayer.style.opacity = String(glowOpacity);
    glowLayer.style.background = `radial-gradient(circle ${r.toFixed(0)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(${GLOW_CYAN}, 0.34) 0%, rgba(${GLOW_CYAN}, 0.14) 38%, rgba(${GLOW_CYAN}, 0.04) 58%, transparent 72%)`;
  };

  const updateGlowFromEvent = (e) => {
    if (!glowHost || !pointerControl) return;
    if (!pointerInGlowHost(e)) {
      targetGlowOpacity = 0;
      return;
    }
    const rect = glowHost.getBoundingClientRect();
    targetGlowX = (e.clientX - rect.left) / Math.max(1, rect.width);
    targetGlowY = (e.clientY - rect.top) / Math.max(1, rect.height);
    targetGlowOpacity = 1;
    syncPointerSvg(e);
  };

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

      const onDisc = sx * sx + sy * sy <= viewScale * viewScale;
      const dist = Math.hypot(sx - pointerSvgX, sy - pointerSvgY);
      const near = onDisc
        ? glowOpacity * Math.max(0, 1 - dist / (viewScale * GLOW_DOT_RADIUS))
        : 0;
      const inkA = alpha;
      const cyanA = Math.min(0.92, alpha + near * 0.42);

      el.setAttribute('cx', sx.toFixed(2));
      el.setAttribute('cy', sy.toFixed(2));
      el.setAttribute('r', r.toFixed(2));
      if (near > 0.02) {
        el.setAttribute('fill', `rgba(${GLOW_CYAN}, ${cyanA.toFixed(3)})`);
        el.setAttribute('fill-opacity', '1');
      } else {
        el.setAttribute('fill', 'var(--ink, #0a0a0a)');
        el.setAttribute('fill-opacity', inkA.toFixed(3));
      }
    }
  };

  render();

  if (reducedMotion) {
    return () => {
      group.replaceChildren();
    };
  }

  const spinHost = glowHost ?? container;

  const pointerTargetFromEvent = (e) => {
    const rect = spinHost.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const halfW = Math.max(1, rect.width * 0.5);
    const halfH = Math.max(1, rect.height * 0.5);
    const nx = (e.clientX - cx) / halfW;
    const ny = (e.clientY - cy) / halfH;
    const dist = Math.min(1, Math.hypot(nx, ny) / POINTER_RANGE);
    // Keep a little response at the exact center (avoids a dead spot mid-globe).
    const strength = 0.14 + 0.86 * dist * dist;
    return {
      targetVelY: nx * strength * MAX_VEL,
      targetVelX: -ny * strength * MAX_VEL,
    };
  };

  const onPointerMove = (e) => {
    if (!pointerControl) return;
    updateGlowFromEvent(e);
    const rect = spinHost.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    pointerInside = inside;
    if (!inside) {
      pointerEngaged = false;
      lastPointerX = null;
      lastPointerY = null;
      targetVelX = 0;
      targetVelY = 0;
      return;
    }

    if (lastPointerX !== null && lastPointerY !== null) {
      const moved = Math.hypot(e.clientX - lastPointerX, e.clientY - lastPointerY);
      if (moved > 2) pointerEngaged = true;
    }
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    if (!pointerEngaged) {
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
    pointerEngaged = false;
    lastPointerX = null;
    lastPointerY = null;
    targetVelX = 0;
    targetVelY = 0;
    targetGlowOpacity = 0;
  };

  const cleanupCursor = initHeroGlobeCursor({
    host: glowHost,
    enabled: pointerControl,
  });

  if (pointerControl) {
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    spinHost.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }

  unsub = loop.subscribe(({ dt, now }) => {
    const smooth = 1 - Math.exp(-VEL_SMOOTH * dt);
    const glowSmooth = 1 - Math.exp(-10 * dt);

    if (glowLayer && pointerControl) {
      glowX += (targetGlowX - glowX) * glowSmooth;
      glowY += (targetGlowY - glowY) * glowSmooth;
      glowOpacity += (targetGlowOpacity - glowOpacity) * glowSmooth;
      glowPulseT = now * 0.0006;
      paintGlowLayer();
    }

    if (!isActive()) return;

    if (!pointerControl || !pointerInside || !pointerEngaged) {
      targetVelX = 0;
      targetVelY = 0;
    }

    velX += (targetVelX - velX) * smooth;
    velY += (targetVelY - velY) * smooth;

    rotY += IDLE_SPIN_Y * dt;
    rotX += velX * dt;
    rotY += velY * dt;
    render();
  });

  return () => {
    unsub?.unsubscribe();
    cleanupCursor?.();
    document.removeEventListener('pointermove', onPointerMove);
    spinHost.removeEventListener('pointerleave', onPointerLeave);
    group.replaceChildren();
  };
}
