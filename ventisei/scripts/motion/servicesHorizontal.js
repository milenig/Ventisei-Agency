export function initServicesHorizontal({ reducedMotion }) {
  const section = document.getElementById('services');
  const viewport = section?.querySelector('[data-feature-viewport]');
  const track = section?.querySelector('[data-feature-track]');
  if (!section || !viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.service-card'));
  const mqlDesktop = window.matchMedia?.('(min-width: 900px)');

  if (reducedMotion) {
    section.classList.add('is-entered');
    track.style.transform = '';
    cards.forEach((c) => c.classList.remove('is-active'));
    return;
  }

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  let rafId = 0;
  let currentX = 0;
  let targetX = 0;
  let activeIndex = -1;
  let isActive = false;
  let resizeRaf = 0;
  let edgePadPx = 0;
  let lastShiftPx = 0;
  let lastScrollPx = 0;

  function applyDynamicScrollHeight({ shiftPx }) {
    const holdPx = Math.max(220, window.innerHeight * 0.28);
    // Total additional scroll beyond 1 viewport height.
    const scrollPx = Math.ceil(shiftPx + holdPx);
    if (scrollPx === lastScrollPx) return;
    lastScrollPx = scrollPx;
    section.style.setProperty('--servicesScroll', `${scrollPx}px`);
  }

  function updateEdgePadding() {
    if (!cards.length) return;
    // Make sure the first and last cards can reach the center of the viewport.
    const cardW = cards[0].offsetWidth || cards[0].getBoundingClientRect().width;
    const pad = Math.max(24, (viewport.clientWidth - cardW) * 0.5);
    edgePadPx = pad;
    track.style.paddingLeft = `${pad}px`;
    track.style.paddingRight = `${pad}px`;
  }

  function setActiveCard() {
    if (!cards.length) return;
    const v = viewport.getBoundingClientRect();
    const viewportCenter = v.left + v.width * 0.5;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < cards.length; i += 1) {
      const r = cards[i].getBoundingClientRect();
      const center = r.left + r.width * 0.5;
      const dist = Math.abs(center - viewportCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    if (bestIdx === activeIndex) return;
    activeIndex = bestIdx;
    for (let i = 0; i < cards.length; i += 1) {
      cards[i].classList.toggle('is-active', i === activeIndex);
    }
  }

  function computeTargetX() {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);

    updateEdgePadding();
    const shift = Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (shift !== lastShiftPx) {
      lastShiftPx = shift;
      applyDynamicScrollHeight({ shiftPx: shift });
    }
    const raw = (window.scrollY - sectionTop) / scrollRange;
    const progress = clamp01(raw);

    targetX = -progress * shift;

    if (progress > 0.02) section.classList.add('is-entered');
  }

  function tick() {
    if (!isActive || !mqlDesktop?.matches) return;

    computeTargetX();

    // Lower = smoother / less "locked" feeling.
    const eased = 0.07;
    currentX = lerp(currentX, targetX, eased);
    track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;

    setActiveCard();

    rafId = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function resetForMobile() {
    isActive = false;
    stop();
    section.classList.add('is-entered');
    track.style.transform = '';
    track.style.paddingLeft = '';
    track.style.paddingRight = '';
    section.style.removeProperty('--servicesScroll');
    currentX = 0;
    targetX = 0;
    activeIndex = -1;
    cards.forEach((c) => c.classList.remove('is-active'));
  }

  function startForDesktop() {
    isActive = true;
    stop();
    currentX = 0;
    targetX = 0;
    updateEdgePadding();
    const shift = Math.max(0, track.scrollWidth - viewport.clientWidth);
    applyDynamicScrollHeight({ shiftPx: shift });
    computeTargetX();
    currentX = targetX;
    track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
    setActiveCard();
    rafId = window.requestAnimationFrame(tick);
  }

  function onModeChange() {
    if (mqlDesktop?.matches) startForDesktop();
    else resetForMobile();
  }

  // Only animate while the section is actually on screen.
  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting && mqlDesktop?.matches) startForDesktop();
      else {
        isActive = false;
        stop();
      }
    },
    { threshold: 0.08 }
  );
  io.observe(section);

  // Ensure correct initial state (especially if page loads mid-scroll).
  onModeChange();

  window.addEventListener('resize', () => {
    if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = 0;
      onModeChange();
      if (mqlDesktop?.matches) {
        updateEdgePadding();
        const shift = Math.max(0, track.scrollWidth - viewport.clientWidth);
        applyDynamicScrollHeight({ shiftPx: shift });
        computeTargetX();
      }
    });
  }, { passive: true });
  window.addEventListener('orientationchange', onModeChange, { passive: true });

  if (mqlDesktop?.addEventListener) {
    mqlDesktop.addEventListener('change', onModeChange);
  } else if (mqlDesktop?.addListener) {
    mqlDesktop.addListener(onModeChange);
  }
}
