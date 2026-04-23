export function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const onScroll = () => {
    const curr = window.scrollY;
    if (curr > 100) {
      nav.style.background = 'rgba(255, 255, 255, 0.96)';
      nav.style.backdropFilter = 'blur(10px)';
      nav.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
    } else {
      nav.style.background = 'rgba(255, 255, 255, 0.92)';
      nav.style.backdropFilter = 'blur(10px)';
      nav.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

