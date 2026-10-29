// Every on-screen Arabic string lives here. `accents` lists the words or phrases
// (matched word by word, punctuation ignored) that get an accent color and the 600 weight.
// Words carrying a prefix (و / ب) are listed as they appear, so the whole word is colored
// and Arabic letter joining is never broken by a split span.

import type {Accent} from './theme';

export type Line = {text: string; delay?: number; size?: number};
export type TextBlock = {lines: Line[]; accents?: Partial<Record<Accent, string[]>>};

export const TITLE = 'لماذا ينخفض الذهب رغم الأزمات؟';
export const BRAND = 'ميران جولد';

export const S1_HOOK: TextBlock = {
  lines: [{text: 'أزمات وتوترات حول العالم…'}, {text: 'فلماذا ينخفض الذهب؟'}],
  accents: {red: ['ينخفض'], gold: ['الذهب']},
};

export const S2_DROP: TextBlock = {
  lines: [
    {text: 'سجّل الذهب قمة قرب ٥٬٦٠٠ دولار في يناير.'},
    {text: 'واليوم يتداول قرب ٤٬٠٠٠ دولار… أقل بنحو ٢٨٪.', delay: 36, size: 40},
  ],
  accents: {gold: ['الذهب'], red: ['٢٨٪']},
};
export const S2_TICKER = 'XAU/USD';
export const S2_NOTE = 'تقريبي · أكتوبر ٢٠٢٦';
export const S2_PEAK = '≈ ٥٬٦٠٠';
export const S2_NOW = '≈ ٤٬٠٠٠';
export const S2_DROP_PCT = '−٢٨٪';

export const S3_OIL: TextBlock = {
  lines: [{text: 'التوترات رفعت النفط'}, {text: 'فوق ١٠٠ دولار للبرميل.'}],
  accents: {amber: ['النفط']},
};
export const S3_UNIT = 'دولار للبرميل';

export const S4_INFLATION: TextBlock = {
  lines: [
    {text: 'النفط الغالي يرفع التضخم في أمريكا.'},
    {text: 'وفيدرالي يحارب التضخم = توقعات برفع الفائدة.', delay: 36, size: 40},
  ],
  accents: {red: ['التضخم', 'برفع الفائدة']},
};
export const S4_GAUGE = 'التضخم';
export const S4_FED = 'الفيدرالي';
export const S4_RATE = 'الفائدة';

export const S5_DOLLAR: TextBlock = {
  lines: [
    {text: 'فائدة أعلى = دولار أقوى وعوائد أعلى.'},
    {text: 'والذهب لا يدفع فائدة… فتتجه الأموال بعيداً عنه.', delay: 36, size: 40},
  ],
  accents: {green: ['دولار', 'أقوى', 'وعوائد'], gold: ['والذهب']},
};

export const S6_PANIC: TextBlock = {
  lines: [{text: 'وفي الذعر، يبيع المستثمرون الذهب'}, {text: 'ليوفّروا السيولة.'}],
  accents: {red: ['يبيع'], gold: ['الذهب']},
};
export const S6_CASH = 'سيولة';

export const S7_PILL = 'نصيحة';
export const S7_TIP: TextBlock = {
  lines: [
    {text: 'الهبوط لا يعني أن الذهب فقد دوره.'},
    {text: 'راقب ٣ أشياء: النفط، التضخم، وقرار الفيدرالي القادم.', delay: 48, size: 40},
  ],
  accents: {gold: ['الذهب'], amber: ['النفط'], red: ['التضخم', 'الفيدرالي']},
};
export const S7_CARDS = ['النفط', 'التضخم', 'الفيدرالي'] as const;

export const S8_CTA: TextBlock = {
  lines: [{text: 'انضم إلى مجتمع ميران جولد.'}, {text: 'الرابط في البايو.', size: 40}],
};
export const S8_BUTTON = 'انضم على تيليجرام';
export const S8_DISCLAIMER = 'محتوى تعليمي فقط وليس نصيحة مالية.';

// The chain, in story order (drawn right to left).
export const CHAIN_NODES: {label: string; accent: Accent}[] = [
  {label: 'النفط', accent: 'amber'},
  {label: 'التضخم', accent: 'red'},
  {label: 'الفائدة', accent: 'red'},
  {label: 'الدولار', accent: 'green'},
  {label: 'الذهب', accent: 'gold'},
];
