// Every on-screen Arabic string and every number lives here. `accents` lists the words or
// phrases (matched word by word, punctuation ignored) that get an accent color and the 600
// weight. Words carrying a prefix (و / ب / ل) are listed as they appear.
//
// Historical figures are approximate. Check the changing ones (total gold mined, central-bank
// buying, prices) on posting day.

import type {Accent} from './theme';

export type Line = {text: string; delay?: number; size?: number};
export type TextBlock = {lines: Line[]; accents?: Partial<Record<Accent, string[]>>};

export const TITLE = 'تاريخ الذهب في ٦٠ ثانية';
export const BRAND = 'ميران جولد';

export const S1_HOOK: TextBlock = {
  lines: [{text: '٦٠٠٠ عام من الذهب… في ٦٠ ثانية.'}, {text: 'قصة المعدن الذي لم يفقد بريقه.', delay: 36, size: 40}],
  accents: {gold: ['الذهب', '٦٠٠٠', '٦٠']},
};

export const S2_FIRST: TextBlock = {
  lines: [{text: 'قبل أكثر من ٦٠٠٠ عام،'}, {text: 'صنع الإنسان أول حُليّ من الذهب.'}],
  accents: {gold: ['الذهب', '٦٠٠٠']},
};

export const S3_EGYPT: TextBlock = {
  lines: [{text: 'في مصر القديمة، كان الذهب «جسد الآلهة».'}, {text: 'لأنه لا يصدأ ولا يفقد لمعانه.', delay: 36, size: 40}],
  accents: {gold: ['الذهب'], amber: ['جسد الآلهة']},
};

export const S4_LYDIA: TextBlock = {
  lines: [{text: 'في ليديا، سُكّت أول عملات معدنية في التاريخ.'}, {text: 'من خليط الذهب والفضة.', delay: 36, size: 40}],
  accents: {gold: ['الذهب', 'عملات'], silver: ['والفضة']},
};

export const S5_DINAR: TextBlock = {
  lines: [{text: 'عام ٦٩٦م، سُكّ الدينار الذهبي الإسلامي.'}, {text: 'وزنه نحو ٤٫٢٥ غرام، وبقي معياراً لقرون.', delay: 36, size: 40}],
  accents: {gold: ['الدينار', 'الذهبي'], teal: ['الإسلامي']},
};

export const S6_RUSH: TextBlock = {
  lines: [{text: '١٨٤٨: حمّى الذهب في كاليفورنيا.'}, {text: 'مئات الآلاف تركوا كل شيء بحثاً عنه.', delay: 36, size: 40}],
  accents: {gold: ['الذهب'], amber: ['حمّى']},
};

export const S7_STANDARD: TextBlock = {
  lines: [{text: 'ثم أصبح الذهب أساس النظام النقدي العالمي.'}, {text: 'رُبط الدولار بالذهب: ٣٥ دولاراً للأونصة.', delay: 36, size: 40}],
  accents: {gold: ['الذهب', 'بالذهب'], green: ['الدولار']},
};
export const S7_SEAL = '$٣٥';
export const S7_STAMP = '999.9';

export const S8_BREAK: TextBlock = {
  lines: [{text: '١٩٧١: انفصل الدولار عن الذهب.'}, {text: 'ومنذ ذلك اليوم، يتحرك سعره بحرية.', delay: 36, size: 40}],
  accents: {gold: ['الذهب'], green: ['الدولار'], red: ['انفصل']},
};

export const S9_MODERN: TextBlock = {
  lines: [{text: 'من ٣٥ دولاراً… إلى أكثر من ٤٬٠٠٠ دولار.'}, {text: 'قمم في ١٩٨٠ و٢٠١١… ثم قمة قياسية في ٢٠٢٦.', delay: 36, size: 40}],
  accents: {gold: ['٣٥', '٤٬٠٠٠']},
};
export const S9_NOTE = 'تقريبي';
export const S9_PILLS = {start: '٣٥', p1980: '≈ ٨٥٠', p2011: '≈ ١٬٩٢٠', p2026: '≈ ٥٬٦٠٠', now: '≈ ٤٬٠٠٠'};
// Approximate gold price path (year, US$/oz) for the chart.
export const S9_DATA: [number, number][] = [
  [1971, 40],
  [1974, 160],
  [1976, 125],
  [1980, 850],
  [1982, 330],
  [1987, 480],
  [1993, 360],
  [1999, 260],
  [2002, 320],
  [2006, 600],
  [2008, 900],
  [2011.7, 1920],
  [2013.5, 1250],
  [2015.9, 1060],
  [2019, 1450],
  [2020.6, 2060],
  [2022.8, 1650],
  [2024.3, 2350],
  [2025.4, 3300],
  [2025.8, 4100],
  [2026.08, 5600],
  [2026.5, 4500],
  [2026.83, 4000],
];

export const S10_CUBE: TextBlock = {
  lines: [{text: 'كل الذهب المستخرج في التاريخ…'}, {text: 'مكعب ضلعه ٢٢ متراً.'}],
  accents: {gold: ['الذهب', '٢٢']},
};
export const S10_SCALE = '٢٢ م';
export const S10_TONNES = '≈ ٢١٦ ألف طن';

export const S11_TODAY: TextBlock = {
  lines: [{text: '٦٠٠٠ عام… وما زال الذهب مخزناً للقيمة.'}, {text: 'والبنوك المركزية تشتري أكثر من ١٠٠٠ طن سنوياً.', delay: 36, size: 40}],
  accents: {gold: ['الذهب', '٦٠٠٠']},
};

export const S12_CTA: TextBlock = {
  lines: [{text: 'انضم إلى مجتمع ميران جولد.'}, {text: 'الرابط في البايو.', size: 40}],
};
export const S12_BUTTON = 'انضم على تيليجرام';
export const S12_DISCLAIMER = 'محتوى تعليمي فقط وليس نصيحة مالية.';
