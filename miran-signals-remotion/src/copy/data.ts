/**
 * «كيف يعمل النسخ التلقائي مع Miran Gold» — the automatic copy trading explainer reel.
 *
 * Everything you are likely to change for THIS reel lives in this file: every word on the
 * phone, the board and the end card (Arabic; the brand is always written «Miran Gold»), the
 * placeholder numbers, the colours and the timings. Frames are at 60fps (60 = 1 second).
 *
 * ONE PHONE (gold finish), shown step by step on its screen:
 *   1. Hook: «ما هو النسخ التلقائي؟» and a small diagram (Miran Gold → your account).
 *   2. Connect your account (a generic "linked" screen: no real broker or platform).
 *   3. Choose your settings: the copy ratio and your total loss limit (sliders); withdrawals
 *      and deposits stay yours only (a locked row).
 *   4. Switch on «النسخ التلقائي».
 *   5. A Miran Gold gold signal (entry, stop loss, target) is copied: «نُسخت تلقائياً».
 *   6. A news alert before a high-impact release: the trade is closed by plan (copied).
 *   7. You control and see everything: the switch goes off («متوقف مؤقتاً») and on again, your
 *      loss limit, withdraw / deposit «أنت فقط», and the trade history.
 *   8. End card: wordmark, tagline, CTA and the risk disclaimer.
 *
 * EVERY NUMBER IS A PLACEHOLDER (illustrative, «توضيحي»): confirm them with Miran Gold.
 * See `PLACEHOLDERS` below and the README.
 */
import {BRAND} from '../data';

export {BRAND};

// ─── Placeholder numbers (confirm every one with Miran Gold) ─────────────────

export const PLACEHOLDERS = {
  /** Demo account balance ($). */
  balance: 10000,
  /** Copy ratio slider: from → to (× the size of the Miran Gold trade), and its range. */
  ratio: {from: 1.0, to: 0.5, min: 0.25, max: 2.0, step: 0.05},
  /** Total loss limit slider ($): the most you accept losing in total. From → to, and its range. */
  totalLoss: {from: 2000, to: 1000, min: 250, max: 5000, step: 50},
  /** The gold signal (USD per ounce): entry, stop loss and target. */
  signal: {entry: 4002.0, sl: 3997.0, tp: 4012.0},
  /**
   * How many dollars the demo account makes or loses per $1 move in gold, after the ×0.5
   * copy ratio. At the stop ($5 away) that is −$50 = 0.5% of the balance: inside the 1% limit.
   */
  dollarsPerPoint: 10,
  /** Where the trade is closed by plan before the news (USD per ounce). +$7 × 10 = +$70. */
  closePrice: 4009.0,
  /** "High-impact news in N minutes." */
  newsInMinutes: 15,
};

const P = PLACEHOLDERS;
export const MAX_LOSS = (P.signal.entry - P.signal.sl) * P.dollarsPerPoint; // $50
export const RESULT = (P.closePrice - P.signal.entry) * P.dollarsPerPoint; // +$70
export const FINAL_BALANCE = P.balance + RESULT;

// ─── Timings (frames at 60fps) ───────────────────────────────────────────────

export const T = {
  fps: 60,
  durationInFrames: 2420,

  // 1. Hook (0–250): the question, then the diagram.
  questionAt: 14,
  diagramAt: 100,

  // 2. Connect (250–530).
  connectPage: 250,
  connectTapAt: 330,
  linkedAt: 392,

  // 3. Settings (530–910): two sliders, a switch, save.
  settingsPage: 530,
  ratioGrab: 576,
  ratioRelease: 622,
  lossGrab: 664,
  lossRelease: 716,
  saveTapAt: 816,

  // 4. Automatic copy trading (910–1110).
  autoPage: 910,
  autoOnAt: 968,

  // 5–6. The account screen (from 1110): the signal, the news.
  dashPage: 1110,
  signalAt: 1140,
  /** Copied into the account: the trade opens here. */
  copiedAt: 1198,
  /** The Miran Gold news alert (high-impact release soon). */
  alertAt: 1380,
  /** The trade is closed by plan (copied automatically). */
  closedAt: 1474,
  /** The high-impact release itself (the chart moves hard; no trade is open). */
  newsAt: 1552,

  // 7. You control and see everything (a page of its own from controlAt).
  controlAt: 1640,
  pauseTapAt: 1702,
  resumeTapAt: 1790,
  limitCardAt: 1830,
  accessCardAt: 1880,
  historyCardAt: 1940,

  /** Page transitions last this many frames (centred on each page's start). */
  pageTr: 22,

  /** The board under the phone. */
  boardIn: 262,
  boardOut: 2070,

  // 8. End card.
  endCardStart: 2090,
  logoAt: 2114,
  disclaimerAt: 2128,
  ctaAt: 2164,
  tapAt: 2204,
  /** Everything is still from here to the end (the held last second). */
  holdFrom: 2360,

  coverFrame: 1250,
};

