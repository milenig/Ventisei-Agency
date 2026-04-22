export function initReveals({ reducedMotion }) {
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    document
      .querySelectorAll(
        '.reveal-up, .archive-tile, .service-block, .method-col, .testimonial, .blog-card'
      )
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    document.querySelectorAll('.draw-line').forEach((l) => l.classList.add('drawn'));
    return;
  }

  // Baseline hidden state (for elements that don't already have it)
  window.gsap.set('.reveal-up, .archive-tile, .service-block, .method-col, .testimonial, .blog-card', {
    opacity: 0,
    y: 40,
  });

  const mm = window.gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 769px)',
      isMobile: '(max-width: 768px)',
    },
    () => {
      window.gsap.utils.toArray('.archive-tile').forEach((el, i) => {
        window.gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: i * 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      window.gsap.utils.toArray('.service-block').forEach((el, i) => {
        window.gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: i * 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      window.gsap.utils.toArray('.blog-card').forEach((el, i) => {
        window.gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      window.gsap.utils.toArray('.reveal-up').forEach((el) => {
        window.gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      // Blueprint stroke draw
      const methodLoops = new Map();

      function startBlueprint(svg) {
        if (!svg || methodLoops.has(svg)) return;

        const accents = svg.querySelectorAll('[stroke="var(--cyan)"], [fill^="rgba(0,179,179"]');
        const floatTween = window.gsap.to(svg, {
          y: -2,
          duration: 2.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        const pulseTween = accents.length
          ? window.gsap.to(accents, {
              opacity: 0.55,
              duration: 1.15,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              stagger: 0.06,
            })
          : null;

        methodLoops.set(svg, [floatTween, pulseTween].filter(Boolean));
      }

      function stopBlueprint(svg) {
        const tweens = methodLoops.get(svg);
        if (!tweens) return;
        tweens.forEach((t) => t.kill());
        methodLoops.delete(svg);
        window.gsap.set(svg, { clearProps: 'transform' });
        const accents = svg.querySelectorAll('[stroke="var(--cyan)"], [fill^="rgba(0,179,179"]');
        if (accents.length) window.gsap.set(accents, { clearProps: 'opacity' });
      }

      window.gsap.utils.toArray('.method-col').forEach((col) => {
        const svg = col.querySelector?.('.blueprint svg');
        const lines = col.querySelectorAll?.('.draw-line') || [];

        window.ScrollTrigger.create({
          trigger: col,
          start: 'top 80%',
          end: 'bottom 30%',
          onEnter: () => {
            lines.forEach((l) => l.classList.add('drawn'));
            startBlueprint(svg);
          },
          onEnterBack: () => {
            lines.forEach((l) => l.classList.add('drawn'));
            startBlueprint(svg);
          },
          onLeave: () => stopBlueprint(svg),
          onLeaveBack: () => stopBlueprint(svg),
        });
      });
    }
  );
}

