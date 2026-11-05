/**
 * Everything you are likely to change lives in this file:
 * every line of copy (Arabic; the brand name is always written «Miran Gold»), the numbers and prices, the colours and the timings.
 *
 * Frames are at 60fps (60 frames = 1 second). The reel is 1930 frames (32.2s).
 *
 * ONE STORY: the same gold market, the same trade, the same news.
 * - Left («بلا خطة»): buys 3 lots on impulse, no stop loss. Looks good… until the news.
 * - Right («مع Miran Gold»): the Miran signal (entry, stop loss, target, 1% risk), then a Miran
 *   market update before the news: take profit. When the news candle hits, it is protected.
 *
 * The trading app and every number are fictional and illustrative; every number on screen
 * carries an "توضيحي" (illustrative) label.
 */

// ─── Brand (Miran Gold) ──────────────────────────────────────────────────────

export const BRAND = {
  /** Studio / end card navy. */
  bgTop: '#0B1020',
  bgBottom: '#1B2540',
  /** Gold accent: #D4A24C → #F3D27A. */
  goldA: '#D4A24C',
  goldB: '#F3D27A',
  /** Warm gold light (pools, glows). */
  glow: '#C8963E',
  goldDeep: '#8A6424',
  /** Light text on dark. */
  text: '#F5F1E8',
  /** Grey meta text. */
  meta: '#9AA1B0',
  /** Dark UI cards. */
  card: '#161C2B',
  /** Profit green and loss red. */
  up: '#3FD08A',
  red: '#FF4D4D',
  redDeep: '#7A1016',
  ink: '#0A0E18',
};

export const GOLD_GRADIENT = `linear-gradient(100deg, ${BRAND.goldA} 0%, ${BRAND.goldB} 55%, ${BRAND.goldA} 100%)`;

// ─── Language ────────────────────────────────────────────────────────────────

export type Lang = 'ar' | 'en';

// ─── The market (one generic gold market, the same on both phones) ───────────

export const MARKET = {
  pair: 'XAU/USD',
  /**
   * The gold price over the reel, as [frame, price] keyframes joined by a smooth curve
   * (plausible levels for late 2026; illustrative). It drifts up after both traders buy,
   * then the news candle at NEWS.at drops it $37 in a third of a second.
   */
  price: [
    [-720, 3995.5],
    [-360, 3998.6],
    [0, 4000.4],
    [108, 4001.0],
    [192, 4000.6],
    [283, 4002.0],
    [360, 4003.6],
    [456, 4005.6],
    [552, 4007.4],
    [648, 4008.6],
    [720, 4009.0],
    [792, 4008.5],
    [864, 4008.9],
    [910, 4009.1],
    [914, 4006.5],
    [922, 3988.0],
    [931, 3972.0],
    [950, 3974.6],
    [996, 3972.8],
    [1080, 3975.0],
    [1200, 3976.6],
    [1498, 3979.0],
    [1930, 3980.0],
  ] as [number, number][],
  /** Tiny live ticks on top of the curve ($). */
  tickNoise: 0.16,
  /** How many frames of history the chart shows. */
  chartSpan: 504,
};

/** The shared high-impact news release. Generic: no real date, no real outcome. */
export const NEWS = {
  /** Frame the news candle starts (the same frame on both phones). */
  at: 912,
};

// ─── LEFT: trading without a plan ────────────────────────────────────────────

/** The one impulsive trade: 1 lot, no stop loss. P&L = lots × 100 oz × price move. */
export const LEFT = {
  side: 'BUY',
  lots: 1.0,
  leverage: '1:200',
  entry: 4002.0,
  /** Frame "Buy" is tapped, and the frame the trade opens. */
  tapAt: 269,
  openedAt: 278,
  /** The news candle takes it to 3,972 with no stop loss: 1 × 100 × −$30 = −$3,000. */
  closePrice: 3972.0,
  pnl: -3000,
  marginCallAt: 948,
  startBalance: 10000,
  finalBalance: 7000,
  finalChangePct: -30,
};

// ─── RIGHT: trading with Miran Gold ──────────────────────────────────────────

