/**
 * Single source of truth for the Method / Process timeline (copy + visual index).
 * visualIndex: 0-based key passed to the SVG morph (`morphProcessVisual(String(visualIndex + 1))`).
 */
export const METHOD_PROCESS_STEPS_SR = [
  {
    id: '1',
    roman: 'i.',
    title: 'Upoznavanje',
    description:
      'Važno nam je da upoznamo suštinu i karakter brenda na osnovu kog zajedno definišemo tržište, publiku, poziciju, ton komunikacije i ciljeve. Razumevanje konteksta nam daje pravac, a pravac sprečava da kreativna rešenja ostanu samo vizuelno dopadljiva.',
    visualIndex: 0,
  },
  {
    id: '2',
    roman: 'ii.',
    title: 'Oblikovanje',
    description:
      'Identitet, sadržaj i način na koji brend komunicira oblikujemo sa ciljem da svaki element radi samostalno ali istovremeno i kao deo šire, kompaktne celine.',
    visualIndex: 1,
  },
  {
    id: '3',
    roman: 'iii.',
    title: 'Isporuka',
    description:
      'Ideje pretvaramo u konkretne formate — kampanje, sadržaj, veb rešenja ili događaje. Fokus je na realizaciji koja je precizna, funkcionalna i merljiva — sa rezultatom koji se ne završava na prvom utisku.',
    visualIndex: 2,
  },
];

export const METHOD_PROCESS_STEPS_EN = [
  {
    id: '1',
    roman: 'i.',
    title: 'Discovery',
    description:
      'We start by understanding the brand’s essence and character — together we define the market, audience, positioning, tone of voice, and goals. Context gives direction; direction keeps creative work from staying merely visually pleasing.',
    visualIndex: 0,
  },
  {
    id: '2',
    roman: 'ii.',
    title: 'Shaping',
    description:
      'We shape identity, content, and how the brand communicates so every element works on its own and as part of a wider, coherent whole.',
    visualIndex: 1,
  },
  {
    id: '3',
    roman: 'iii.',
    title: 'Delivery',
    description:
      'We turn ideas into concrete formats — campaigns, content, web, or events. The focus is precise, functional, measurable execution — with outcomes that go beyond a first impression.',
    visualIndex: 2,
  },
];

export function getMethodProcessSteps() {
  const lang = (document.documentElement.lang || 'sr').toLowerCase();
  return lang.startsWith('en') ? METHOD_PROCESS_STEPS_EN : METHOD_PROCESS_STEPS_SR;
}

/** @deprecated Use getMethodProcessSteps() */
export const METHOD_PROCESS_STEPS = METHOD_PROCESS_STEPS_SR;

/** Scroll progress sub-ranges where each step is “on stage” (opacity 0→1→0, y 20→0→-20). */
export const METHOD_TEXT_PROGRESS_WINDOWS = [
  [0.1, 0.3],
  [0.4, 0.6],
  [0.7, 0.9],
];
