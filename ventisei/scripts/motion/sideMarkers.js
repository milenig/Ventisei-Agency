export function initSideMarkers({ scroller }) {
  const railLinks = Array.from(document.querySelectorAll('.index-link'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if (!railLinks.length && !navLinks.length) return;

  const sections = ['hero', 'about', 'works', 'method', 'services', 'testimonials', 'blog', 'contact'];
  const els = sections.map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = sections.indexOf(entry.target.id);
        railLinks.forEach((a) => a.classList.toggle('is-active', (a.getAttribute('data-section') || '') === entry.target.id));
        navLinks.forEach((a) => a.classList.toggle('active', (a.getAttribute('href') || '') === `#${entry.target.id}`));
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

