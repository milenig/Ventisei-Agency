export function initLenis({ enabled }) {
  if (!enabled) return null;
  if (!window.Lenis) {
    // If Lenis isn't available (blocked), we still run without it.
    return null;
  }

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    smoothTouch: false,
  });

  // ScrollTrigger integration (if present)
  if (window.ScrollTrigger && window.gsap) {
    // Drive ScrollTrigger from Lenis.
    lenis.on('scroll', window.ScrollTrigger.update);

    // Lenis uses the native window scroller by default; scrollerProxy is still useful
    // to ensure ScrollTrigger reads/writes via Lenis consistently.
    window.ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return window.scrollY || document.documentElement.scrollTop || 0;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      fixedMarkers: true,
    });

    window.ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    window.ScrollTrigger.defaults({ scroller: document.documentElement });
    window.ScrollTrigger.refresh();
  }

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Expose a minimal scroller abstraction
  lenis.scroller = {
    scrollTo: (target) => lenis.scrollTo(target, { immediate: false }),
  };

  return lenis;
}

