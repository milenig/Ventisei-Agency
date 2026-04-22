export function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const onScroll = () => {
    const curr = window.scrollY;
    if (curr > 100) {
      nav.style.background = 'rgba(240, 237, 232, 0.92)';
      nav.style.backdropFilter = 'blur(12px)';
      nav.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
    } else {
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.borderBottom = 'none';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

