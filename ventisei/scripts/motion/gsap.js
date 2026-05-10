export function initGsap() {
  if (!window.gsap) {
    console.warn('[Ventisei] GSAP not loaded; motion effects are disabled.');
    return;
  }
  if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  // Defaults (restrained, architectural)
  window.gsap.defaults({
    ease: 'power3.out',
    duration: 1,
  });
}

