import { initLenis } from './motion/lenis.js';
import { initGsap } from './motion/gsap.js';
import { initSideMarkers } from './motion/sideMarkers.js';
import { initNavScroll } from './motion/navScroll.js';
import { initHero } from './scenes/hero.js';
import { initMarquee } from './motion/marquee.js';
import { initArchiveHoverShaders } from './scenes/archiveHover.js';
import { initReveals } from './motion/reveals.js';
import { initAsciiBlog } from './asciiBlog.js';
import { initAsciiAbout } from './asciiAbout.js';
import { initMethodScroll } from './motion/methodScroll.js';
import { initServicesHorizontal } from './motion/servicesHorizontal.js';
import { initPortfolioFilters } from './portfolioFilter.js';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

// Boot
initGsap();

const reducedMotion = prefersReducedMotion();

const lenis = initLenis({ enabled: !reducedMotion });

initNavScroll();
initSideMarkers({ scroller: lenis ?? window });
initMarquee({ scroller: lenis?.scroller ?? window, reducedMotion });

initHero({ reducedMotion });
initArchiveHoverShaders({ reducedMotion });
initAsciiBlog({ reducedMotion });
initAsciiAbout({ reducedMotion });
initMethodScroll({ reducedMotion, lenis });
initServicesHorizontal({ reducedMotion });
initPortfolioFilters();
initReveals({ reducedMotion });

