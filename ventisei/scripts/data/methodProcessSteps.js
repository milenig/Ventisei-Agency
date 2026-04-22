/**
 * Single source of truth for the Method / Process timeline (copy + visual index).
 * visualIndex: 0-based key passed to the SVG morph (`morphProcessVisual(String(visualIndex + 1))`).
 */
export const METHOD_PROCESS_STEPS = [
  {
    id: '1',
    roman: 'i.',
    title: 'Saslušavanje',
    description:
      'Čujemo kontekst, publiku i ograničenja: šta brend već nosi, šta treba da sazri i gde leži prostor za skok.',
    visualIndex: 0,
  },
  {
    id: '2',
    roman: 'ii.',
    title: 'Sistem',
    description:
      'Prevodimo ustanovljene ciljeve u jezik: tipografija, mreža, kanali, ton i jasna pravila — da sve „priča“ u istom glasu.',
    visualIndex: 1,
  },
  {
    id: '3',
    roman: 'iii.',
    title: 'Isporuka',
    description:
      'Objavljujemo brzo i uredno: fajlovi, rokovi, kampanje i podrška nakon lansiranja — da iskustvo ostane stabilno i merljivo.',
    visualIndex: 2,
  },
];

/** Scroll progress sub-ranges where each step is “on stage” (opacity 0→1→0, y 20→0→-20). */
export const METHOD_TEXT_PROGRESS_WINDOWS = [
  [0.1, 0.3],
  [0.4, 0.6],
  [0.7, 0.9],
];
