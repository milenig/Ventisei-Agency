import { loop } from '../webgl/core/loop.js';

export function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    window.gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: 'power2.out' });
  };
  document.addEventListener('mousemove', onMove, { passive: true });

  // Magnetic interaction targets (subtle, restrained)
  const magneticTargets = Array.from(document.querySelectorAll('[data-magnetic], .nav-cta'));
  let mag = { x: 0, y: 0 };
  let magTarget = { x: 0, y: 0 };
  let magEl = null;

  function onMagEnter(e) {
    magEl = e.currentTarget;
  }
  function onMagLeave(e) {
    if (e.currentTarget === magEl) magEl = null;
    magTarget.x = 0;
    magTarget.y = 0;
  }
  function onMagMove(e) {
    if (!magEl) return;
    const rect = magEl.getBoundingClientRect();
    const rx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const ry = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    magTarget.x = rx * 10;
    magTarget.y = ry * 6;
  }

  magneticTargets.forEach((el) => {
    el.style.willChange = 'transform';
    el.addEventListener('mouseenter', onMagEnter);
    el.addEventListener('mouseleave', onMagLeave);
    el.addEventListener('mousemove', onMagMove, { passive: true });
  });

  const sub = loop.subscribe(() => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    mag.x += (magTarget.x - mag.x) * 0.18;
    mag.y += (magTarget.y - mag.y) * 0.18;
    if (magEl) magEl.style.transform = `translate3d(${mag.x}px, ${mag.y}px, 0)`;
  });

  // Hover + magnetic targets (data-cursor="hover" or data-magnetic)
  const hoverTargets = document.querySelectorAll('[data-cursor], a, button, .archive-tile, .service-card');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  const darkSections = document.querySelectorAll('#monolith, #manifesto');
  darkSections.forEach((s) => {
    s.addEventListener('mouseenter', () => document.body.classList.add('cursor-dark'));
    s.addEventListener('mouseleave', () => document.body.classList.remove('cursor-dark'));
  });

  // Cleanup on navigation/unload (static site safety)
  window.addEventListener('beforeunload', () => {
    document.removeEventListener('mousemove', onMove);
    sub.unsubscribe();
    magneticTargets.forEach((el) => (el.style.transform = ''));
  });
}

