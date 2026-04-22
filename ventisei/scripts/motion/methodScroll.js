export function initMethodScroll({ reducedMotion }) {
  const root = document.querySelector('.methodScroll');
  if (!root) return;

  const section = document.getElementById('method');
  const panel = root.querySelector('.methodScroll-panel');
  const visualItems = Array.from(root.querySelectorAll('.methodScroll-visualItem'));
  const tabs = Array.from(root.querySelectorAll('.methodScroll-tab[data-step]'));

  if (!section || !panel || !visualItems.length || !tabs.length) return;

  function setActive(step) {
    const s = String(step);
    visualItems.forEach((el) => el.classList.toggle('is-active', (el.getAttribute('data-step') || '') === s));
    tabs.forEach((btn) => {
      const isActive = (btn.getAttribute('data-step') || '') === s;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Ensure blueprint draw animation kicks in per step.
    const activeSvg = root.querySelector(`.methodScroll-visualItem[data-step="${s}"] svg`);
    activeSvg?.querySelectorAll?.('.draw-line')?.forEach((l) => l.classList.add('drawn'));
  }

  // Reduced motion: show all visuals stacked and stop here.
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    visualItems.forEach((el) => el.classList.add('is-active'));
    setActive('1');
    return;
  }

  // Activate centered fixed panel only while section is in view.
  const st = window.ScrollTrigger.create({
    trigger: section,
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => section.classList.add('is-active'),
    onEnterBack: () => section.classList.add('is-active'),
    onLeave: () => section.classList.remove('is-active'),
    onLeaveBack: () => section.classList.remove('is-active'),
  });

  // Scrub step changes while section scrolls (panel stays fixed/centered).
  window.ScrollTrigger.create({
    trigger: root,
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const idx = p < 0.34 ? 1 : p < 0.68 ? 2 : 3;
      setActive(String(idx));
    },
  });

  function scrollToStep(step) {
    const s = String(step);
    // Jump within the methodScroll range.
    const trig = window.ScrollTrigger.getAll().find((x) => x?.vars?.trigger === root && x.vars?.scrub);
    const range = trig || null;
    if (!range) return;
    const p = s === '1' ? 0.0 : s === '2' ? 0.34 : 0.68;
    const y = range.start + (range.end - range.start) * p;
    window.scrollTo({ top: y + 2, behavior: 'smooth' });
  }

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-step') || '1';
      scrollToStep(step);
    });
  });
}

