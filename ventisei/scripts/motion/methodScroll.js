import { METHOD_PROCESS_STEPS, METHOD_TEXT_PROGRESS_WINDOWS } from '../data/methodProcessSteps.js';
import {
  textWindowStyle,
  stepIndexInTextWindows,
  textWindowCenterProgress,
} from './methodProgressMap.js';
import { morphProcessVisual, applyProcessVisualInstantToSvg } from '../scenes/processGeometry.js';

const MQ_MOBILE_LAYOUT = '(max-width: 899px)';

function hydrateStepsFromData(root) {
  const articles = Array.from(root.querySelectorAll('.methodProcess-step'));
  METHOD_PROCESS_STEPS.forEach((step, i) => {
    const el = articles[i];
    if (!el) return;
    const roman = el.querySelector('.methodProcess-roman');
    const title = el.querySelector('.methodProcess-stepTitle');
    const body = el.querySelector('.methodProcess-stepBody');
    if (roman) roman.textContent = step.roman;
    if (title) title.id = `method-step-${step.id}-title`;
    if (title) title.textContent = step.title;
    if (body) body.textContent = step.description;
    el.dataset.step = step.id;
    el.setAttribute('aria-labelledby', `method-step-${step.id}-title`);
    el.id = `method-step-${step.id}`;
  });
}

