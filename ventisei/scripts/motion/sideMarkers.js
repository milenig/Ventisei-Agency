export function initSideMarkers({ scroller }) {
  const railLinks = Array.from(document.querySelectorAll('.index-link'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const rail = document.querySelector('.index-rail');
  const nav = document.getElementById('main-nav');
  if (!railLinks.length && !navLinks.length) return;

  const railSectionIds = railLinks
    .map((a) => a.getAttribute('data-section') || '')
    .filter(Boolean);

  const darkSectionIds = ['services', 'contact'];
  const darkSectionEls = darkSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const els = railSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const applyRailTheme = (onDark) => {
    if (!rail) return;
    rail.classList.toggle('is-on-dark', onDark);
  };

  /** Scrollspy: last section whose top crossed the activation line. */
  function getActiveSectionId() {
    if (!els.length) return '';
    const lineY = Math.min(window.innerHeight * 0.34, Math.max(120, window.innerHeight * 0.22));
    let activeId = els[0].id;
    for (let i = 0; i < els.length; i += 1) {
      const el = els[i];
      const top = el.getBoundingClientRect().top;
      if (top <= lineY) activeId = el.id;
    }
    return activeId;
  }

  /**
   * Theme from viewport overlap (not scrollspy id): avoids snapping when spy says "about"
   * while the user still sees a dark band (e.g. leaving Services).
   * Hysteresis: higher bar to enter dark, lower bar to leave — reduces flicker at edges.
   */
  function overlapRatioInReadingBand() {
    const vh = window.innerHeight || 1;
    const bandTop = vh * 0.28;
    const bandBottom = vh * 0.72;
    const bandH = Math.max(1, bandBottom - bandTop);
    let maxPx = 0;
    for (let i = 0; i < darkSectionEls.length; i += 1) {
      const el = darkSectionEls[i];
      const r = el.getBoundingClientRect();
      const overlap = Math.max(
        0,
        Math.min(r.bottom, bandBottom) - Math.max(r.top, bandTop)
      );
      maxPx = Math.max(maxPx, overlap);
    }
    return maxPx / bandH;
  }

  let committedDark = false;

  function updateThemeFromViewport() {
    const ratio = overlapRatioInReadingBand();
    let next = committedDark;
    if (committedDark) {
      if (ratio < 0.055) next = false;
    } else if (ratio > 0.14) {
      next = true;
    }
    if (next !== committedDark) {
      committedDark = next;
      applyRailTheme(committedDark);
      if (nav) nav.classList.toggle('is-on-dark', committedDark);
    }
  }

  let lastActiveId = '';

  function updateActiveLinks(sectionId) {
    if (!sectionId) return;
    if (sectionId !== lastActiveId) {
      lastActiveId = sectionId;
      railLinks.forEach((a) => {
        a.classList.toggle('is-active', (a.getAttribute('data-section') || '') === sectionId);
      });
      navLinks.forEach((a) => {
        a.classList.toggle('active', (a.getAttribute('href') || '') === `#${sectionId}`);
      });
    }
  }

  let rafId = 0;

  function tick() {
    rafId = 0;
    const sectionId = getActiveSectionId();
    updateActiveLinks(sectionId);
    updateThemeFromViewport();
  }

  function scheduleTick() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(tick);
  }

  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const canLenisScrollToEl =
      scroller &&
      scroller !== window &&
      typeof scroller.scrollTo === 'function';

    if (canLenisScrollToEl) scroller.scrollTo(el);
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.requestAnimationFrame(() => {
      tick();
    });
  }

  railLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('data-section');
      if (!id) return;
      e.preventDefault();
      goTo(id);
    });
  });

  navLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      e.preventDefault();
      goTo(href.slice(1));
    });
  });

  const bindScroll = () => {
    if (scroller && scroller !== window && typeof scroller.on === 'function') {
      scroller.on('scroll', scheduleTick);
    } else {
      window.addEventListener('scroll', scheduleTick, { passive: true });
    }
  };

  bindScroll();
  window.addEventListener('resize', scheduleTick, { passive: true });
  if (typeof window !== 'undefined' && 'onscrollend' in window) {
    window.addEventListener('scrollend', tick, { passive: true });
  }
  tick();
}