// ─── Copy (Arabic only; the brand is always «Miran Gold» in Latin letters) ────

export const ILLUSTRATIVE = 'توضيحي';

/** Keeps a number like «1%» or «×0.5» left-to-right inside an Arabic line (else it shows as «%1»). */
const iso = (s: string) => `\u2066${s}\u2069`;

/** Words inside the phone. */
export const SCREEN = {
  // Hook.
  hookQ1: 'ما هو',
  hookQ2: 'النسخ التلقائي؟',
  account: 'حسابك',
  hookFlow: 'صفقات Miran Gold',
  hookFlow2: 'تُنسخ إلى حسابك تلقائياً',

  // Connect.
  connectTitle: 'ربط الحساب',
  connectSub: 'اربط حسابك مع Miran Gold',
  accountSub: 'حساب التداول الخاص بك',
  miranSub: 'إشارات وتنبيهات الأخبار',
  connectBtn: 'ربط الحساب',
  connecting: 'جارٍ الربط…',
  linkedBtn: 'تم الربط',
  linked: 'تم الربط مع Miran Gold',
  /** What Miran Gold can do on the linked account, and what stays yours only. */
  permCopy: 'Miran Gold تنسخ الصفقات',
  permFunds: 'السحب والإيداع: أنت فقط',

  // Settings.
  settingsTitle: 'إعدادات النسخ',
  settingsSub: 'أنت تختار الحجم والمخاطرة',
  ratio: 'نسبة النسخ',
  ratioSub: 'حجم صفقاتك مقارنة بصفقة Miran Gold',
  loss: 'أقصى خسارة إجمالية',
  lossSub: 'أقصى ما تقبل خسارته بالمجموع',
  access: 'السحب والإيداع',
  onlyYou: 'أنت فقط',
  save: 'حفظ الإعدادات',
  saved: 'تم الحفظ',
  riskNote: 'النسخ لا يلغي المخاطرة، والنتائج قد تختلف',

  // Auto copy.
  autoTitle: 'النسخ التلقائي',
  autoCopy: 'النسخ التلقائي',
  off: 'متوقف',
  on: 'مفعّل',
  onBody: 'تُنسخ إشارات Miran Gold إلى حسابك',
  chipRatio: (r: string) => `نسبة ${iso(r)}`,
  chipLoss: (v: string) => `أقصى خسارة ${iso(v)}`,
  waiting: 'بانتظار إشارة Miran Gold',

  // Account screen.
  balance: 'رصيدك',
  openTrade: 'الصفقة المفتوحة',
  signalIsland: 'إشارة جديدة من Miran Gold',
  signalTitle: 'إشارة من Miran Gold',
  buyGold: 'شراء الذهب',
  entry: 'الدخول',
  stop: 'وقف الخسارة',
  stopShort: 'الوقف',
  target: 'الهدف',
  copied: 'نُسخت تلقائياً',
  yourSize: (r: string) => `حجمك ${r}`,
  maxLoss: 'الخسارة عند الوقف',

  alertIsland: 'تنبيه أخبار من Miran Gold',
  alertIslandSub: (m: number) => `خبر قوي بعد ${m} دقيقة`,
  alertTitle: 'تنبيه أخبار',
  alertBody: (m: number) => `خبر اقتصادي عالي التأثير بعد ${m} دقيقة`,
  alertPlan: 'الخطة: إغلاق الصفقة قبل الخبر',
  alertCopying: 'يُنسخ إلى حسابك تلقائياً',
  closedTitle: 'أُغلقت حسب الخطة',
  result: 'النتيجة',
  resultNote: 'النتيجة قد تكون ربحاً أو خسارة',
  newsIsland: 'صدر الخبر',
  newsIslandSub: 'لا صفقات مفتوحة',

  controlTitle: 'أنت المتحكّم',
  controlSub: 'وترى كل شيء أمامك',
  controlOn: 'مفعّل · تُنسخ الإشارات الجديدة',
  controlOff: 'متوقف مؤقتاً · لن تُنسخ إشارات جديدة',
  yourLimit: 'أنت تحدّدها',
  deposit: 'إيداع',
  withdraw: 'سحب',
  history: 'سجل الصفقات',
  live: 'مباشر',
  historyNote: 'أُغلقت حسب الخطة · نُسخت تلقائياً',
};