function cloneDiagramSvg(templateSvg, idPrefix) {
  const svg = templateSvg.cloneNode(true);
  svg.removeAttribute('id');
  svg.querySelectorAll('[id]').forEach((node) => {
    node.id = `${idPrefix}-${node.id}`;
  });
  svg.setAttribute('class', 'processGeometry-svg processGeometry-svg--mobile');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

function buildMobileProcessStack(root) {
  const stack = root.querySelector('[data-method-mobile-stack]');
  const shell = root.querySelector('.methodProcess-mobileOnly');
  const templateSvg = document.querySelector('#process-geometry-svg');
  if (!stack || !shell || !templateSvg) return;

  stack.replaceChildren();

  METHOD_PROCESS_STEPS.forEach((step, i) => {
    const idPrefix = `mm${i}`;
    const svg = cloneDiagramSvg(templateSvg, idPrefix);
    applyProcessVisualInstantToSvg(svg, step.visualIndex, idPrefix);

    const row = document.createElement('article');
    row.className = 'method-mobile-step reveal-up';
    row.setAttribute('aria-labelledby', `method-mobile-${step.id}-title`);

    const visualWrap = document.createElement('div');
    visualWrap.className = 'method-mobile-visualWrap';

    const frame = document.createElement('div');
    frame.className = 'methodProcess-frame methodProcess-frame--mobile';
    const visuals = document.createElement('div');
    visuals.className = 'methodProcess-visuals';
    const host = document.createElement('div');
    host.className = 'methodProcess-visualHost';
    host.appendChild(svg);
    visuals.appendChild(host);
    frame.appendChild(visuals);
    visualWrap.appendChild(frame);

    const copy = document.createElement('div');
    copy.className = 'method-mobile-copy';

    const title = document.createElement('h3');
    title.className = 'method-mobile-title';
    title.id = `method-mobile-${step.id}-title`;
    title.textContent = step.title;

    const desc = document.createElement('p');
    desc.className = 'method-mobile-desc';
    desc.textContent = step.description;

    copy.append(title, desc);
    row.append(visualWrap, copy);
    stack.appendChild(row);
  });

  shell.removeAttribute('hidden');
  shell.classList.add('is-visible');
  shell.setAttribute('aria-hidden', 'false');
}

function teardownMobileShell(root) {
  const stack = root.querySelector('[data-method-mobile-stack]');
  const shell = root.querySelector('.methodProcess-mobileOnly');
  if (stack) stack.replaceChildren();
  if (shell) {
    shell.setAttribute('hidden', '');
    shell.classList.remove('is-visible');
    shell.setAttribute('aria-hidden', 'true');
  }
}

function runVisualPresence({ root, frame, targetIdx }) {
  const step = METHOD_PROCESS_STEPS[targetIdx];
  if (!step) return null;

  if (!window.gsap) {
    morphProcessVisual(String(step.visualIndex + 1), { root, instant: true });
    return null;
  }

  return window.gsap
    .timeline({ defaults: { overwrite: 'auto' } })
    .to(frame, { opacity: 0, duration: 0.22, ease: 'power2.in' })
    .call(() => morphProcessVisual(String(step.visualIndex + 1), { root, instant: true }))
    .to(frame, { opacity: 1, duration: 0.28, ease: 'power2.out' });
}

export function initMethodScroll({ reducedMotion, lenis = null } = {}) {
  const mqMobile = window.matchMedia(MQ_MOBILE_LAYOUT);
  let desktopCleanup = () => {};

  function syncMethodLayout() {
    desktopCleanup();
    desktopCleanup = () => {};

    const root = document.querySelector('.methodProcess');
    if (!root) return;

    if (mqMobile.matches) {
      root.classList.remove('methodProcess--motionReady');
      teardownMobileShell(root);
      buildMobileProcessStack(root);
      requestAnimationFrame(() => window.ScrollTrigger?.refresh());
      return;
    }

    teardownMobileShell(root);

    const scrollRoom = root.querySelector('[data-method-scroll-room]');
    const stickyShell = root.querySelector('.methodProcess-stickyShell');
    const steps = Array.from(root.querySelectorAll('.methodProcess-step'));
    const frame = root.querySelector('.methodProcess-frame');

    if (!scrollRoom || !stickyShell || !steps.length || !frame) return;

    hydrateStepsFromData(root);

    root.classList.add('methodProcess--motionReady');

    const windows = METHOD_TEXT_PROGRESS_WINDOWS;
    let stInstance = null;
    let displayedVisualIndex = 0;
    let presenceTween = null;

    morphProcessVisual(String(METHOD_PROCESS_STEPS[0].visualIndex + 1), { root, instant: true });

    function applyFromProgress(p) {
      const clamped = Math.max(0, Math.min(1, p));

      if (reducedMotion) {
        const idx = stepIndexInTextWindows(clamped, windows);
        steps.forEach((el, i) => {
          const on = idx !== null && i === idx;
          el.style.opacity = on ? '1' : '0';
          el.style.transform = 'translateY(-50%)';
          el.classList.toggle('is-active', on);
          el.tabIndex = on ? 0 : -1;
          el.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        root.dataset.activeStep = String((idx === null ? displayedVisualIndex : idx) + 1);
        if (idx !== null && idx !== displayedVisualIndex) {
          displayedVisualIndex = idx;
          morphProcessVisual(String(METHOD_PROCESS_STEPS[idx].visualIndex + 1), { root, instant: true });
        }
        return;
      }

      steps.forEach((el, i) => {
        const [a, b] = windows[i] || [0, 1];
        const { opacity, y } = textWindowStyle(clamped, a, b);
        el.style.opacity = String(opacity);
        el.style.transform = `translateY(calc(-50% + ${y.toFixed(2)}px))`;
        const active = opacity > 0.55;
        el.classList.toggle('is-active', active);
        el.tabIndex = active ? 0 : -1;
        el.setAttribute('aria-hidden', opacity < 0.08 ? 'true' : 'false');
      });

      const windowIdx = stepIndexInTextWindows(clamped, windows);
      if (windowIdx !== null && windowIdx !== displayedVisualIndex) {
        presenceTween?.kill();
        presenceTween = runVisualPresence({ root, frame, targetIdx: windowIdx });
        displayedVisualIndex = windowIdx;
      }

      const labelIdx = windowIdx === null ? displayedVisualIndex + 1 : windowIdx + 1;
      root.dataset.activeStep = String(labelIdx);
    }

    function scrollToStepIndex(idx) {
      if (!stInstance) return;
      const p = textWindowCenterProgress(windows, idx);
      const y = stInstance.start + (stInstance.end - stInstance.start) * p;
      if (typeof lenis?.scrollTo === 'function') {
        lenis.scrollTo(y, { immediate: false });
      } else {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    const abortCtl = new AbortController();
    const { signal } = abortCtl;

    desktopCleanup = () => {
      presenceTween?.kill();
      presenceTween = null;
      abortCtl.abort();
      window.ScrollTrigger?.getById('method-process-scroll')?.kill();
    };

    if (!window.ScrollTrigger) {
      applyFromProgress(0);
      requestAnimationFrame(() => window.ScrollTrigger?.refresh());
      return;
    }

    stInstance = window.ScrollTrigger.create({
      id: 'method-process-scroll',
      trigger: scrollRoom,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reducedMotion ? false : 0.65,
      invalidateOnRefresh: true,
      onUpdate(self) {
        applyFromProgress(self.progress);
      },
    });

    applyFromProgress(stInstance.progress || 0);

    steps.forEach((stepEl, i) => {
      stepEl.addEventListener(
        'click',
        () => scrollToStepIndex(i),
        { signal },
      );
      stepEl.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToStepIndex(i);
          }
        },
        { signal },
      );
    });

    requestAnimationFrame(() => {
      window.ScrollTrigger?.refresh();
    });
  }

  syncMethodLayout();
  mqMobile.addEventListener('change', syncMethodLayout);
}
