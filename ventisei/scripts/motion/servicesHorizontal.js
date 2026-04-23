export function initServicesHorizontal({ reducedMotion }) {
  const section = document.getElementById('services');
  const viewport = section?.querySelector('[data-services-horizontal]');
  const track = viewport?.querySelector('.services-grid');
  const heading = section?.querySelector('.services-head');
  if (!section || !viewport || !track) return;

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    viewport.classList.remove('is-pinned');
    return;
  }

  const mm = window.gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    const getShift = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (getShift() <= 0) return undefined;
    const getIntroHold = () => Math.max(220, window.innerHeight * 0.32);
    const getHeadingTravel = () => Math.max(130, getShift() * 0.22);

    viewport.classList.add('is-pinned');
    window.gsap.set(track, { x: 0 });
    if (heading) window.gsap.set(heading, { y: 0, opacity: 1 });

    const timeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getIntroHold() + getShift()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    timeline.to(track, { x: 0, duration: () => getIntroHold(), ease: 'none' });
    if (heading) {
      timeline.to(
        heading,
        {
          y: -72,
          opacity: 0.38,
          duration: () => getHeadingTravel(),
          ease: 'none',
        },
        getIntroHold()
      );
    }
    timeline.to(track, { x: () => -getShift(), duration: () => getShift(), ease: 'none' });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      window.gsap.set(track, { clearProps: 'transform' });
      if (heading) window.gsap.set(heading, { clearProps: 'transform,opacity' });
      viewport.classList.remove('is-pinned');
    };
  });

  mm.add('(max-width: 899px)', () => {
    viewport.classList.remove('is-pinned');
    window.gsap.set(track, { clearProps: 'transform' });
  });
}