/** The Miran signal. Risk 1% = $100: 0.20 lots with a $5 stop. */
export const SIGNAL = {
  side: 'BUY',
  entry: 4002.0,
  sl: 3997.0,
  tp: 4012.0,
  lots: 0.2,
  riskPct: 1,
  /** The signal card lands (it builds line by line). */
  at: 247,
  lineGap: 8,
  filledAt: 288,
};

/** The Miran market update before the news: take profit now. */
export const UPDATE = {
  at: 614,
  /** "Take profit now" is tapped; the trade closes at 4,009: 0.20 × 100 × $7 = +$140. */
  tapAt: 703,
  closedAt: 720,
  closePrice: 4009.0,
  profit: 140,
};

export const RIGHT = {
  startBalance: 10000,
  finalBalance: 10140,
  finalChangePct: 1.4,
};

// ─── Copy ────────────────────────────────────────────────────────────────────
// Kinetic lines: `gold` / `red` list words (matched word by word, punctuation ignored)
// drawn in the gold gradient / loss red. Numbers inside Arabic lines are wrapped in <bdi>.

export type Block = {lines: string[]; gold?: string[]; red?: string[]};

type Copy = {
  hookA: Block;
  hookB: Block;
  entry: Block;
  rise: Block;
  warning: Block;
  exit: Block;
  news: Block;
  payoffA: Block;
  payoffB: Block;
  flip: Block;
  /** Scoreboard labels under the phones. */
  labelLeft: string;
  labelRight: string;
  cta: string;
  disclaimer: string;
  illustrative: string;
};

export const COPY: Record<Lang, Copy> = {
  ar: {
    hookA: {lines: ['متداولان. نفس الذهب.'], gold: ['الذهب']},
    hookB: {lines: ['نتيجتان مختلفتان.'], gold: ['مختلفتان']},
    entry: {lines: ['كلاهما اشترى الذهب.'], gold: ['الذهب']},
    rise: {lines: ['الذهب يرتفع… وكلاهما يربح.'], gold: ['يربح']},
    warning: {lines: ['Miran Gold نبّهت: خبر قوي قادم.'], gold: ['Miran Gold']},
    exit: {lines: ['فخرج بربحه قبل الخبر.'], gold: ['بربحه']},
    news: {lines: ['ثم صدر الخبر… وهبط الذهب.'], red: ['الخبر', 'وهبط']},
    payoffA: {lines: ['الفرق ليس في الحظ… بل في الخطة.'], gold: ['الخطة']},
    payoffB: {lines: ['الخطة: وقف خسارة + تنبيه قبل الخبر.'], gold: ['الخطة']},
    flip: {lines: ['تداول بخطة مع Miran Gold.'], gold: ['Miran Gold']},
    labelLeft: 'بلا خطة',
    labelRight: 'مع Miran Gold',
    cta: 'انضم إلى إشارات Miran Gold',
    disclaimer: 'التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. النتائج المعروضة توضيحية وليست ضماناً لأرباح مستقبلية.',
    illustrative: 'توضيحي',
  },
  en: {
    hookA: {lines: ['Same gold. Same day.'], gold: ['gold']},
    hookB: {lines: ['Two different results.'], gold: ['different']},
    entry: {lines: ['Both bought gold.'], gold: ['gold']},
    rise: {lines: ['Gold rises… both are winning.'], gold: ['winning']},
    warning: {lines: ['Miran Gold: big news coming.'], gold: ['Miran Gold']},
    exit: {lines: ['So it took the profit first.'], gold: ['profit']},
    news: {lines: ['Then the news hit.'], red: ['news']},
    payoffA: {lines: ["It isn't luck… it's the plan."], gold: ['plan']},
    payoffB: {lines: ['The plan: a stop loss + a heads-up.'], gold: ['plan']},
    flip: {lines: ['Trade with a plan with Miran Gold.'], gold: ['Miran Gold']},
    labelLeft: 'No plan',
    labelRight: 'With Miran Gold',
    cta: 'Join Miran Gold signals',
    disclaimer: 'Trading involves high risk and you may lose your capital. Results shown are illustrative and not a guarantee of future profits.',
    illustrative: 'Illustrative',
  },
};

