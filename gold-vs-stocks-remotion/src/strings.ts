// Every on-screen string lives here. `gold` / `blue` / `red` list words or phrases
// (matched word by word, punctuation ignored) that get the gold gradient, the stocks
// blue gradient or the loss red. Latin tokens are wrapped in <bdi> by <ArabicText>.

export type Line = {text: string; delay?: number; size?: number};
export type TextBlock = {lines: Line[]; gold?: string[]; blue?: string[]; red?: string[]; key?: string[]};

export const TITLE = 'الذهب أم الأسهم؟';
export const BRAND = 'ميران جولد';

export const S1_HOOK: TextBlock = {
  lines: [{text: 'الذهب أم الأسهم…'}, {text: 'أيهما أفضل لأموالك؟'}],
  gold: ['الذهب'],
  blue: ['الأسهم'],
};
export const S1_GOLD_TICKER = 'XAU/USD';
export const S1_STOCKS_TICKER = 'S&P 500';
export const VS = 'VS';

export const S2_STOCKS: TextBlock = {
  lines: [{text: 'الأسهم حصة في شركات'}, {text: 'تنمو وتربح.'}],
  blue: ['الأسهم'],
};

export const S3_GOLD: TextBlock = {
  lines: [{text: 'الذهب لا يُنتج أرباحاً…'}, {text: 'لكنه يحفظ القيمة.', delay: 40}],
  gold: ['الذهب', 'يحفظ القيمة'],
};

export const S4_CRISIS: TextBlock = {
  lines: [{text: 'في الأزمات، تهبط الأسهم'}, {text: 'غالباً ويصمد الذهب.'}],
  gold: ['الذهب'],
  blue: ['الأسهم'],
  red: ['تهبط'],
};
export const S4_CRISIS_LABEL = 'أزمة';
export const ILLUSTRATIVE = 'توضيحي';

export const S5_LONG: TextBlock = {
  lines: [{text: 'على المدى الطويل:'}, {text: 'الأسهم للنمو، والذهب للحماية.'}],
  gold: ['والذهب', 'للحماية'],
  blue: ['الأسهم', 'للنمو'],
};
export const S5_CARD_GOLD = 'حماية';
export const S5_CARD_BLUE = 'نمو';

export const S6_TIP_PILL = 'نصيحة';
export const S6_TIP: TextBlock = {
  lines: [
    {text: 'السؤال ليس «أيهما»… بل «كم من كلٍّ منهما».'},
    {text: 'كثيرون يوزّعون أموالهم بين الاثنين حسب أهدافهم.', delay: 106, size: 33},
  ],
  key: ['أيهما', 'كم من كلٍّ منهما'],
};

export const S7_CTA: TextBlock = {
  lines: [{text: 'انضم إلى مجتمع ميران جولد.'}, {text: 'الرابط في البايو.', size: 42}],
};
export const S7_BUTTON = 'انضم على تيليجرام';
export const S7_DISCLAIMER = 'محتوى تعليمي فقط وليس نصيحة مالية.';
