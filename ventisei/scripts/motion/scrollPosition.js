/** Scroll position compatible with Lenis + native scroll. */
export function getScrollY(lenis) {
  if (lenis && Number.isFinite(lenis.scroll)) return lenis.scroll;
  if (lenis && Number.isFinite(lenis.animatedScroll)) return lenis.animatedScroll;
  return window.scrollY || document.documentElement.scrollTop || 0;
}
