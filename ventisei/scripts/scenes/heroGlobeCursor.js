import { loop } from '../webgl/core/loop.js';

/**
 * Custom pointer for the hero globe panel (desktop / fine pointer only).
 * @param {object} opts
 * @param {HTMLElement | null} opts.host
 * @param {boolean} opts.enabled
 */
export function initHeroGlobeCursor({ host, enabled }) {
  if (!enabled || !host) return () => {};

  const root = document.createElement('div');
  root.className = 'hero-cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <span class="hero-cursor__ring"></span>
    <span class="hero-cursor__dot"></span>
  `;
  document.body.appendChild(root);

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let targetActive = 0;
  let active = 0;
  let unsub = null;

  const pointerInsideHost = (e) => {
    const rect = host.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  };

  const onPointerMove = (e) => {
    if (pointerInsideHost(e)) {
      targetX = e.clientX;
      targetY = e.clientY;
      targetActive = 1;
      return;
    }
    targetActive = 0;
  };

  const onPointerLeave = () => {
    targetActive = 0;
  };

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });

  unsub = loop.subscribe(({ dt }) => {
    const posSmooth = 1 - Math.exp(-16 * dt);
    const fadeSmooth = 1 - Math.exp(-12 * dt);
    x += (targetX - x) * posSmooth;
    y += (targetY - y) * posSmooth;
    active += (targetActive - active) * fadeSmooth;

    root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    root.style.opacity = active.toFixed(3);
    root.classList.toggle('is-active', active > 0.45);
  });

  return () => {
    unsub?.unsubscribe();
    document.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    root.remove();
  };
}
