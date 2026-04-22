import { loop } from './webgl/core/loop.js';

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/**
 * About section ASCII art (transparent): head silhouette + flowing thoughts.
 */
export function initAsciiAbout({ reducedMotion }) {
  const canvas = document.querySelector('.about-ascii-canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return null;

  const rootStyle = getComputedStyle(document.documentElement);
  const ink = rootStyle.getPropertyValue('--ink')?.trim() || '#111';
  const cyan = rootStyle.getPropertyValue('--cyan')?.trim() || '#00b3b3';

  let dpr = 1;
  let W = 1;
  let H = 1;
  let cols = 0;
  let rows = 0;
  let cell = 9;
  let active = true;

  const HEAD = [
    '                  ____',
    '             _.-"\'    `"-._',
    '          .-"   _..---.._   "-.',
    '        ."    .\'  _   _  `.    ".',
    '       /     /   (o) (o)   \\     \\',
    '      ;     |      .-._.     |     ;',
    '      |     |     (  _  )    |     |',
    '      ;      \\      `-\'     /      ;',
    '       \\      `-.._____..-\'      /',
    '        `.                     .\'',
    '          `-._             _.-\'',
    '              `"--.._..--"`',
    '                 /  ____  \\',
    '                /__/    \\__\\',
  ];

  const STREAM_CHARS = ' .,:;~-=+*#%@';
  const stream = Array.from({ length: 70 }, (_, i) => ({
    x: 1.02 + ((i * 37) % 60) / 100,
    y: 0.12 + ((i * 19) % 76) / 100,
    v: 0.18 + ((i * 13) % 30) / 100,
    phase: i * 0.21,
    ch: STREAM_CHARS[(i * 7) % STREAM_CHARS.length],
  }));

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.floor(parent.clientWidth * dpr));
    H = Math.max(1, Math.floor(parent.clientHeight * dpr));
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${parent.clientWidth}px`;
    canvas.style.height = `${parent.clientHeight}px`;
    cell = Math.max(8, Math.floor(12 * dpr));
    cols = Math.ceil(W / cell);
    rows = Math.ceil(H / cell);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.target !== canvas) return;
        active = e.isIntersecting;
      });
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  function draw(nowMs) {
    const t = nowMs * 0.001;
    resize();
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    ctx.font = `${Math.floor(cell * 0.95)}px "Space Mono", ui-monospace, monospace`;

    // Layout head template
    const headW = Math.max(...HEAD.map((l) => l.length));
    const headH = HEAD.length;
    const headPxW = headW * cell;
    const headPxH = headH * cell * 1.15;

    const ox = Math.floor(W * 0.06);
    const oy = Math.floor((H - headPxH) * 0.42);

    // Draw head (ink)
    ctx.fillStyle = `rgba(17,17,17,0.55)`;
    for (let i = 0; i < HEAD.length; i++) {
      ctx.fillText(HEAD[i], ox, oy + i * cell * 1.15);
    }

    // Stream: curved flow into head "temple"
    const entryX = ox + headPxW * 0.78;
    const entryY = oy + headPxH * 0.42;

    for (let i = 0; i < stream.length; i++) {
      const p = stream[i];

      // Move leftwards, then bend into entry point.
      const bend = 0.55 + 0.45 * Math.sin(t * 0.7 + p.phase);
      p.x -= (p.v * 0.0016) * (0.8 + bend * 0.6);
      p.y += Math.sin(t * 1.1 + p.phase) * 0.0008;

      // When near head area, attract into entry.
      const px = p.x * W;
      const py = p.y * H;
      const dx = entryX - px;
      const dy = entryY - py;
      const dist = Math.hypot(dx, dy);
      if (dist < Math.max(90, 140 * dpr)) {
        p.x += (dx / W) * 0.012;
        p.y += (dy / H) * 0.012;
      }

      // Respawn
      if (p.x < -0.1 || p.y < -0.1 || p.y > 1.1) {
        p.x = 1.04 + ((i * 29) % 40) / 100;
        p.y = 0.14 + ((i * 17) % 70) / 100;
        p.ch = STREAM_CHARS[(Math.floor(t * 6 + i) * 5) % STREAM_CHARS.length];
      }

      // Draw character
      const alpha = clamp(0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.9 + p.phase)), 0.18, 0.46);
      const useCyan = (i % 7 === 0) || dist < Math.max(70, 110 * dpr);
      const rgb = useCyan ? '0,179,179' : '17,17,17';
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.fillText(p.ch, p.x * W, p.y * H);
    }
  }

  if (reducedMotion) {
    draw(0);
    return null;
  }

  return loop.subscribe(({ now }) => {
    if (!active) return;
    draw(now);
  });
}

