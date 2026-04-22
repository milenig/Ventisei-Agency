import { loop } from '../webgl/core/loop.js';

export function initArchiveHoverShaders({ reducedMotion }) {
  if (reducedMotion) return;
  const canvases = Array.from(document.querySelectorAll('.archive-shader'));
  if (!canvases.length) return;

  // Lightweight 2D shader-like effect using Canvas2D (no extra WebGL contexts)
  // until we can consolidate into a shared WebGL renderer.
  canvases.forEach((canvas, idx) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const H = Math.max(1, Math.floor(parent.clientHeight * dpr));
      if (w === W && h === H) return;
      w = W;
      h = H;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = parent.clientWidth + 'px';
      canvas.style.height = parent.clientHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let mx = 0.5, my = 0.5;
    const tile = canvas.closest('.archive-tile') || canvas.parentElement;
    tile?.addEventListener(
      'mousemove',
      (e) => {
        const rect = canvas.getBoundingClientRect();
        mx = (e.clientX - rect.left) / rect.width;
        my = (e.clientY - rect.top) / rect.height;
      },
      { passive: true }
    );

    const seed = (idx + 1) * 0.37;
    loop.subscribe(({ now }) => {
      resize();
      const t = now * 0.0006;
      ctx.clearRect(0, 0, w, h);

      // Brutalist micro-grid + cyan pulse field
      const g = 18;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += g) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }

      const cx = mx * w;
      const cy = my * h;
      const r = Math.max(w, h) * (0.35 + 0.05 * Math.sin(t + seed));
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(26,107,92,0.16)');
      grad.addColorStop(0.35, 'rgba(26,107,92,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
  });
}

