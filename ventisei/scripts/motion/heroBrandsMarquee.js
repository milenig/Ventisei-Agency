import { loop } from '../webgl/core/loop.js';

const MARQUEE_ID = 'hero-brands-marquee';

export function initHeroBrandsMarquee({ reducedMotion }) {
  const track = document.getElementById(MARQUEE_ID);
  if (!track) return;

  const lists = track.querySelectorAll('.hero-brands__list');
  if (lists.length < 2) return;

  if (reducedMotion) {
    track.style.transform = 'none';
    track.classList.add('hero-brands__track--static');
    return;
  }

  let pos = 0;
  let speed = 0.45;
  let halfWidth = 0;

  const measure = () => {
    halfWidth = track.scrollWidth / 2;
    if (halfWidth > 0 && pos <= -halfWidth) pos += halfWidth;
  };

  measure();
  window.addEventListener('resize', measure, { passive: true });

  loop.subscribe(() => {
    if (halfWidth <= 0) {
      measure();
      return;
    }
    pos -= speed;
    if (pos <= -halfWidth) pos += halfWidth;
    track.style.transform = `translate3d(${pos}px,0,0)`;
  });
}
