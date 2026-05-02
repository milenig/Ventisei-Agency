/** Split lead copy into word spans for scroll-scrubbed opacity; keeps strong as one unit. */
function wrapAboutLeadWords(paragraph) {
  const textNodes = [];
  const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, null);
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  textNodes.forEach((node) => {
    if (!node.parentNode || !paragraph.contains(node)) return;

    const parent = node.parentNode;
    if (parent.tagName === 'STRONG') {
      const span = document.createElement('span');
      span.className = 'about-lead__word';
      parent.parentNode.insertBefore(span, parent);
      span.appendChild(parent);
      return;
    }

    const text = node.textContent;
    const parts = text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    let hasWordSpans = false;
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        hasWordSpans = true;
        const span = document.createElement('span');
        span.className = 'about-lead__word';
        span.textContent = part;
        frag.appendChild(span);
      }
    });
    if (hasWordSpans) node.parentNode.replaceChild(frag, node);
  });
}

export function initReveals({ reducedMotion }) {
  const motionEls =
    '.reveal-up, .archive-tile, .service-block, .method-col, .testimonial, .blog-card';

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    document
      .querySelectorAll(motionEls + ', .reveal-scrub, .section-head--editorial .section-head-top')
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    document.querySelectorAll('.draw-line').forEach((l) => l.classList.add('drawn'));
    return;
  }

  document.querySelectorAll('.about-lead--scroll-reveal').forEach(wrapAboutLeadWords);

  window.gsap.set(motionEls, {
    opacity: 0,
    y: 40,
  });

  window.gsap.set('.section-head--editorial .section-head-top', {
    opacity: 0,
    y: 22,
  });

  const mm = window.gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 769px)',
      isMobile: '(max-width: 768px)',
    },
    () => {
      window.gsap.utils.toArray('.reveal-scrub').forEach((title) => {
        const head = title.closest('.section-head');
        window.gsap.fromTo(
          title,
          { opacity: 0.14, y: 38 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: head || title,
              start: 'top 88%',
              end: 'top 50%',
              scrub: 0.85,
            },
          }
        );
      });

      window.gsap.utils.toArray('.section-head--editorial').forEach((head) => {
        const top = head.querySelector('.section-head-top');
        if (!top) return;
        window.gsap.to(top, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: head, start: 'top 86%', toggleActions: 'play none none none' },
        });
      });

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

      window.gsap.utils.toArray('.about-lead--scroll-reveal').forEach((el) => {
        const words = el.querySelectorAll('.about-lead__word');
        if (!words.length) return;
        window.gsap.to(words, {
          opacity: 1,
          ease: 'none',
          stagger: { each: 0.055, ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 55%',
            scrub: 0.75,
          },
        });
      });

      const methodLoops = new Map();

      function startBlueprint(svg) {
        if (!svg || methodLoops.has(svg)) return;

        const accents = svg.querySelectorAll('[stroke="var(--cyan)"], [fill^="rgba(26,107,92"]');
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
        const accents = svg.querySelectorAll('[stroke="var(--cyan)"], [fill^="rgba(26,107,92"]');
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
