export function createVisibilityGate(targetEl, { threshold = 0.1 } = {}) {
  let active = true;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.target !== targetEl) return;
        active = e.isIntersecting;
      });
    },
    { threshold }
  );
  io.observe(targetEl);
  return { isActive: () => active, dispose: () => io.disconnect() };
}