/** The board under the phone. */
export const BOARD = {
  label: 'حسابك',
  notLinked: 'غير مرتبط',
  linked: 'مرتبط · النسخ متوقف',
  on: 'النسخ التلقائي: مفعّل',
  paused: 'النسخ التلقائي: متوقف مؤقتاً',
};

/** The end card. */
export const END = {
  tagline: 'إشارات • تنبيهات الأخبار • نسخ تلقائي',
  cta: 'انضم إلى إشارات Miran Gold',
  disclaimer:
    'التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. النسخ التلقائي لا يلغي المخاطرة والنتائج قد تختلف. المحتوى توضيحي وليس ضماناً لأرباح مستقبلية.',
};

// ─── Colours (the gold Miran Gold screen theme comes from src/screens/draw.ts) ─

export const COLORS = {
  /** The phone: the same gold finish as the Miran Gold phone in the signals reel. */
  phoneFrame: '#E2B45C',
  phoneBack: '#C79B52',
  /** Status colours on the board and in the app. */
  on: BRAND.up,
  paused: '#E8A33D',
  off: '#9AA1B0',
  linked: BRAND.goldB,
  /** The news alert. */
  alert: '#E8A33D',
};

// ─── The market (one generic gold market; illustrative) ──────────────────────

export const MARKET = {
  /** The gold price as [frame, price] keyframes joined by a smooth curve. */
  price: [
    [400, 3999.2],
    [700, 4000.6],
    [1000, 4001.4],
    [1140, 4001.8],
    [1198, 4002.0],
    [1280, 4004.2],
    [1360, 4007.4],
    [1430, 4008.7],
    [1474, 4009.0],
    [1530, 4008.6],
    [1552, 4008.8],
    [1558, 4004.0],
    [1566, 3994.0],
    [1576, 3989.5],
    [1600, 3995.0],
    [1640, 4001.5],
    [1700, 3998.0],
    [1800, 4000.5],
    [1920, 4001.5],
  ] as [number, number][],
  tickNoise: 0.14,
  chartSpan: 504,
};

// ─── Layout per format ───────────────────────────────────────────────────────

export type CopyFormat = 'vertical' | 'feed';

export const LAYOUT: Record<
  CopyFormat,
  {
    width: number;
    height: number;
    /** Screen y of the phone's centre. */
    focusY: number;
    /** Camera distance scale (bigger = phone smaller on screen). */
    distScale: number;
    /** Top of the board under the phone, and its scale. */
    boardTop: number;
    boardScale: number;
    endLogoTop: number;
    endLogoSize: number;
    disclaimerTop: number;
    disclaimerSize: number;
  }
> = {
  vertical: {
    width: 1080,
    height: 1920,
    focusY: 772,
    distScale: 0.9,
    boardTop: 1362,
    boardScale: 0.95,
    endLogoTop: 400,
    endLogoSize: 360,
    disclaimerTop: 1190,
    disclaimerSize: 32,
  },
  feed: {
    width: 1080,
    height: 1350,
    focusY: 518,
    distScale: 1.1,
    boardTop: 1012,
    boardScale: 0.82,
    endLogoTop: 120,
    endLogoSize: 300,
    disclaimerTop: 830,
    disclaimerSize: 28,
  },
};
