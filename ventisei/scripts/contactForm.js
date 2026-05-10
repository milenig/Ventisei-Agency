/**
 * Static hosting: submit builds a mailto link instead of POST to placeholder action.
 */
export function initContactForm() {
  const form = document.querySelector('.contactForm');
  if (!form || form.tagName !== 'FORM') return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const company = String(fd.get('company') || '').trim();
    const message = String(fd.get('message') || '').trim();
    const subject = encodeURIComponent(`Upit sa sajta — ${name || 'Ventisei'}`);
    const body = encodeURIComponent(
      [`Ime: ${name}`, `E-pošta: ${email}`, company ? `Kompanija: ${company}` : '', '', message]
        .filter(Boolean)
        .join('\n')
    );
    window.location.href = `mailto:hello@ventisei.arch?subject=${subject}&body=${body}`;
  });
}
