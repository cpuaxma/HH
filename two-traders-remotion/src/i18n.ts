// Every on-screen string for both languages.
// Markup: *gold* (gold gradient, 600) · _red_ (red, 600). Arrays are explicit lines.
export type Lang = 'en' | 'ar';

export type Copy = {
  headline: string[];
  caption: string[];
  nameRay: string;
  nameSam: string;
  s2RayBubble: string[];
  s2RayTag: string[];
  s2SamBubble: string[];
  s2SamTag: string[];
  card: {entry: string; tp: string; sl: string};
  illustrative: string;
  account: string;
  chartEntry: string;
  s3RayBubble: string[];
  s3RayTag: string[];
  s3SamBubble: string[];
  s3SamTag: string[];
  slHit: string;
  tpHit: string;
  closed: string;
  s4RayBubble: string[];
  s4RayTag: string[];
  s4SamTag: string[];
  waiting: string;
  s5RayBubble: string[];
  s5Headline: string[];
  s6Caption: string[];
  s6Tagline: string[];
  ctaButton: string;
  ctaLink: string;
  disclaimer: string[];
};

export const COPY: Record<Lang, Copy> = {
  en: {
    headline: ['Same market. Same gold.', 'Two different results.'],
    caption: ['Two traders. One market. Only one has a *plan*.'],
    nameRay: 'Reckless Ray',
    nameSam: 'Steady Sam',
    s2RayBubble: ["It's going up, buy now!", 'No time to think!'],
    s2RayTag: ['No plan. No stop loss.'],
    s2SamBubble: ['Entry, target, and risk,', 'all clear.'],
    s2SamTag: ['Clear plan.', 'Controlled risk.'],
    card: {entry: 'Entry', tp: 'TP', sl: 'SL'},
    illustrative: 'Illustrative',
    account: 'Account',
    chartEntry: 'Entry',
    s3RayBubble: ['Wait, why is it going down?', "I'll just add more!"],
    s3RayTag: ['Averaging down', 'with no plan'],
    s3SamBubble: ['Small loss.', "That's part of the *plan*."],
    s3SamTag: ['Small planned loss'],
    slHit: 'SL hit',
    tpHit: 'TP hit',
    closed: 'Closed',
    s4RayBubble: ['Sell! No, buy!', 'Someone tell me what to do!'],
    s4RayTag: ['Emotions are', 'running the trade'],
    s4SamTag: ['Patience pays'],
    waiting: 'Waiting for next update',
    s5RayBubble: ['It went up right', 'after I sold?!'],
    s5Headline: ['*Plan* vs. emotions'],
    s6Caption: ["Trading isn't luck. It's *discipline*,", 'risk management, and a clear *plan*.'],
    s6Tagline: ['Trade smarter with *Miran Gold*'],
    ctaButton: 'Join our Telegram channel',
    ctaLink: 'Link in bio.',
    disclaimer: ['Trading involves high risk.', "Past results don't guarantee future results."],
  },
  ar: {
    headline: ['نفس السوق. نفس الذهب.', 'نتيجتان مختلفتان.'],
    caption: ['متداولان. سوق واحد. واحد فقط لديه *خطة*.'],
    nameRay: 'راي المتهوّر',
    nameSam: 'سام الهادئ',
    s2RayBubble: ['إنه يرتفع، اشترِ الآن!', 'لا وقت للتفكير!'],
    s2RayTag: ['بلا خطة. بلا وقف خسارة.'],
    s2SamBubble: ['الدخول والهدف والمخاطرة،', 'كلها واضحة.'],
    s2SamTag: ['خطة واضحة.', 'مخاطرة محسوبة.'],
    card: {entry: 'الدخول', tp: 'الهدف', sl: 'وقف الخسارة'},
    illustrative: 'توضيحي',
    account: 'الحساب',
    chartEntry: 'الدخول',
    s3RayBubble: ['لحظة، لماذا ينخفض؟', 'سأضيف المزيد!'],
    s3RayTag: ['مضاعفة الصفقة الخاسرة', 'بلا خطة'],
    s3SamBubble: ['خسارة صغيرة.', 'هذا جزء من *الخطة*.'],
    s3SamTag: ['خسارة صغيرة ومخطط لها'],
    slHit: 'تفعّل وقف الخسارة',
    tpHit: 'تحقق الهدف',
    closed: 'تم الإغلاق',
    s4RayBubble: ['بِع! لا، اشترِ!', 'فليقل لي أحد ماذا أفعل!'],
    s4RayTag: ['المشاعر تقود الصفقة'],
    s4SamTag: ['الصبر يُثمر'],
    waiting: 'بانتظار التحديث التالي',
    s5RayBubble: ['ارتفع مباشرة', 'بعد أن بعت؟!'],
    s5Headline: ['*الخطة* مقابل المشاعر'],
    s6Caption: ['التداول ليس حظاً.', 'إنه *انضباط* وإدارة مخاطر و*خطة* واضحة.'],
    s6Tagline: ['تداول بذكاء أكبر مع *ميران جولد*'],
    ctaButton: 'انضم إلى قناتنا على تيليجرام',
    ctaLink: 'الرابط في البايو.',
    disclaimer: ['التداول ينطوي على مخاطر عالية.', 'النتائج السابقة لا تضمن النتائج المستقبلية.'],
  },
};

export type Tone = 'plain' | 'gold' | 'red';
export type Segment = {text: string; tone: Tone};
export type Word = {segments: Segment[]; latin: boolean};

const LATIN = /[A-Za-z]/;

// Splits a marked-up line into words; each word keeps its coloured segments
export const parseLine = (line: string): Word[] => {
  const words: Word[] = [];
  let current: Segment[] = [];
  const flush = () => {
    if (current.length) words.push({segments: current, latin: current.some((s) => LATIN.test(s.text))});
    current = [];
  };
  const re = /\*([^*]+)\*|_([^_]+)_|([^*_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const tone: Tone = m[1] !== undefined ? 'gold' : m[2] !== undefined ? 'red' : 'plain';
    const chunk = m[1] ?? m[2] ?? m[3] ?? '';
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
