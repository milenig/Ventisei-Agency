function createLoop() {
  const subs = new Set();
  let running = false;
  let rafId = 0;
  let last = performance.now();

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    subs.forEach((fn) => fn({ now, dt }));
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  }

  function subscribe(fn) {
    subs.add(fn);
    start();
    return {
      unsubscribe() {
        subs.delete(fn);
        if (subs.size === 0) stop();
      },
    };
  }

  return { subscribe, start, stop };
}

export const loop = createLoop();

