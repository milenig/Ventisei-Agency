export function initGsap() {
  if (!window.gsap) {
    throw new Error('GSAP not loaded. Ensure CDN scripts are included before scripts/main.js.');
  }
  if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  // Defaults (restrained, architectural)
  window.gsap.defaults({
    ease: 'power3.out',
    duration: 1,
  });
}

