// Every on-screen Arabic string lives here. `gold` / `red` list words or phrases
// (matched word by word, punctuation ignored) that get the gold gradient or fiat red.

export type Line = {text: string; delay?: number; size?: number};
export type TextBlock = {lines: Line[]; gold?: string[]; red?: string[]};

export const TITLE = 'لماذا يلجأ العالم إلى الذهب وقت الأزمات؟';
export const BRAND = 'ميران جولد';

export const S1_HOOK: TextBlock = {
  lines: [{text: 'لماذا يهرب المال'}, {text: 'إلى الذهب وقت الأزمات؟'}],
  gold: ['الذهب'],
};

export const S2_RARE: TextBlock = {lines: [{text: 'الذهب نادر جداً.'}], gold: ['الذهب']};
export const S2_CUBE: TextBlock = {
  lines: [{text: 'كل ما استُخرج منه عبر التاريخ'}, {text: 'يملأ مكعباً بطول ٢٢ متراً تقريباً.'}],
};
export const S2_DIMENSION = '≈ ٢٢ م';

export const S3_PRINT: TextBlock = {
  lines: [{text: 'العملات تُطبع بلا حدود…'}, {text: 'الذهب لا يُطبع.', delay: 20}],
  gold: ['الذهب', 'لا يُطبع'],
  red: ['العملات'],
};

export const S4_INFLATION: TextBlock = {
  lines: [{text: 'مع التضخم تفقد العملة قيمتها،'}, {text: 'ويحافظ الذهب على قوته الشرائية.'}],
  gold: ['الذهب', 'قوته الشرائية'],
  red: ['العملة'],
};
export const S4_LABEL_FIAT = 'العملة';
export const S4_LABEL_GOLD = 'الذهب';
export const ILLUSTRATIVE = 'توضيحي';

export const S5_BANKS: TextBlock = {
  lines: [{text: 'حتى البنوك المركزية تشتري'}, {text: 'الذهب لتحمي احتياطياتها.'}],
  gold: ['الذهب'],
};

export const S6_TIP_PILL = 'نصيحة';
export const S6_TIP: TextBlock = {
  lines: [
    {text: 'ليس استثماراً بلا مخاطر.'},
    {text: 'الذهب يتقلّب أيضاً. لا تضع كل أموالك في أصل واحد.', delay: 48, size: 36},
  ],
  gold: ['الذهب'],
};
export const S6_TICKER = 'XAU/USD';

export const S7_CTA: TextBlock = {
  lines: [{text: 'انضم إلى مجتمع ميران جولد.'}, {text: 'الرابط في البايو.', size: 42}],
};
export const S7_BUTTON = 'انضم على تيليجرام';
export const S7_DISCLAIMER = 'محتوى تعليمي فقط وليس نصيحة مالية.';
