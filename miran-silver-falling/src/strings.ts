// Every on-screen Arabic string and every number lives here. `accents` lists the words or
// phrases (matched word by word, punctuation ignored) that get an accent color and the 600
// weight. Words carrying a prefix (و / ب / ل) are listed as they appear, so the whole word
// is colored and Arabic letter joining is never broken by a split span.
//
// Prices are approximate, as of 30 Oct 2026. Check them on posting day.

import type {Accent} from './theme';

export type Line = {text: string; delay?: number; size?: number};
export type TextBlock = {lines: Line[]; accents?: Partial<Record<Accent, string[]>>};

export const TITLE = 'لماذا انهارت الفضة؟';
export const BRAND = 'ميران جولد';

// Price data (US$ per ounce)
export const PRICE = {peak: 121.7, now: 49, goldDropPct: 28, silverDropPct: 60};
export const TICKER = 'XAG/USD';

export const S1_HOOK: TextBlock = {
  lines: [{text: 'الفضة خسرت نحو ٦٠٪ من قمتها…'}, {text: 'فلماذا؟'}],
  accents: {silver: ['الفضة'], red: ['خسرت', '٦٠٪']},
};

export const S2_DROP: TextBlock = {
  lines: [
    {text: 'سجّلت الفضة قمة قرب ١٢١ دولاراً في يناير.'},
    {text: 'واليوم تتداول قرب ٤٩ دولاراً… أقل بنحو ٦٠٪.', delay: 36, size: 40},
  ],
  accents: {silver: ['الفضة'], red: ['٦٠٪']},
};
export const S2_NOTE = 'تقريبي · أكتوبر ٢٠٢٦';
export const S2_PEAK = '≈ ١٢١';
export const S2_NOW = '≈ ٤٩';
export const S2_DROP_PCT = '−٦٠٪';
export const S2_MONTHS = ['يناير', 'أبريل', 'يوليو', 'أكتوبر'];

export const S3_VERSUS: TextBlock = {
  lines: [
    {text: 'الذهب هبط نحو ٢٨٪… والفضة نحو ٦٠٪.'},
    {text: 'الفضة تتحرك مثل الذهب، لكن بقوة مضاعفة.', delay: 36, size: 40},
  ],
  accents: {gold: ['الذهب'], silver: ['والفضة', 'الفضة'], red: ['٢٨٪', '٦٠٪']},
};
export const S3_GOLD = 'الذهب';
export const S3_SILVER = 'الفضة';
export const S3_GOLD_PCT = '−٢٨٪';
export const S3_SILVER_PCT = '−٦٠٪';

export const S4_PRESSURE: TextBlock = {
  lines: [
    {text: 'نفس ضغوط الذهب: تضخم وفائدة ودولار أقوى.'},
    {text: 'والعوائد الأعلى تسحب الأموال من المعادن.', delay: 36, size: 40},
  ],
  accents: {gold: ['الذهب'], red: ['تضخم', 'وفائدة'], green: ['ودولار', 'أقوى', 'والعوائد']},
};
export const S4_WEIGHTS: {label: string; accent: Accent}[] = [
  {label: 'التضخم', accent: 'red'},
  {label: 'الفائدة', accent: 'red'},
  {label: 'الدولار', accent: 'green'},
];

export const S5_INDUSTRY: TextBlock = {
  lines: [
    {text: 'لكن أكثر من نصف الطلب على الفضة صناعي.'},
    {text: 'ألواح شمسية وإلكترونيات وسيارات… والتباطؤ يضعف الطلب.', delay: 36, size: 40},
  ],
  accents: {silver: ['الفضة'], blue: ['صناعي'], red: ['والتباطؤ']},
};
export const S5_ICONS = ['ألواح شمسية', 'إلكترونيات', 'سيارات'];
export const S5_SLOWDOWN = 'تباطؤ';
export const S5_DEMAND = 'الطلب';

export const S6_MARKET: TextBlock = {
  lines: [
    {text: 'سوق الفضة صغير… فأي بيع يحرّكه بقوة.'},
    {text: 'وكسر الدعم أطلق موجة أوامر بيع متتالية.', delay: 36, size: 40},
  ],
  accents: {silver: ['الفضة'], red: ['بيع']},
};
export const S6_GOLD = 'سوق الذهب';
export const S6_SILVER = 'سوق الفضة';
export const S6_SELL = 'بيع';

export const S7_PILL = 'نصيحة';
export const S7_TIP: TextBlock = {
  lines: [
    {text: 'الفضة أكثر تقلباً من الذهب.'},
    {text: 'راقب ٣ أشياء: التضخم، الفائدة، والطلب الصناعي.', delay: 48, size: 40},
  ],
  accents: {silver: ['الفضة'], gold: ['الذهب'], red: ['التضخم', 'الفائدة'], blue: ['والطلب', 'الصناعي']},
};
export const S7_CARDS: {label: string; accent: Accent}[] = [
  {label: 'التضخم', accent: 'red'},
  {label: 'الفائدة', accent: 'red'},
  {label: 'الطلب الصناعي', accent: 'blue'},
];

export const S8_CTA: TextBlock = {
  lines: [{text: 'انضم إلى مجتمع ميران جولد.'}, {text: 'الرابط في البايو.', size: 40}],
};
export const S8_BUTTON = 'انضم على تيليجرام';
export const S8_DISCLAIMER = 'محتوى تعليمي فقط وليس نصيحة مالية.';
