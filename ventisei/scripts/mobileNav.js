const MQ_MOBILE = '(max-width: 899px)';

export function initMobileNav() {
  const rail = document.querySelector('.index-rail');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const backdrop = document.querySelector('.nav-backdrop');
  if (!rail || !toggle || !backdrop) return;

  const mq = window.matchMedia(MQ_MOBILE);
  const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');

  function setOpen(open) {
    rail.classList.toggle('is-nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      open
        ? isEn
          ? 'Close menu'
          : 'Zatvori meni'
        : isEn
          ? 'Open menu'
          : 'Otvori meni'
    );
    document.body.classList.toggle('is-mobile-nav-open', open);
    backdrop.hidden = !open;
    backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function close() {
    setOpen(false);
  }

  toggle.addEventListener('click', () => {
    setOpen(!rail.classList.contains('is-nav-open'));
  });

  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rail.classList.contains('is-nav-open')) close();
  });

  mq.addEventListener('change', (e) => {
    if (!e.matches) close();
  });

  rail.querySelectorAll('.index-link, .lang-switch__link').forEach((a) => {
    a.addEventListener('click', () => {
      if (mq.matches) close();
    });
  });
}
