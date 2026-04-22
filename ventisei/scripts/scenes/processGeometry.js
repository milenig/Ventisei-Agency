/**
 * Single SVG “lab diagram” for the process section — GSAP morphs primitives
 * when the active step changes.
 */

const ORIGIN = '160px 160px';

const STEPS = [
  {
    bg: '#e8e4dc',
    stroke: '#3d3d3d',
    wireRotate: 0,
    e1: { rx: 78, ry: 30 },
    e2: { rx: 28, ry: 76, gRotate: 0 },
    e3: { rx: 82, ry: 28, gRotate: -40 },
    probe: { cx: 108, cy: 214, r: 14 },
    frame: { x: 44, y: 44, width: 232, height: 232 },
    vline: { x: 118 },
    hline: { y: 128 },
  },
  {
    bg: '#dde8e4',
    stroke: '#2f4a42',
    wireRotate: 34,
    e1: { rx: 96, ry: 24 },
    e2: { rx: 32, ry: 92, gRotate: 52 },
    e3: { rx: 94, ry: 26, gRotate: -76 },
    probe: { cx: 228, cy: 118, r: 16 },
    frame: { x: 49, y: 41, width: 222, height: 226 },
    vline: { x: 144 },
    hline: { y: 148 },
  },
  {
    bg: '#e4e0f0',
    stroke: '#4a3d5c',
    wireRotate: 68,
    e1: { rx: 68, ry: 38 },
    e2: { rx: 28, ry: 76, gRotate: 104 },
    e3: { rx: 94, ry: 26, gRotate: -148 },
    probe: { cx: 164, cy: 222, r: 14 },
    frame: { x: 54, y: 38, width: 212, height: 224 },
    vline: { x: 170 },
    hline: { y: 168 },
  },
];

function qs(root, sel) {
  return (root && root.querySelector ? root : document).querySelector(sel);
}

function applyInstant(root, idx) {
  const c = STEPS[idx];
  if (!c) return;
  const svg = qs(root, '#process-geometry-svg');
  if (!svg) return;

  const setAttr = (id, attrs) => {
    const el = svg.querySelector(`#${id}`);
    if (!el) return;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  };

  setAttr('pg-bg', { fill: c.bg });
  setAttr('pg-e1', { rx: c.e1.rx, ry: c.e1.ry, stroke: c.stroke });
  setAttr('pg-e2', { rx: c.e2.rx, ry: c.e2.ry, stroke: c.stroke });
  setAttr('pg-e3', { rx: c.e3.rx, ry: c.e3.ry, stroke: c.stroke });
  setAttr('pg-probe', { cx: c.probe.cx, cy: c.probe.cy, r: c.probe.r, fill: c.stroke });
  setAttr('pg-frame', { x: c.frame.x, y: c.frame.y, width: c.frame.width, height: c.frame.height });
  setAttr('pg-vline', { x1: c.vline.x, x2: c.vline.x });
  setAttr('pg-hline', { y1: c.hline.y, y2: c.hline.y });

  const rot = (el, deg) => {
    if (!el) return;
    el.setAttribute('transform', `rotate(${deg} 160 160)`);
  };
  rot(svg.querySelector('#pg-wire'), c.wireRotate);
  rot(svg.querySelector('#pg-e2g'), c.e2.gRotate);
  rot(svg.querySelector('#pg-e3g'), c.e3.gRotate);
}

/**
 * Builds a paused timeline of duration 1: first half morphs step 1→2, second half 2→3.
 * Scrub with `tl.progress(p)` for scroll-synced motion (Framer-style useScroll / useTransform).
 */
