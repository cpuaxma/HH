/**
 * Everything you are likely to change lives in this file:
 * every line of copy (Arabic and English), the numbers and prices, the colours and the timings.
 *
 * Frames are at 60fps (60 frames = 1 second). The reel is 1200 frames (20s).
 * The trading app, the "top trader" and every number are fictional and illustrative;
 * every number on screen carries an "توضيحي" (illustrative) label.
 */

// ─── Brand (Miran Gold) ──────────────────────────────────────────────────────

export const BRAND = {
  /** Studio / end card navy. */
  bgTop: '#0A0E18',
  bgBottom: '#131A2A',
  /** Gold accent: #D4A24C → #F3D27A. */
  goldA: '#D4A24C',
  goldB: '#F3D27A',
  /** Warm gold light (pools, glows). */
  glow: '#C8963E',
  goldDeep: '#8A6424',
  /** Light text on dark. */
  text: '#F5F1E8',
  /** Grey meta text. */
  meta: '#8C93A3',
  /** Dark UI cards. */
  card: '#141A28',
  /** P&L colours. */
  up: '#4CC38A',
  red: '#D9534F',
  ink: '#0A0E18',
};

export const GOLD_GRADIENT = `linear-gradient(100deg, ${BRAND.goldA} 0%, ${BRAND.goldB} 55%, ${BRAND.goldA} 100%)`;

// ─── Language ────────────────────────────────────────────────────────────────

export type Lang = 'ar' | 'en';

// ─── The market (one generic gold market, the same on both phones) ───────────

export const MARKET = {
  pair: 'XAU/USD',
  pairName: 'Gold · Spot',
  /** Candle length in frames (one candle per 0.33s of reel time). */
  candleFrames: 20,
  /** Candles visible on the chart. */
  visibleCandles: 26,
  /**
   * The gold price over the reel, as [frame, price] keyframes joined by a smooth curve
   * (plausible levels for late 2026; illustrative). The high-impact news candle is the
   * drop at frame 480.
   */
  price: [
    [-600, 3994.0],
    [-300, 3999.5],
    [0, 4005.2],
    [40, 4006.3],
    [70, 4004.0],
    [110, 4005.0],
    [150, 4004.2],
    [200, 4002.2],
    [224, 4001.0],
    [232, 4000.4],
    [244, 4002.0],
    [262, 4004.5],
    [292, 4009.6],
    [298, 4011.3],
    [318, 4012.9],
    [340, 4011.6],
    [370, 4013.2],
    [400, 4011.4],
    [430, 4012.8],
    [456, 4011.9],
    [478, 4012.4],
    [481, 4009.0],
    [486, 3997.0],
    [492, 3990.2],
    [505, 3993.8],
    [520, 3991.6],
    [534, 3993.0],
    [600, 3995.0],
    [720, 3997.5],
    [850, 4001.0],
    [872, 4001.5],
    [930, 4005.8],
    [1000, 4007.4],
    [1200, 4007.6],
  ] as [number, number][],
  /** Tiny live ticks on top of the curve ($). */
  tickNoise: 0.22,
};

/** The shared high-impact news release. Generic: no real date, no real outcome. */
export const NEWS = {
  /** Frame the news candle starts (the same frame on both phones). */
  at: 480,
  label: 'High-impact USD news',
  detail: 'US inflation data',
};

// ─── LEFT: trading without a plan ────────────────────────────────────────────

export const TOP_TRADER = 'TopTrader_07';

/** Trades on the left phone. Closed P&L is lots × 100 oz × price move. */
export const LEFT_TRADES = [
  {id: 'T1', source: 'copied', side: 'BUY', lots: 2.0, entry: 4006.1, close: 4004.0, closedAt: 70, pnl: -420},
  {id: 'T2', source: 'random', side: 'BUY', lots: 1.0, entry: 4004.2, openedAt: 150, close: 4001.0, closedAt: 224, pnl: -320},
  {id: 'T3', source: 'random', side: 'SELL', lots: 0.3, entry: 4004.5, openedAt: 262, close: 4009.6, closedAt: 292, pnl: -153},
  /** The big one: copied late, 8 lots at 1:500, no stop loss. Closed by the margin call. */
  {id: 'T4', source: 'copied', side: 'BUY', lots: 8.0, entry: 4012.9, openedAt: 318, close: 4010.08, closedAt: 506, pnl: -2257},
] as const;

