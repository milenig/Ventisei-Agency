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
    const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    const subject = encodeURIComponent(
      isEn ? `Inquiry from website — ${name || 'Ventisei'}` : `Upit sa sajta — ${name || 'Ventisei'}`
    );
    const body = encodeURIComponent(
      isEn
        ? [`Name: ${name}`, `Email: ${email}`, company ? `Company / brand: ${company}` : '', '', message]
            .filter(Boolean)
            .join('\n')
        : [`Ime: ${name}`, `E-pošta: ${email}`, company ? `Kompanija: ${company}` : '', '', message]
            .filter(Boolean)
            .join('\n')
    );
    window.location.href = `mailto:office.ventisei@gmail.com?subject=${subject}&body=${body}`;
  });
}
