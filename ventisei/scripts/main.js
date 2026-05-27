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

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function scheduleIdle(task, timeout = 2800) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout });
    return;
  }
  window.setTimeout(task, 180);
}

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

if (!reducedMotion) {
  scheduleIdle(async () => {
    const [{ initArchiveHoverShaders }, { initMethodScroll }, { initServicesHorizontal }] =
      await Promise.all([
        import('./scenes/archiveHover.js'),
        import('./motion/methodScroll.js'),
        import('./motion/servicesHorizontal.js'),
      ]);

    initArchiveHoverShaders({ reducedMotion });
    initMethodScroll({ reducedMotion, lenis });
    initServicesHorizontal({ reducedMotion });
  });
}
