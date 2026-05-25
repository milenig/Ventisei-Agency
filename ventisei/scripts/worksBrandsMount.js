import { HERO_BRANDS } from './data/heroBrands.js';

function brandsAssetBase() {
  const path = window.location.pathname || '';
  return path.includes('/en/') ? '../assets/brands/' : 'assets/brands/';
}

export function mountWorksBrands() {
  const grid = document.getElementById('works-brands-grid');
  if (!grid || grid.dataset.mounted === 'true') return;

  const base = brandsAssetBase();
  const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');

  HERO_BRANDS.forEach((brand) => {
    const tile = document.createElement('article');
    tile.className = 'brand-tile';

    const img = document.createElement('img');
    const logoClass = ['brand-tile__logo'];
    if (brand.screen) logoClass.push('brand-tile__logo--screen');
    if (brand.ink) logoClass.push('brand-tile__logo--ink');
    img.className = logoClass.join(' ');
    img.src = `${base}${brand.file}`;
    img.alt = isEn ? brand.altEn : brand.altSr;
    img.width = brand.width;
    img.height = 120;
    img.loading = 'lazy';
    img.decoding = 'async';

    tile.appendChild(img);
    grid.appendChild(tile);
  });

  grid.dataset.mounted = 'true';
}