/** Text drawn inside the phone screens (follows the reel language). */
export type ScreenCopy = {
  rtl: boolean;
  pair: string;
  balance: string;
  openTrade: string;
  buy: string;
  sell: string;
  lots: string;
  stopLoss: string;
  none: string;
  noPlan: string;
  noStop: string;
  noStopBody: string;
  newsBanner: string;
  newsBody: string;
  marginCall: string;
  closedLoss: string;
  brand: string;
  waiting: string;
  signalTitle: string;
  signalHead: string;
  withStop: string;
  smallRisk: string;
  entry: string;
  target: string;
  risk: string;
  executed: string;
  updateTitle: string;
  updateBody: string;
  updateAction: string;
  profitTaken: string;
  noOpen: string;
  protectedTitle: string;
  protectedBody: string;
  newsReleased: string;
  connected: string;
  nextSignal: string;
  illustrative: string;
};

export const SCREEN_COPY: Record<Lang, ScreenCopy> = {
  ar: {
    rtl: true,
    pair: 'الذهب',
    balance: 'رصيدك',
    openTrade: 'الصفقة المفتوحة',
    buy: 'شراء',
    sell: 'بيع',
    lots: 'لوت',
    stopLoss: 'وقف الخسارة',
    none: 'لا يوجد',
    noPlan: 'صفقة جديدة',
    noStop: 'بدون وقف خسارة',
    noStopBody: 'لا حدّ للخسارة',
    newsBanner: 'خبر اقتصادي قوي',
    newsBody: 'صدر الآن',
    marginCall: 'خسارة كبيرة',
    closedLoss: 'خسرت 30% من رصيدك',
    brand: 'Miran Gold',
    waiting: 'بانتظار إشارة Miran Gold',
    signalTitle: 'إشارة Miran Gold',
    signalHead: 'شراء الذهب',
    withStop: 'مع وقف خسارة',
    smallRisk: 'مخاطرة صغيرة',
    entry: 'الدخول',
    target: 'الهدف',
    risk: 'المخاطرة',
    executed: 'تم التنفيذ',
    updateTitle: 'تنبيه من Miran Gold',
    updateBody: 'خبر قوي بعد 10 دقائق',
    updateAction: 'خذ الربح الآن',
    profitTaken: 'تم أخذ الربح',
    noOpen: 'خرجت قبل الخبر',
    protectedTitle: 'محمي',
    protectedBody: 'ربحك محفوظ',
    newsReleased: 'صدر الخبر',
    connected: 'تم الربط مع Miran Gold',
    nextSignal: 'الصفقة القادمة: بخطة ووقف خسارة',
    illustrative: 'توضيحي',
  },
  en: {
    rtl: false,
    pair: 'Gold · XAU/USD',
    balance: 'Balance',
    openTrade: 'Open trade',
    buy: 'Buy',
    sell: 'Sell',
    lots: 'lots',
    stopLoss: 'Stop loss',
    none: 'None',
    noPlan: 'New trade',
    noStop: 'No stop loss',
    noStopBody: 'No limit on the loss',
    newsBanner: 'Big economic news',
    newsBody: 'Released just now',
    marginCall: 'A big loss',
    closedLoss: 'You lost 30% of your balance',
    brand: 'Miran Gold',
    waiting: 'Waiting for a Miran Gold signal',
    signalTitle: 'Miran Gold signal',
    signalHead: 'Buy gold',
    withStop: 'Stop loss set',
    smallRisk: 'Small risk',
    entry: 'Entry',
    target: 'Target',
    risk: 'Risk',
    executed: 'Executed',
    updateTitle: 'Miran Gold alert',
    updateBody: 'Big news in 10 min',
    updateAction: 'Take profit now',
    profitTaken: 'Profit taken',
    noOpen: 'Out before the news',
    protectedTitle: 'Protected',
    protectedBody: 'Profit kept',
    newsReleased: 'News released',
    connected: 'Connected to Miran Gold',
    nextSignal: 'Next trade: with a plan and a stop loss',
    illustrative: 'Illustrative',
  },
};

// ─── Timings (frames at 60fps) ───────────────────────────────────────────────