export const LEFT = {
  leverage: '1:500',
  /** Balance keyframes [frame, $]: $10,000 → $6,850 (−31.5%). */
  balance: [
    [0, 10000],
    [70, 9580],
    [224, 9260],
    [292, 9107],
    [506, 6850],
  ] as [number, number][],
  /** Margin level shown before the news (8 lots at 1:500 on $9,107). */
  marginBefore: 142,
  /** Margin level at the news candle. */
  marginAtNews: 112,
  /** Final balance and change. */
  finalBalance: 6850,
  finalChangePct: -31.5,
  /** After the flip: the first Miran signal, risk 1% of $6,850 (0.14 lots, $5 stop). */
  afterFlip: {
    lots: 0.14,
    entry: 4001.5,
    sl: 3996.5,
    tp1: 4010.0,
    tp2: 4016.0,
    openedAt: 872,
    /** Floating P&L at the end of the reel: +$82 (+1.2%). */
    recoverPct: 1.2,
  },
};

/** Notifications on the left phone (stacking banners). `kind` picks the icon and colour. */
export const LEFT_NOTIFS = [
  {at: -30, kind: 'copy', title: 'Trade copied', body: `${TOP_TRADER} · BUY 2.00 XAU/USD`},
  {at: 16, kind: 'loss', title: 'Floating P&L −$380', body: 'BUY 2.00 · no stop loss'},
  {at: 70, kind: 'loss', title: 'Position closed −$420', body: 'BUY 2.00 · closed manually'},
  {at: 118, kind: 'copy', title: `${TOP_TRADER} opened a trade`, body: 'Tap to copy'},
  {at: 224, kind: 'loss', title: 'Position closed −$320', body: 'BUY 1.00 · closed manually'},
  {at: 292, kind: 'loss', title: 'Position closed −$153', body: 'SELL 0.30 · closed manually'},
  {at: 318, kind: 'copy', title: 'Trade copied', body: `${TOP_TRADER} · BUY 8.00 XAU/USD`},
  {at: 332, kind: 'warn', title: 'Margin warning', body: 'Margin level 142%'},
  {at: 494, kind: 'news', title: 'High-impact USD news released', body: 'US inflation data · just now'},
  {at: 512, kind: 'call', title: 'Margin call', body: 'Positions closed · balance $6,850'},
] as const;

// ─── RIGHT: trading with Miran Gold ──────────────────────────────────────────

/** The Miran signal (the strategy pillar). Risk 1% = $100: 0.40 lots, $2.50 stop; half closed at TP1. */
export const SIGNAL = {
  side: 'BUY',
  entry: 4000.5,
  sl: 3998.0,
  tp1: 4011.1,
  tp2: 4018.5,
  lots: 0.4,
  riskPct: 1,
  /** Half the position closed at TP1: 0.20 lots × 100 oz × $10.60. */
  tp1Profit: 212,
  /** Frame the entry fills (the support retest). */
  filledAt: 232,
  /** Frame TP1 is hit; the stop moves to break-even right after. */
  tp1At: 298,
  beAt: 312,
  /** The rest of the position is closed at break-even in the news spike. */
  beClosedAt: 486,
};

/** The fresh signal after the dust settles (half at TP1, half at TP2). */
export const FRESH_SIGNAL = {
  side: 'BUY',
  entry: 3993.0,
  sl: 3989.0,
  tp1: 4001.0,
  tp2: 4005.8,
  lots: 0.26,
  riskPct: 1,
  at: 524,
  tp1At: 850,
  tp1Profit: 104,
  tp2At: 930,
  tp2Profit: 166,
};

