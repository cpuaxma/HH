// Every on-screen Arabic string lives here. `gold` / `red` list words or phrases
// (matched word by word, punctuation ignored) that get the gold gradient or tension red.

export type Line = {text: string; delay?: number; size?: number};
export type TextBlock = {lines: Line[]; gold?: string[]; red?: string[]};

export const TITLE = 'لماذا يرتفع الذهب وقت التوترات؟';
export const BRAND = 'ميران جولد';
export const ILLUSTRATIVE = 'توضيحي';

export const S1_HOOK: TextBlock = {
  lines: [{text: 'لماذا يرتفع الذهب'}, {text: 'عندما تشتعل التوترات؟'}],
  gold: ['الذهب'],
  red: ['التوترات'],
};

export const S2_FEAR: TextBlock = {
  lines: [{text: 'الخوف يدفع المستثمرين'}, {text: 'للبحث عن ملاذ آمن.'}],
  gold: ['ملاذ آمن'],
  red: ['الخوف'],
};

export const S3_INDEPENDENT: TextBlock = {
  lines: [{text: 'الذهب لا يعتمد'}, {text: 'على حكومة أو شركة أو بنك.'}],
  gold: ['الذهب'],
};

export const S4_MARKETS: TextBlock = {
  lines: [{text: 'حين تهتز الأسواق،'}, {text: 'يزداد الطلب على الذهب.'}],
  gold: ['الذهب'],
  red: ['تهتز'],
};
// Illustrative ticker values (Eastern Arabic digits are produced by the Odometer).
export const S4_TICKER_FROM = 2380;
export const S4_TICKER_TO = 2456;

export const S5_HISTORY: TextBlock = {
  lines: [{text: 'منذ آلاف السنين،'}, {text: 'يلجأ الناس إلى الذهب وقت الخوف.'}],
  gold: ['الذهب'],
  red: ['الخوف'],
};

export const S6_TIP_PILL = 'نصيحة';
export const S6_TIP: TextBlock = {
  lines: [
    {text: 'لا تطارد العناوين.'},
    {text: 'القفزات بسبب الأخبار قد تتراجع بسرعة عندما تهدأ الأوضاع.', delay: 48, size: 34},
  ],
};
export const S6_TICKER = 'XAU/USD';
export const S6_NEWS = 'خبر';

export const S7_CTA: TextBlock = {
  lines: [{text: 'انضم إلى مجتمع ميران جولد.'}, {text: 'الرابط في البايو.', size: 42}],
};
export const S7_BUTTON = 'انضم على تيليجرام';
export const S7_DISCLAIMER = 'محتوى تعليمي فقط وليس نصيحة مالية.';
