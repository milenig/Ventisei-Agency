import { loop } from '../webgl/core/loop.js';

const MARQUEE_ID = 'hero-brands-marquee';
const MQ_DESKTOP = '(min-width: 900px)';
const SPEED_MOBILE = 0.85;
const SPEED_DESKTOP = 1.55;

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

  const mqDesktop = window.matchMedia?.(MQ_DESKTOP) ?? { matches: false, addEventListener: () => {} };
  const resolveSpeed = () => (mqDesktop.matches ? SPEED_DESKTOP : SPEED_MOBILE);

  let pos = 0;
  let speed = resolveSpeed();
  let halfWidth = 0;

  const measure = () => {
    halfWidth = track.scrollWidth / 2;
    if (halfWidth > 0 && pos <= -halfWidth) pos += halfWidth;
  };

  const onLayoutChange = () => {
    speed = resolveSpeed();
    measure();
  };

  measure();
  window.addEventListener('resize', onLayoutChange, { passive: true });
  mqDesktop.addEventListener?.('change', onLayoutChange);

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
