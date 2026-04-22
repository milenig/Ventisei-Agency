/**
 * Filtriranje stavki portfolija po data-category (vrednost === data-filter ili filter "sve").
 */
export function initPortfolioFilters() {
  const root = document.getElementById('works');
  if (!root) return;

  const buttons = root.querySelectorAll('.filter-btn');
  const tiles = root.querySelectorAll('.archive-tile[data-category]');
  if (!buttons.length || !tiles.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = (btn.getAttribute('data-filter') || 'sve').toLowerCase();
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));

      // Mosaic for "sve", fluid reflow for filtered categories.
      root.classList.toggle('works--filtered', f !== 'sve');

      tiles.forEach((tile) => {
        const c = (tile.getAttribute('data-category') || '').toLowerCase();
        const show = f === 'sve' || c === f;
        tile.hidden = !show;
      });
    });
  });
}
