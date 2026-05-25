const MQ_DESKTOP = '(min-width: 900px)';
const DARK_SELECTOR = '[data-nav-theme="dark"]';

function applyRailTheme(onDark) {
  const rail = document.querySelector('.index-rail');
  const nav = document.getElementById('main-nav');
  if (rail) rail.classList.toggle('is-on-dark', onDark);
  if (nav) nav.classList.toggle('is-on-dark', onDark);
}

/** Sample page background beside the rail (desktop): theme flips when menu leaves a section. */
function isMenuBesideDarkSection() {
  const links = document.querySelector('.index-links');
  const rail = document.querySelector('.index-rail');
  if (!links || !rail) return false;

  const r = links.getBoundingClientRect();
  const x = Math.min(window.innerWidth - 2, Math.max(2, r.right + 14));
  const y = Math.min(window.innerHeight - 2, Math.max(2, r.top + r.height * 0.38));

  const prev = rail.style.pointerEvents;
  rail.style.pointerEvents = 'none';
  const hit = document.elementFromPoint(x, y);
  rail.style.pointerEvents = prev;

  if (!hit) return false;
  return !!hit.closest(DARK_SELECTOR);
}

function overlapRatioInReadingBand(darkSectionEls) {
  const vh = window.innerHeight || 1;
  const bandTop = vh * 0.28;
  const bandBottom = vh * 0.72;
  const bandH = Math.max(1, bandBottom - bandTop);
  let maxPx = 0;
  for (let i = 0; i < darkSectionEls.length; i += 1) {
    const el = darkSectionEls[i];
    const rect = el.getBoundingClientRect();
    const overlap = Math.max(
      0,
      Math.min(rect.bottom, bandBottom) - Math.max(rect.top, bandTop)
    );
    maxPx = Math.max(maxPx, overlap);
  }
  return maxPx / bandH;
}

/**
 * Desktop: theme follows the section edge beside the rail.
 * Mobile: overlap band with hysteresis (top bar / drawer).
 */
export function initRailTheme({ scroller } = {}) {
  const rail = document.querySelector('.index-rail');
  if (!rail) return;

  const mqDesktop = window.matchMedia(MQ_DESKTOP);
  const darkSectionEls = Array.from(document.querySelectorAll(DARK_SELECTOR));

  let committedDark = false;
  let mobileCommittedDark = false;

  function updateDesktopTheme() {
    const next = isMenuBesideDarkSection();
    if (next !== committedDark) {
      committedDark = next;
      applyRailTheme(committedDark);
    }
  }

  function updateMobileTheme() {
    const ratio = overlapRatioInReadingBand(darkSectionEls);
    let next = mobileCommittedDark;
    if (mobileCommittedDark) {
      if (ratio < 0.055) next = false;
    } else if (ratio > 0.14) {
      next = true;
    }
    if (next !== mobileCommittedDark) {
      mobileCommittedDark = next;
      applyRailTheme(mobileCommittedDark);
    }
  }

  function tick() {
    if (mqDesktop.matches) {
      updateDesktopTheme();
    } else {
      updateMobileTheme();
    }
  }

  function onMqChange() {
    committedDark = false;
    mobileCommittedDark = false;
    tick();
  }

  let rafId = 0;
  function scheduleTick() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      tick();
    });
  }

  const bindScroll = () => {
    if (scroller && scroller !== window && typeof scroller.on === 'function') {
      scroller.on('scroll', scheduleTick);
    } else {
      window.addEventListener('scroll', scheduleTick, { passive: true });
    }
  };

  mqDesktop.addEventListener('change', onMqChange);
  bindScroll();
  window.addEventListener('resize', scheduleTick, { passive: true });
  if (typeof window !== 'undefined' && 'onscrollend' in window) {
    window.addEventListener('scrollend', tick, { passive: true });
  }
  tick();
}
