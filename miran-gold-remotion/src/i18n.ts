// All on-screen strings for both languages.
//
// Markup inside a line:
//   *word*   → gold gradient (GOLD, XAU/USD, "higher price", "gold", "DXY", "=")
//   _word_   → dollar red
// Each string in a `lines` array is one rendered line (max 2 per block).
// Latin tokens inside Arabic lines are wrapped in <bdi> automatically.

export type Lang = 'en' | 'ar';

export type Strings = {
  hook: string[];
  priced: string[];
  weaker: string[];
  buyers: string[];
  trust: string[];
  tipPill: string;
  tipTitle: string[];
  tipLine2a: string[];
  tipLine2b: string[];
  inverse: string;
  illustrative: string;
  ctaLines: string[];
  ctaButton: string;
  disclaimer: string;
};

export const BRAND = 'Miran Gold';

export const strings: Record<Lang, Strings> = {
  en: {
    hook: ['Why does *GOLD* rise', 'when the _DOLLAR_ falls?'],
    priced: ['*Gold* is priced', 'in US _dollars_.'],
    weaker: ['Weaker _dollar_ *=* *gold* gets cheaper', 'for the rest of the world.'],
    buyers: ['More buyers *=*', '*higher price*.'],
    trust: ['Lose trust in the _dollar_,', 'and money moves to *gold*.'],
    tipPill: 'TIP',
    tipTitle: ['Not a rule.'],
    tipLine2a: ['Rates and yields can override it.'],
    tipLine2b: ['Always check the *DXY* first.'],
    inverse: 'Inverse',
    illustrative: 'Illustrative',
    ctaLines: ['Join the Miran Gold community.', 'Link in bio.'],
    ctaButton: 'Join on Telegram',
    disclaimer: 'Educational content only. Not financial advice.',
  },
  ar: {
    hook: ['لماذا يرتفع *الذهب*', 'عندما ينخفض _الدولار_؟'],
    priced: ['*الذهب* مُسعَّر', '_بالدولار_ الأمريكي.'],
    weaker: ['_دولار_ أضعف *=* *ذهب* أرخص', 'للمشترين حول العالم.'],
    buyers: ['مشترون أكثر *=*', '*سعر أعلى*.'],
    trust: ['عندما تضعف الثقة _بالدولار_،', 'يتجه المال إلى *الذهب*.'],
    tipPill: 'نصيحة',
    tipTitle: ['ليست قاعدة ثابتة.'],
    tipLine2a: ['الفائدة والعوائد قد تغيّر الاتجاه.'],
    tipLine2b: ['راقب مؤشر الدولار *DXY* أولاً.'],
    inverse: 'علاقة عكسية',
    illustrative: 'أرقام توضيحية',
    ctaLines: ['انضم إلى مجتمع ميران جولد.', 'الرابط في البايو.'],
    ctaButton: 'انضم على تيليجرام',
    disclaimer: 'محتوى تعليمي فقط وليس نصيحة مالية.',
  },
};

export type Tone = 'plain' | 'gold' | 'red';

// A word is the unit that animates in Arabic and the unit that never wraps in
// English. It can mix tones when punctuation touches a highlight ("*price*.").
export type Segment = {text: string; tone: Tone};
export type Word = {segments: Segment[]; latin: boolean};

const LATIN = /[A-Za-z]/;

export const parseLine = (line: string): Word[] => {
  const words: Word[] = [];
  let current: Segment[] = [];
  const flush = () => {
    if (current.length) {
      words.push({segments: current, latin: current.some((s) => LATIN.test(s.text))});
    }
    current = [];
  };
  const re = /\*([^*]+)\*|_([^_]+)_|([^*_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const tone: Tone = m[1] !== undefined ? 'gold' : m[2] !== undefined ? 'red' : 'plain';
    const chunk = m[1] ?? m[2] ?? m[3] ?? '';
    // Split on whitespace but keep the separators so word boundaries survive.
    for (const piece of chunk.split(/(\s+)/)) {
      if (piece === '') continue;
      if (/^\s+$/.test(piece)) {
        flush();
        continue;
      }
      current.push({text: piece, tone});
    }
  }
  flush();
  return words;
};

export const wordText = (w: Word) => w.segments.map((s) => s.text).join('');
