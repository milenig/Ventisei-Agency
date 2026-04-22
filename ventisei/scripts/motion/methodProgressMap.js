/**
 * Scroll progress → layout / motion (plain math; no theme / background here).
 */

/**
 * Opacity 0→1→0 and y 20→0→-20 within [a, b] (Framer-style window).
 * Outside window: opacity 0, y 0 (no competing stacks).
 */
export function textWindowStyle(p, a, b) {
  if (p < a || p > b) {
    return { opacity: 0, y: 0 };
  }
  const mid = (a + b) / 2;
  if (p <= mid) {
    const t = mid === a ? 1 : (p - a) / (mid - a);
    return { opacity: t, y: 20 * (1 - t) };
  }
  const u = b === mid ? 1 : (b - p) / (b - mid);
  return { opacity: u, y: -20 * (1 - u) };
}

/**
 * @returns {number | null} step index in window, or null in gaps (hold last visual).
 */
export function stepIndexInTextWindows(p, windows) {
  for (let i = 0; i < windows.length; i += 1) {
    const [lo, hi] = windows[i];
    if (p >= lo && p <= hi) return i;
  }
  return null;
}

/** Center of each text window — for click-to-scroll. */
export function textWindowCenterProgress(windows, index) {
  const [a, b] = windows[index] || [0, 1];
  return (a + b) / 2;
}
