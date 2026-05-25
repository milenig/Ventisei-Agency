import { initRailTheme } from './railTheme.js';

const MQ_DESKTOP = '(min-width: 900px)';

function initRailHoverMarker(railLinks) {
  const linksWrap = document.querySelector('.index-links');
  if (!linksWrap || !railLinks.length) return;

  const mqDesktop = window.matchMedia(MQ_DESKTOP);
  let marker = linksWrap.querySelector('.index-rail-marker');
  if (!marker) {
    marker = document.createElement('span');
    marker.className = 'index-rail-marker';
    marker.setAttribute('aria-hidden', 'true');
    linksWrap.prepend(marker);
  }

  let isHovering = false;

  function placeMarkerOnLink(link) {
    if (!mqDesktop.matches || !link) return;
    const y = link.offsetTop + link.offsetHeight / 2;
    marker.style.transform = `translate3d(0, ${y}px, 0) translateY(-50%)`;
    marker.classList.add('is-visible');
  }

  function snapMarkerToActive() {
    if (!mqDesktop.matches) {
      marker.classList.remove('is-visible');
      return;
    }
    const active = railLinks.find((a) => a.classList.contains('is-active'));
    if (active) placeMarkerOnLink(active);
    else marker.classList.remove('is-visible');
  }

  railLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      if (!mqDesktop.matches) return;
      isHovering = true;
      linksWrap.classList.add('is-rail-hover');
      placeMarkerOnLink(link);
    });
  });

  linksWrap.addEventListener('mouseleave', () => {
    if (!mqDesktop.matches) return;
    isHovering = false;
    linksWrap.classList.remove('is-rail-hover');
    snapMarkerToActive();
  });

  mqDesktop.addEventListener('change', () => {
    isHovering = false;
    linksWrap.classList.remove('is-rail-hover');
    snapMarkerToActive();
  });

  window.addEventListener('resize', () => {
    if (!mqDesktop.matches) return;
    if (isHovering) return;
    snapMarkerToActive();
  }, { passive: true });

  return { snapMarkerToActive, isHovering: () => isHovering };
}

export function initSideMarkers({ scroller }) {
  const railLinks = Array.from(document.querySelectorAll('.index-link'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if (!railLinks.length && !navLinks.length) return;

  const railMarker = initRailHoverMarker(railLinks);

  const railSectionIds = railLinks
    .map((a) => a.getAttribute('data-section') || '')
    .filter(Boolean);

  const els = railSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  initRailTheme({ scroller });

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
      if (railMarker && !railMarker.isHovering()) {
        railMarker.snapMarkerToActive();
      }
    }
  }

  let rafId = 0;

  function tick() {
    rafId = 0;
    const sectionId = getActiveSectionId();
    updateActiveLinks(sectionId);
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
  if (railMarker) {
    window.requestAnimationFrame(() => railMarker.snapMarkerToActive());
  }
}
