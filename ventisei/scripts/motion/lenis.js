export function initLenis({ enabled }) {
  if (!enabled) return null;
  if (!window.Lenis) return null;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    smoothTouch: false,
  });

  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);

  if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    lenis.on('scroll', window.ScrollTrigger.update);

    window.gsap.ticker.lagSmoothing(0);
    window.gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    window.ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    window.ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    window.ScrollTrigger.defaults({ scroller: document.documentElement });
    window.ScrollTrigger.refresh();
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  lenis.scroller = {
    scrollTo: (target) => lenis.scrollTo(target, { immediate: false }),
  };

  return lenis;
}