function ensureScrubTimeline(root) {
  const rootEl = root || document;
  if (rootEl._methodProcessScrubTl) return rootEl._methodProcessScrubTl;

  const svg = qs(rootEl, '#process-geometry-svg');
  if (!svg || !window.gsap) return null;

  applyInstant(rootEl, 0);

  const wire = svg.querySelector('#pg-wire');
  const e2g = svg.querySelector('#pg-e2g');
  const e3g = svg.querySelector('#pg-e3g');
  [wire, e2g, e3g].forEach((el) => {
    if (el) window.gsap.set(el, { transformOrigin: ORIGIN });
  });

  const d = 0.5;
  const c1 = STEPS[1];
  const c2 = STEPS[2];
  const tl = window.gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  const addSegment = (c, t0) => {
    tl.to('#pg-bg', { fill: c.bg, duration: d, ease: 'none' }, t0)
      .to(
        '#pg-probe',
        { attr: { cx: c.probe.cx, cy: c.probe.cy, r: c.probe.r, fill: c.stroke }, duration: d, ease: 'none' },
        t0,
      )
      .to('#pg-e1', { attr: { rx: c.e1.rx, ry: c.e1.ry, stroke: c.stroke }, duration: d, ease: 'none' }, t0)
      .to('#pg-e2', { attr: { rx: c.e2.rx, ry: c.e2.ry, stroke: c.stroke }, duration: d, ease: 'none' }, t0)
      .to('#pg-e3', { attr: { rx: c.e3.rx, ry: c.e3.ry, stroke: c.stroke }, duration: d, ease: 'none' }, t0)
      .to(
        '#pg-frame',
        {
          attr: { x: c.frame.x, y: c.frame.y, width: c.frame.width, height: c.frame.height },
          duration: d,
          ease: 'none',
        },
        t0,
      )
      .to('#pg-vline', { attr: { x1: c.vline.x, x2: c.vline.x }, duration: d, ease: 'none' }, t0)
      .to('#pg-hline', { attr: { y1: c.hline.y, y2: c.hline.y }, duration: d, ease: 'none' }, t0);

    if (wire) tl.to(wire, { rotation: c.wireRotate, transformOrigin: ORIGIN, duration: d, ease: 'none' }, t0);
    if (e2g) tl.to(e2g, { rotation: c.e2.gRotate, transformOrigin: ORIGIN, duration: d, ease: 'none' }, t0);
    if (e3g) tl.to(e3g, { rotation: c.e3.gRotate, transformOrigin: ORIGIN, duration: d, ease: 'none' }, t0);
  };

  addSegment(c1, 0);
  addSegment(c2, d);

  rootEl._methodProcessScrubTl = tl;
  return tl;
}

/**
 * @param {number} p Scroll progress through the process block, 0..1
 * @param {{ reducedMotion?: boolean, root?: ParentNode | null }} opts
 */
export function setProcessVisualScrollProgress(p, opts = {}) {
  const { reducedMotion = false, root = null } = opts;
  const clamped = Math.max(0, Math.min(1, p));
  const rootEl = root || document;
  const n = STEPS.length;

  if (!window.gsap) {
    const idx = Math.min(n - 1, Math.floor(clamped * n + 1e-9));
    applyInstant(rootEl, idx);
    return;
  }

  if (reducedMotion) {
    const idx = Math.min(n - 1, Math.floor(Math.min(1 - 1e-9, clamped) * n));
    applyInstant(rootEl, idx);
    return;
  }

  const tl = ensureScrubTimeline(rootEl);
  if (tl) {
    tl.progress(clamped);
    return;
  }

  const idx = Math.min(n - 1, Math.floor(clamped * n + 1e-9));
  applyInstant(rootEl, idx);
}

/**
 * @param {string} stepOneBased '1' | '2' | '3'
 * @param {{ reducedMotion?: boolean, root?: ParentNode | null, instant?: boolean }} opts
 *  - `instant: true` applies SVG state immediately (used between AnimatePresence-style fades).
 */
export function morphProcessVisual(stepOneBased, opts = {}) {
  const idx = Math.max(0, Math.min(STEPS.length - 1, parseInt(stepOneBased, 10) - 1 || 0));
  const { reducedMotion = false, root = null, instant = false } = opts;
  const rootEl = root;

  if (instant || reducedMotion || !window.gsap) {
    applyInstant(rootEl, idx);
    if (rootEl) delete rootEl._methodProcessScrubTl;
    return;
  }

  const p = STEPS.length > 1 ? idx / (STEPS.length - 1) : 0;
  setProcessVisualScrollProgress(p, { root: rootEl, reducedMotion: false });
}
