export function initSideMarkers({ scroller }) {
  const railLinks = Array.from(document.querySelectorAll('.index-link'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const rail = document.querySelector('.index-rail');
  const nav = document.getElementById('main-nav');
  if (!railLinks.length && !navLinks.length) return;

  const sections = ['hero', 'about', 'works', 'method', 'services', 'testimonials', 'blog', 'contact'];
  const darkSections = new Set(['services', 'contact']);
  const els = sections.map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sectionId = entry.target.id;
        railLinks.forEach((a) => a.classList.toggle('is-active', (a.getAttribute('data-section') || '') === entry.target.id));
        navLinks.forEach((a) => a.classList.toggle('active', (a.getAttribute('href') || '') === `#${sectionId}`));
        const onDark = darkSections.has(sectionId);
        if (rail) rail.classList.toggle('is-on-dark', onDark);
        if (rail) rail.classList.toggle('is-hidden', sectionId === 'services');
        if (nav) nav.classList.toggle('is-on-dark', onDark);
      });
    },
    { threshold: 0.5 }
  );

  els.forEach((el) => observer.observe(el));

  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    // Lenis provides scrollTo(Element). Window also has scrollTo(), but it doesn't accept elements.
    const canLenisScrollToEl =
      scroller &&
      scroller !== window &&
      typeof scroller.scrollTo === 'function';

    if (canLenisScrollToEl) scroller.scrollTo(el);
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
}

