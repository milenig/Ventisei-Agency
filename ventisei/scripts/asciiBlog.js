import { loop } from './webgl/core/loop.js';

const PALETTE = ' .`:;~-_=+<>^*#%@';

/**
 * Jednostavna „ASCII shader” animacija na canvasu 2D — talasni oblik signala.
 */
export function initAsciiBlog({ reducedMotion }) {
  const canvases = document.querySelectorAll('.blog-ascii-canvas');
  if (!canvases.length) return [];

  const unsubs = [];

  canvases.forEach((canvas, canvasIdx) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cell = 8;
    const phase = canvasIdx * 1.7;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const H = Math.max(1, Math.floor(parent.clientHeight * dpr));
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      cell = Math.max(6, Math.floor(8 * dpr));
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function draw(nowMs) {
      const t = nowMs * 0.001;
      ctx.fillStyle = '#060606';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${cell * 0.95}px "Inter", system-ui, sans-serif`;
      ctx.textBaseline = 'top';

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x / cols;
          const ny = y / rows;
          const w =
            Math.sin(nx * 9 + t * 0.8 + phase) * Math.cos(ny * 7 - t * 0.6) +
            Math.sin((nx + ny) * 12 + t * 0.4 + phase * 0.3) * 0.5;
          const idx = Math.floor(((w + 1.8) / 3.6) * (PALETTE.length - 1));
          const ch = PALETTE[Math.max(0, Math.min(PALETTE.length - 1, idx))];
          const a = 0.25 + ((w + 1.8) / 3.6) * 0.75;
          ctx.fillStyle = `rgba(0, 190, 190, ${a})`;
          ctx.fillText(ch, x * cell, y * cell);
        }
      }
    }

    if (reducedMotion) {
      draw(0);
      return;
    }

    unsubs.push(
      loop.subscribe(({ now }) => {
        draw(now);
      })
    );
  });

  return unsubs;
}
