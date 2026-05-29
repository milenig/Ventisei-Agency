import { initLenis } from './motion/lenis.js';
import { initGsap } from './motion/gsap.js';
import { initSideMarkers } from './motion/sideMarkers.js';
import { initHero } from './scenes/hero.js';
import { initMarquee } from './motion/marquee.js';
import { mountHeroBrands } from './heroBrandsMount.js';
import { initHeroBrandsMarquee } from './motion/heroBrandsMarquee.js';
import { initReveals } from './motion/reveals.js';
import { initContactForm } from './contactForm.js';
import { initMobileNav } from './mobileNav.js';
import { initArchiveHoverShaders } from './scenes/archiveHover.js';
import { initMethodScroll } from './motion/methodScroll.js';
import { initServicesHorizontal } from './motion/servicesHorizontal.js';

/**
 * Windows often reports prefers-reduced-motion when "Animation effects" is off.
 * Keep full motion on fine-pointer desktop to match Mac; still respect on touch/mobile.
 */
function prefersReducedMotion() {
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const desktopFine =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    window.matchMedia('(min-width: 900px)').matches;
  return !desktopFine;
}

function refreshMotionLayout() {
  window.ScrollTrigger?.refresh();
}

function initScrollSections({ reducedMotion, lenis }) {
  if (reducedMotion) return;

  initArchiveHoverShaders({ reducedMotion });
  initMethodScroll({ reducedMotion, lenis });
  initServicesHorizontal({ reducedMotion, lenis });

  requestAnimationFrame(() => {
    refreshMotionLayout();
    requestAnimationFrame(refreshMotionLayout);
  });
}

function boot() {
  initGsap();

  const reducedMotion = prefersReducedMotion();
  const lenis = initLenis({ enabled: !reducedMotion });

  initMobileNav();
  initSideMarkers({ scroller: lenis ?? window });
  initMarquee({ scroller: lenis?.scroller ?? window, reducedMotion });

  mountHeroBrands();
  initHero({ reducedMotion });
  initHeroBrandsMarquee({ reducedMotion });
  initReveals({ reducedMotion });
  initContactForm();

  initScrollSections({ reducedMotion, lenis });

  if (document.fonts?.ready) {
    document.fonts.ready.then(refreshMotionLayout).catch(() => {});
  }

  window.addEventListener('load', refreshMotionLayout, { once: true });
  window.addEventListener(
    'resize',
    () => requestAnimationFrame(refreshMotionLayout),
    { passive: true }
  );
}

function waitForGsap(maxFrames = 120) {
  if (window.gsap) {
    boot();
    return;
  }
  let frames = 0;
  const tick = () => {
    frames += 1;
    if (window.gsap) boot();
    else if (frames < maxFrames) requestAnimationFrame(tick);
    else {
      console.warn('[Ventisei] GSAP not loaded; running without scroll motion.');
      boot();
    }
  };
  requestAnimationFrame(tick);
}

waitForGsap();