export const RIGHT = {
  /** Balance keyframes [frame, $]: $10,000 → $10,640 (+6.4%). */
  balance: [
    [0, 10000],
    [60, 10208],
    [130, 10158],
    [SIGNAL.tp1At, 10370],
    [FRESH_SIGNAL.tp1At, 10474],
    [FRESH_SIGNAL.tp2At, 10640],
  ] as [number, number][],
  finalBalance: 10640,
  finalChangePct: 6.4,
  /** Trade history (newest first at the end of the reel). One small, controlled loss. */
  history: [
    {at: 60, label: 'XAU/USD BUY · TP2 ✓', pnl: 208, pct: 2.1},
    {at: 130, label: 'XAU/USD SELL · stopped out', pnl: -50, pct: -0.5},
    {at: SIGNAL.tp1At, label: 'XAU/USD BUY · TP1 ✓', pnl: 212, pct: 2.1},
    {at: SIGNAL.beClosedAt, label: 'XAU/USD BUY · closed at break-even', pnl: 0, pct: 0},
    {at: FRESH_SIGNAL.tp1At, label: 'XAU/USD BUY · TP1 ✓', pnl: 104, pct: 1.0},
    {at: FRESH_SIGNAL.tp2At, label: 'XAU/USD BUY · TP2 ✓', pnl: 166, pct: 1.6},
  ],
};

/** Calm notification banners on the right phone. */
export const RIGHT_NOTIFS = [
  {at: 60, kind: 'tp', title: 'TP2 hit ✓ +$208', body: 'XAU/USD BUY · plan followed'},
  {at: 130, kind: 'sl', title: 'Stopped out −$50 (−0.5%)', body: 'Stop loss respected · risk controlled'},
  {at: 190, kind: 'signal', title: 'New Miran Gold signal', body: 'XAU/USD BUY · entry, stop loss, targets'},
  {at: SIGNAL.tp1At, kind: 'tp', title: 'TP1 hit ✓ +$212', body: 'Stop loss moved to break-even'},
  {at: SIGNAL.beClosedAt + 4, kind: 'shield', title: 'Closed at break-even', body: 'Protected · profit already secured'},
  {at: FRESH_SIGNAL.at, kind: 'signal', title: 'New Miran Gold signal', body: 'After the dust settles · XAU/USD BUY'},
  {at: FRESH_SIGNAL.tp1At, kind: 'tp', title: 'TP1 hit ✓ +$104', body: 'Stop loss moved to break-even'},
  {at: FRESH_SIGNAL.tp2At, kind: 'tp', title: 'TP2 hit ✓ +$166', body: 'Trade closed · plan followed'},
] as const;

/** Notifications on the left phone once it has switched to Miran Gold. */
export const LEFT_AFTER_NOTIFS = [
  {at: 858, kind: 'signal', title: 'Miran Gold signal', body: 'XAU/USD BUY · stop loss set · risk 1%'},
  {at: 900, kind: 'update', title: 'Miran market update', body: 'Today’s plan for gold'},
] as const;

// ─── Copy ────────────────────────────────────────────────────────────────────
// Kinetic lines: `gold` / `red` list words (matched word by word, punctuation ignored)
// drawn in the gold gradient / loss red. Numbers inside Arabic lines are wrapped in <bdi>.

export type Block = {lines: string[]; gold?: string[]; red?: string[]};
export type Pillar = {name: string; without: string; with: string; withGold?: string[]};

type Copy = {
  hookA: Block;
  hookB: Block;
  labelLeft: string;
  labelRight: string;
  pillars: [Pillar, Pillar, Pillar];
  twistA: Block;
  twistB: Block;
  flip: Block;
  cta: string;
  disclaimer: string;
  illustrative: string;
  /** "1/3" style chip label before the pillar name. */
  pillarWord: string;
};

