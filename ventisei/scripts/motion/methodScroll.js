import { METHOD_PROCESS_STEPS, METHOD_TEXT_PROGRESS_WINDOWS } from '../data/methodProcessSteps.js';
import {
  textWindowStyle,
  stepIndexInTextWindows,
  textWindowCenterProgress,
} from './methodProgressMap.js';
import { morphProcessVisual } from '../scenes/processGeometry.js';

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
  const root = document.querySelector('.methodProcess');
  const scrollRoom = root?.querySelector('[data-method-scroll-room]');
  const stickyShell = root?.querySelector('.methodProcess-stickyShell');
  const steps = root ? Array.from(root.querySelectorAll('.methodProcess-step')) : [];
  const frame = root?.querySelector('.methodProcess-frame');

  if (!root || !scrollRoom || !stickyShell || !steps.length || !frame) return;

  hydrateStepsFromData(root);

  root.classList.add('methodProcess--motionReady');

  const windows = METHOD_TEXT_PROGRESS_WINDOWS;
  let stInstance = null;
  /** Last step index (0-based) whose visual was committed; gaps keep this value. */
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

  if (!window.ScrollTrigger) {
    applyFromProgress(0);
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
    stepEl.addEventListener('click', () => scrollToStepIndex(i));
    stepEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToStepIndex(i);
      }
    });
  });

  requestAnimationFrame(() => {
    window.ScrollTrigger?.refresh();
  });
}