export const TIMING = {
  fps: 60,
  durationInFrames: 1930,

  // 1. Hook (0–180): wide two-shot, both phones at $10,000.
  hookAIn: 12,
  hookAOut: 108,
  hookBIn: 115,
  hookBOut: 206,
  /** The scoreboards under the phones (label + balance) are on screen in this window. */
  boardsIn: 36,
  boardsOut: 1325,

  // 2. The entry (180–480): both buy gold, and gold rises (both are winning).
  entryIn: 235,
  entryOut: 396,
  riseIn: 413,
  riseOut: 576,

  // 3. The warning (480–720): the Miran alert; the right side takes its profit.
  warningIn: 600,
  warningOut: 708,
  exitIn: 720,
  exitOut: 833,

  // 4. The news (720–850): the same candle on both phones at NEWS.at.
  newsIn: 854,
  newsOut: 994,

  // 5. The payoff and the lesson (850–1110): both results side by side.
  payoffAIn: 1020,
  payoffAOut: 1150,
  payoffBIn: 1159,
  payoffBOut: 1318,

  // 6. The switch (1110–1360): a gold streak, the left phone flips to Miran Gold.
  streakStart: 1337,
  streakEnd: 1382,
  flipStart: 1392,
  flipEnd: 1457,
  impactAt: 1457,
  impactFrames: 3,
  /** Both phones pulse gold together from here (period in frames). */
  syncPulseFrom: 1498,
  syncPulsePeriod: 36,
  flipTextIn: 1486,
  flipTextOut: 1618,

  // 7. End card (1358–1608).
  endCardStart: 1630,
  logoAt: 1654,
  disclaimerAt: 1666,
  ctaAt: 1702,
  tapAt: 1740,
  /** Everything is still from here to the end (the held last second). */
  holdFrom: 1858,

  coverFrame: 1200,
};

// ─── Layout ──────────────────────────────────────────────────────────────────

/** Instagram covers the top 220px, the bottom 400px and the right 140px of a 1080×1920 reel. */
export const SAFE = {top: 220, bottom: 400, right: 140};

/** All text sits in this centred column (equal 140px margins). */
export const COLUMN = {x: 140, width: 800};

export type FormatId = 'vertical' | 'feed';

export const LAYOUT: Record<
  FormatId,
  {
    width: number;
    height: number;
    /** Top of the kinetic headline. */
    textTop: number;
    /** Font size of the kinetic lines. */
    textSize: number;
    /** Top of the scoreboards under the phones. */
    boardTop: number;
    /** Scale of the scoreboards. */
    boardScale: number;
    /** Lowest y any text may reach. */
    textBottom: number;
    /** Scale for the phone framing (bigger = phones smaller on screen). */
    distScale: number;
    /** Screen-space y of the phones' centre. */
    focusY: number;
    endLogoTop: number;
    endLogoSize: number;
    disclaimerTop: number;
  }
> = {
  vertical: {
    width: 1080,
    height: 1920,
    textTop: 256,
    textSize: 88,
    boardTop: 1336,
    boardScale: 1,
    textBottom: 1500,
    distScale: 1,
    focusY: 872,
    endLogoTop: 430,
    endLogoSize: 380,
    disclaimerTop: 1346,
  },
  feed: {
    width: 1080,
    height: 1350,
    textTop: 46,
    textSize: 72,
    boardTop: 1000,
    boardScale: 0.92,
    textBottom: 1250,
    distScale: 1.17,
    focusY: 600,
    endLogoTop: 150,
    endLogoSize: 330,
    disclaimerTop: 1000,
  },
};

// ─── Studio look ─────────────────────────────────────────────────────────────

export const STUDIO = {
  /** Cyclorama: navy, darker at the top. */
  wallTop: BRAND.bgTop,
  wallBottom: BRAND.bgBottom,
  floor: '#172036',
  /** Red pool under the left phone. */
  redGlow: '#E0383E',
  /** Warm gold pools. */
  goldGlow: BRAND.glow,
  goldHot: BRAND.goldB,
  /** The phones: a warm natural-titanium frame (iPhone-style "desert" tone) and matte back glass. */
  titanium: '#9C968D',
  backGlass: '#8F8A83',
  keyLight: '#FFE6BD',
};