export const COPY: Record<Lang, Copy> = {
  ar: {
    hookA: {lines: ['نفس السوق.', 'نفس الذهب.'], gold: ['الذهب']},
    hookB: {lines: ['نتيجتان مختلفتان.'], gold: ['مختلفتان']},
    labelLeft: 'تداول بلا خطة',
    labelRight: 'التداول مع ميران جولد',
    pillars: [
      {name: 'الاستراتيجية', without: 'بلا استراتيجية', with: 'استراتيجية واضحة'},
      {name: 'إدارة المخاطر', without: 'بلا إدارة مخاطر', with: 'إدارة مخاطر بنسبة 1%'},
      {name: 'تحديثات السوق', without: 'تجاهل أخبار السوق', with: 'تحديثات السوق أولاً بأول'},
    ],
    twistA: {lines: ['الفرق ليس في الحظ…']},
    twistB: {lines: ['بل في الخطة.'], gold: ['الخطة']},
    flip: {lines: ['تداول بخطة', 'مع ميران جولد.'], gold: ['ميران', 'جولد']},
    cta: 'انضم إلى إشارات ميران جولد',
    disclaimer: 'التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. النتائج المعروضة توضيحية وليست ضماناً لأرباح مستقبلية.',
    illustrative: 'توضيحي',
    pillarWord: 'الركيزة',
  },
  en: {
    hookA: {lines: ['Same market.', 'Same gold.'], gold: ['gold']},
    hookB: {lines: ['Two different results.'], gold: ['different']},
    labelLeft: 'Trading without a plan',
    labelRight: 'Trading with Miran Gold',
    pillars: [
      {name: 'Strategy', without: 'No strategy', with: 'A clear strategy'},
      {name: 'Risk management', without: 'No risk management', with: '1% risk per trade'},
      {name: 'Market updates', without: 'Ignoring the news', with: 'Updates as they happen'},
    ],
    twistA: {lines: ["It isn't luck…"]},
    twistB: {lines: ["It's the plan."], gold: ['plan']},
    flip: {lines: ['Trade with a plan', 'with Miran Gold.'], gold: ['Miran', 'Gold']},
    cta: 'Join Miran Gold signals',
    disclaimer: 'Trading involves high risk and you may lose your capital. Results shown are illustrative and not a guarantee of future profits.',
    illustrative: 'Illustrative',
    pillarWord: 'Pillar',
  },
};

/** Text drawn inside the phone screens that changes with the language (Miran's own cards). */
export const SCREEN_COPY: Record<
  Lang,
  {
    rtl: boolean;
    brand: string;
    signalTitle: string;
    reason: string;
    updateTitle: string;
    updateBody: string;
    updateAction: string;
    protectedTitle: string;
    protectedBody: string;
    freshTitle: string;
    checklistTitle: string;
    checklist: [string, string, string];
    source: string;
    todayTitle: string;
    todayBody: string;
    connected: string;
    illustrative: string;
  }
> = {
  ar: {
    rtl: true,
    brand: 'ميران جولد',
    signalTitle: 'إشارة ميران جولد',
    reason: 'إعادة اختبار الدعم + الاتجاه',
    updateTitle: 'تحديث السوق',
    updateBody: 'بيانات أمريكية عالية التأثير خلال 30 دقيقة',
    updateAction: 'احمِ صفقاتك المفتوحة · انتظر التأكيد',
    protectedTitle: 'صفقتك محمية',
    protectedBody: 'وقف الخسارة عند نقطة الدخول',
    freshTitle: 'إشارة جديدة بعد هدوء السوق',
    checklistTitle: 'خطة ميران جولد',
    checklist: ['استراتيجية', 'إدارة مخاطر', 'تحديثات السوق'],
    source: 'مصدر الإشارة: ميران جولد',
    todayTitle: 'تحديث السوق · اليوم',
    todayBody: 'تقلبات بعد البيانات الأمريكية · ادخل بعد التأكيد فقط',
    connected: 'تم الربط مع ميران جولد',
    illustrative: 'توضيحي',
  },
  en: {
    rtl: false,
    brand: 'Miran Gold',
    signalTitle: 'Miran Gold signal',
    reason: 'Support retest + trend',
    updateTitle: 'Market update',
    updateBody: 'High-impact USD data in 30 min',
    updateAction: 'Protect open trades · wait for confirmation',
    protectedTitle: 'Your trade is protected',
    protectedBody: 'Stop loss at break-even',
    freshTitle: 'New signal after the dust settles',
    checklistTitle: 'The Miran Gold plan',
    checklist: ['Strategy', 'Risk management', 'Market updates'],
    source: 'Signal source: Miran Gold',
    todayTitle: 'Market update · today',
    todayBody: 'Volatile after the USD data · enter on confirmation only',
    connected: 'Connected to Miran Gold',
    illustrative: 'Illustrative',
  },
};

// ─── Timings (frames at 60fps) ───────────────────────────────────────────────

