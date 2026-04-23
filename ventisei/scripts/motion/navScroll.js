export function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const onScroll = () => {
    const curr = window.scrollY;
    const onDark = nav.classList.contains('is-on-dark');
    if (curr > 100) {
      nav.style.background = onDark ? 'rgba(11, 11, 12, 0.72)' : 'rgba(255, 255, 255, 0.96)';
      nav.style.backdropFilter = 'blur(10px)';
      nav.style.borderBottom = onDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)';
    } else {
      nav.style.background = onDark ? 'rgba(11, 11, 12, 0.62)' : 'rgba(255, 255, 255, 0.92)';
      nav.style.backdropFilter = 'blur(10px)';
      nav.style.borderBottom = onDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

