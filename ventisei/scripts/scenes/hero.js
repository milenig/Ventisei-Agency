import { loop } from '../webgl/core/loop.js';
import { initHeroGlobe } from './heroGlobe.js';

const HERO_ASCII = ' .,:;~-=+*#%@';

const MQ_MOBILE_LAYOUT = '(max-width: 899px)';

export function initHero({ reducedMotion }) {
  const mqMobileLayout = window.matchMedia?.(MQ_MOBILE_LAYOUT) ?? { matches: false, addEventListener: () => {} };
  const isMobileLayout = () => mqMobileLayout.matches;

  // Hero intro motion
  if (window.gsap && !reducedMotion) {
    const tl = window.gsap.timeline({ delay: 0.22 });
    tl.to('.hero-established', { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' });
    tl.to('.hero-title-line span', { y: '0%', duration: 1.15, stagger: 0.12, ease: 'power4.out' }, '-=0.55');
    tl.to('.hero-desc', { opacity: 1, duration: 0.95, ease: 'power2.out' }, '-=0.45');
    tl.to('.hero-cta', { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.5');

    const heroInner = document.querySelector('.hero-inner');
    const heroSection = document.getElementById('hero');
    const heroVisualStack = document.querySelector('.hero-visual__stack');

    if (!isMobileLayout() && heroSection && heroVisualStack) {
      document.addEventListener(
        'mousemove',
        (e) => {
          const rect = heroSection.getBoundingClientRect();
          const w = Math.max(1, rect.width);
          const h = Math.max(1, rect.height);
          const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / w));
          const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / h));

          window.gsap.to(heroVisualStack, {
            x: (nx - 0.5) * 12,
            y: (ny - 0.5) * 10,
            duration: 1.35,
            ease: 'power2.out',
          });
        },
        { passive: true }
      );
    }

    if (!isMobileLayout() && heroInner && window.ScrollTrigger) {
      window.gsap.to(heroInner, {
        y: -48,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.65,
        },
      });
    }
  } else {
    // Reduced motion: force visible states
    document.querySelectorAll('.hero-established,.hero-desc,.hero-cta').forEach((el) => el && (el.style.opacity = '1'));
    document.querySelectorAll('.hero-title-line span').forEach((el) => (el.style.transform = 'translateY(0%)'));
  }

  const heroVisual = document.querySelector('.hero-visual');
  const finePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let heroGlobeActive = true;

  if (heroVisual) {
    const heroGlobeIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          heroGlobeActive = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    heroGlobeIo.observe(heroVisual);

    initHeroGlobe({
      container: heroVisual,
      glowEl: heroVisual,
      reducedMotion,
      pointerControl: finePointer && !isMobileLayout(),
      isActive: () => heroGlobeActive,
    });
  }

  // Background canvas (2D): gentle ASCII layer over CSS grid/dots.
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink')?.trim() || '#111';
  const cyan = getComputedStyle(document.documentElement).getPropertyValue('--cyan')?.trim() || '#00b3b3';

  const heroSection = document.getElementById('hero');

  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let cell = 10;
  let W = 1;
  let H = 1;
  let active = true;

  function measureCssCanvasBox() {
    if (heroSection && isMobileLayout()) {
      const r = heroSection.getBoundingClientRect();
      return {
        cssW: Math.max(1, Math.round(r.width)),
        cssH: Math.max(1, Math.round(r.height)),
      };
    }
    return { cssW: window.innerWidth, cssH: window.innerHeight };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { cssW, cssH } = measureCssCanvasBox();
    const nextW = Math.max(1, Math.floor(cssW * dpr));
    const nextH = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      W = nextW;
      H = nextH;
      const cellBase = isMobileLayout() ? 14 : 10;
      cell = Math.max(8, Math.floor(cellBase * dpr));
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
    }
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  mqMobileLayout.addEventListener('change', resize);

  if (heroSection && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => resize());
    ro.observe(heroSection);
  }

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

  function field(nx, ny, t) {
    // A small deterministic signal field (no allocations).
    const a = Math.sin(nx * 9.0 + t * 0.55) * 0.65 + Math.cos(ny * 7.0 - t * 0.35) * 0.35;
    const b = Math.sin((nx + ny) * 10.0 + t * 0.25) * 0.35;
    const c = Math.cos((nx * 3.0 - ny * 4.0) + t * 0.15) * 0.25;
    return a + b + c;
  }

  function draw(nowMs) {
    const t = nowMs * 0.001;

    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    ctx.font = `${Math.floor(cell * 0.92)}px "Inter", system-ui, sans-serif`;

    // Soft falloff so the copy stays crisp.
    const cx = W * 0.44;
    const cy = H * 0.46;
    const fall = Math.min(W, H) * 0.58;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * cell;
        const py = y * cell;
        const nx = x / Math.max(1, cols);
        const ny = y / Math.max(1, rows);

        const v = field(nx, ny, t);
        const idx = Math.floor(((v + 1.6) / 3.2) * (HERO_ASCII.length - 1));
        const ch = HERO_ASCII[Math.max(0, Math.min(HERO_ASCII.length - 1, idx))];

        const dist = Math.hypot(px - cx, py - cy);
        const fade = 1.0 - Math.min(1, dist / fall);
        const a = (0.03 + ((v + 1.6) / 3.2) * 0.08) * (0.15 + fade * 0.85);

        // Sparse sampling keeps it subtle + fast.
        const sampleStride = isMobileLayout() ? 3 : 2;
        if ((x + y) % sampleStride !== 0 && a < 0.07) continue;

        const isAccent = (x * 13 + y * 7) % 37 === 0;
        ctx.fillStyle = isAccent ? `rgba(26,107,92,${a * 0.85})` : `rgba(10,10,10,${a})`;
        ctx.fillText(ch, px, py);
      }
    }

    // A few drifting "blocks" to suggest kocke without stealing focus.
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = cyan;
    const s = Math.max(10, Math.floor(18 * dpr));
    const bx = (Math.sin(t * 0.28) * 0.5 + 0.5) * (W - s * 6) + s * 2;
    const by = (Math.cos(t * 0.22) * 0.5 + 0.5) * (H - s * 6) + s * 2;
    ctx.strokeRect(Math.floor(bx), Math.floor(by), s * 2, s * 2);
    ctx.strokeRect(Math.floor(bx + s * 2.6), Math.floor(by + s * 1.4), s * 1.2, s * 1.2);
    ctx.restore();
  }

  if (reducedMotion) {
    draw(0);
    return;
  }

  loop.subscribe(({ now }) => {
    if (!active) return;
    draw(now);
  });
}