export const TIMING = {
  fps: 60,
  durationInFrames: 1200,

  // 1. Hook (0–180): wide two-shot, two headlines.
  hookAIn: 8,
  hookAOut: 86,
  hookBIn: 94,
  hookBOut: 168,

  // 2. The gap (180–540): one shot per pillar. [chipIn, redIn, goldIn, out].
  gapStart: 180,
  pillars: [
    {from: 180, to: 300, redIn: 196, goldIn: 256, out: 294},
    {from: 300, to: 420, redIn: 318, goldIn: 344, out: 412},
    {from: 420, to: 540, redIn: 432, goldIn: 446, out: 532},
  ],
  /** The Miran signal card builds line by line from here (one line every `signalLineGap`). */
  signalBuildAt: 246,
  signalLineGap: 6,
  /** The Miran market-update card lands on the right phone. */
  updateAt: 436,
  /** Phones lean back for the overhead shot, and stand up again. */
  leanFrom: 420,
  leanIn: 462,
  leanOut: 540,
  leanBack: 586,

  // 3. The twist (540–720): push in on the right phone's screen.
  twistStart: 540,
  checklistAt: 562,
  /** The three checklist ticks (on the voiceover's three words). */
  ticks: [576, 633, 694],
  tagAt: 700,
  twistAIn: 556,
  twistAOut: 634,
  twistBIn: 642,
  twistBOut: 714,

  // 4. The flip (720–1020).
  flipSceneStart: 720,
  streakStart: 722,
  streakEnd: 762,
  flipStart: 782,
  flipEnd: 836,
  impactAt: 836,
  impactFrames: 3,
  /** Both phones pulse gold together from here (period in frames). */
  syncPulseFrom: 880,
  syncPulsePeriod: 36,
  flipTextIn: 866,
  flipTextOut: 1014,

  // 5. End card (1020–1200).
  endCardStart: 1020,
  logoAt: 1040,
  ctaAt: 1080,
  tapAt: 1112,
  disclaimerAt: 1050,
  /** Everything is still from here to the end (the held last second). */
  holdFrom: 1140,

  coverFrame: 960,
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
    /** Top of the kinetic headline block. */
    textTop: number;
    /** Font size of the big kinetic lines. */
    textSize: number;
    /** Size of the split pillar lines. */
    splitSize: number;
    /** Lowest y any text or label may reach. */
    textBottom: number;
    /** Scale for the phone framing (bigger = phones smaller on screen). */
    distScale: number;
    /** Screen-space y of the camera target in the wide shots. */
    focusY: number;
    /** Screen-space y of the camera target in the macro shots. */
    macroFocusY: number;
    /** Where the checklist card's centre lands at the end of the twist push-in. */
    pushFocusY: number;
    endLogoTop: number;
    endLogoSize: number;
  }
> = {
  vertical: {
    width: 1080,
    height: 1920,
    textTop: 262,
    textSize: 104,
    splitSize: 66,
    textBottom: 1500,
    distScale: 1,
    focusY: 1030,
    macroFocusY: 1270,
    pushFocusY: 1010,
    endLogoTop: 430,
    endLogoSize: 380,
  },
  feed: {
    width: 1080,
    height: 1350,
    textTop: 96,
    textSize: 84,
    splitSize: 58,
    textBottom: 1250,
    distScale: 1.1,
    focusY: 790,
    macroFocusY: 905,
    pushFocusY: 730,
    endLogoTop: 150,
    endLogoSize: 330,
  },
};

// ─── Studio look ─────────────────────────────────────────────────────────────

export const STUDIO = {
  /** Cyclorama: navy, darker at the top. */
  wallTop: BRAND.bgTop,
  wallBottom: BRAND.bgBottom,
  floor: '#0E1422',
  /** Cold red pool under the left phone. */
  redGlow: BRAND.red,
  /** Warm gold pools. */
  goldGlow: BRAND.glow,
  goldHot: BRAND.goldB,
  /** Dark titanium frame. */
  titanium: '#4A4D55',
  backGlass: '#1A1D24',
  keyLight: '#FFE2B0',
};

// ─── Voiceover (optional) ────────────────────────────────────────────────────
// Generated by scripts/make-voiceover.py into public/vo/. `at` is the start frame.

export const VOICEOVER = {
  /** Set to false for an effects-only mix. */
  enabled: true,
  volume: 0.7,
  /** Effects dip to this level under the voice. */
  duckTo: 0.5,
  /** `tempo` (optional) speeds a line up in the polish step, keeping its pitch. */
  lines: [
    {file: 'hook', text: 'نفس السوق… نتيجتان مختلفتان.', at: 14},
    {file: 'twist', text: 'استراتيجية، إدارة مخاطر، وتحديثات السوق.', at: 572, tempo: 1.1},
    {file: 'flip', text: 'تداول بخطة مع ميران جولد.', at: 868},
  ],
};
