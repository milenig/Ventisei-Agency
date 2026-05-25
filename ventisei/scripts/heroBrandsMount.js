import { HERO_BRANDS } from './data/heroBrands.js';

function brandsAssetBase() {
  const path = window.location.pathname || '';
  return path.includes('/en/') ? '../assets/brands/' : 'assets/brands/';
}

function buildBrandList({ base, isEn, ariaHidden }) {
  const ul = document.createElement('ul');
  ul.className = 'hero-brands__list';
  if (ariaHidden) ul.setAttribute('aria-hidden', 'true');

  HERO_BRANDS.forEach((brand) => {
    const li = document.createElement('li');
    li.className = 'hero-brands__item';

    const img = document.createElement('img');
    const logoClass = ['hero-brands__logo'];
    if (brand.screen) logoClass.push('hero-brands__logo--screen');
    if (brand.ink) logoClass.push('hero-brands__logo--ink');
    img.className = logoClass.join(' ');
    img.src = `${base}${brand.file}`;
    img.alt = ariaHidden ? '' : isEn ? brand.altEn : brand.altSr;
    img.width = 168;
    img.height = 60;
    img.loading = 'lazy';
    img.decoding = 'async';

    li.appendChild(img);
    ul.appendChild(li);
  });

  return ul;
}

export function mountHeroBrands() {
  const track = document.getElementById('hero-brands-marquee');
  if (!track || track.dataset.mounted === 'true') return;

  const base = brandsAssetBase();
  const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');

  track.replaceChildren(buildBrandList({ base, isEn, ariaHidden: false }), buildBrandList({ base, isEn, ariaHidden: true }));
  track.dataset.mounted = 'true';
}
