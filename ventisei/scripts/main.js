import { initLenis } from './motion/lenis.js';
import { initGsap } from './motion/gsap.js';
import { initSideMarkers } from './motion/sideMarkers.js';
import { initHero } from './scenes/hero.js';
import { initMarquee } from './motion/marquee.js';
import { mountHeroBrands } from './heroBrandsMount.js';
import { initHeroBrandsMarquee } from './motion/heroBrandsMarquee.js';
import { initArchiveHoverShaders } from './scenes/archiveHover.js';
import { initReveals } from './motion/reveals.js';
import { initMethodScroll } from './motion/methodScroll.js';
import { initServicesHorizontal } from './motion/servicesHorizontal.js';
import { initContactForm } from './contactForm.js';
import { initMobileNav } from './mobileNav.js';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
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
initArchiveHoverShaders({ reducedMotion });
initMethodScroll({ reducedMotion, lenis });
initServicesHorizontal({ reducedMotion });
initReveals({ reducedMotion });
initContactForm();
