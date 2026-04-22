import { loop } from '../webgl/core/loop.js';

export function initMarquee({ reducedMotion }) {
  const marquee = document.getElementById('marquee-1');
  if (!marquee || reducedMotion) return;

  let pos = 0;
  let speed = 0.5;
  let scrollVel = 0;
  let lastScroll = window.scrollY;

  window.addEventListener(
    'scroll',
    () => {
      const curr = window.scrollY;
      scrollVel = (curr - lastScroll) * 0.1;
      lastScroll = curr;
    },
    { passive: true }
  );

  loop.subscribe(() => {
    pos -= speed + scrollVel * 0.5;
    const totalW = marquee.scrollWidth / 2;
    if (Math.abs(pos) >= totalW) pos = 0;
    marquee.style.transform = `translateX(${pos}px)`;
    scrollVel *= 0.92;
  });
}

