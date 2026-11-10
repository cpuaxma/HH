/**
 * «ما علاقة الحيوانات بالتداول؟» — what the market animals mean (an educational reel).
 *
 * Everything you are likely to change for THIS reel lives in this file: the words (Arabic;
 * the brand is always written «Miran Gold»), the timings, the colours, the chart's moves and
 * the layout per format. Frames are at 60fps (60 = 1 second).
 *
 * The beats (one animal at a time, sculpted in gold or silver metal, with a gold price chart
 * behind that reacts to each one):
 *   1. Hook: a bull and a bear face off. The chart chops sideways.
 *   2. The bull «الثور»: its horns thrust up and the chart climbs.
 *   3. The bear «الدب»: its paw swipes down and the chart drops.
 *   4. The whale «الحوت»: it surfaces and one big candle forms.
 *   5. The hawk «الصقر» (hawkish): it dives and the gold chart dips.
 *   6. The dove «الحمامة» (dovish): it rises and the chart lifts.
 *      Under 5–6: «ليس دائماً — السوق يتأثر بعوامل كثيرة».
 *   Tie-in: a Miran Gold news alert on the phone before a rate decision.
 *   7. End card: wordmark, tagline, CTA and the risk disclaimer.
 *
 * Educational only: no buy/sell advice, no predictions, nothing real (no rate decision,
 * date, central bank or person). Everything is labelled «توضيحي».
 */
import {BRAND} from '../data';

export {BRAND};

// ─── Timings (frames at 60fps) ───────────────────────────────────────────────

export const T = {
  fps: 60,
  durationInFrames: 2100,

  // 1. Hook (0–240): the face-off.
  hookTitleIn: 12,
  hookTitleOut: 228,
  /** Bull and bear lean in towards each other (the face-off pushes). */
  faceoffPush: [70, 150] as number[],

  // 2. The bull (240–490).
  bullAt: 240,
  bullLabel: 262,
  /** Horns thrust up (the chart starts climbing on the first thrust). */
  bullThrust: [318, 404] as number[],

  // 3. The bear (490–740).
  bearAt: 490,
  bearLabel: 520,
  /** The paw goes up, then swipes down (the chart drops from the swipe). */
  bearRaise: 548,
  bearSwipe: 592,

  // 4. The whale (740–1000).
  whaleAt: 740,
  whaleSurface: 772,
  whaleLabel: 796,
  /** The big candle forms from here (the chart's clock slows so you can watch it). */
  whaleCandle: 836,
  whaleDive: 948,

  // 5. The hawk (1000–1290).
  hawkAt: 1000,
  hawkDive: 1010,
  hawkLabel: 1040,
  /** The bottom of the dive: the chart dips from here. */
  hawkStrike: 1062,

  // 6. The dove (1290–1550).
  doveAt: 1290,
  doveRise: 1298,
  doveLabel: 1322,
  doveLift: 1346,

  /** The note «ليس دائماً…» stays up from the hawk to the end of the dove (and the phone). */
  noteIn: 1074,
  noteOut: 1766,

  // Tie-in (1550–1800): the Miran Gold news alert before a rate decision.
  phoneAt: 1534,
  alertAt: 1630,

  // 7. End card.
  endCardStart: 1800,
  logoAt: 1824,
  disclaimerAt: 1838,
  ctaAt: 1874,
  tapAt: 1914,
  /** Everything is still from here to the end (the held last second). */
  holdFrom: 2040,

  coverFrame: 360,
};

// ─── Copy (Arabic only; the brand is always «Miran Gold» in Latin letters) ────

export const ILLUSTRATIVE = 'توضيحي';

/** Set to false to drop the opening question from the screen (it is in the narration too). */
export const SHOW_HOOK_TITLE = true;

export const COPY = {
  hook: 'ما علاقة الحيوانات بالتداول؟',
  /** One short name label per animal (one or two words). */
  labels: {
    bull: 'الثور',
    bear: 'الدب',
    whale: 'الحوت',
    hawk: 'الصقر',
    dove: 'الحمامة',
  },
  /** The note under the hawk and the dove. */
  note: 'ليس دائماً — السوق يتأثر بعوامل كثيرة',
};

/** The phone's news alert (no real rate decision, central bank or date). */
export const PHONE_COPY = {
  islandTitle: 'تنبيه أخبار من Miran Gold',
  islandSub: 'قرار فائدة مرتقب',
  cardTitle: 'تنبيه أخبار',
  cardBody: 'قرار فائدة مرتقب',
  cardNote: 'تقلّبات محتملة في سعر الذهب',
  chartLabel: 'الذهب',
};

/** The end card. */
export const END = {
  tagline: 'إشارات • تنبيهات الأخبار • نسخ تلقائي',
  cta: 'انضم إلى إشارات Miran Gold',
  disclaimer:
    'التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. المحتوى تعليمي وتوضيحي فقط وليس نصيحة استثمارية أو توصية بالشراء أو البيع، ولا يضمن نتائج مستقبلية.',
};

// ─── Colours ─────────────────────────────────────────────────────────────────

export const COLORS = {
  /** The metals (colour is the metal's reflectance; roughness 0 = mirror; env = reflection strength). */
  gold: {base: '#EDBE62', roughness: 0.2, env: 1.7},
  silver: {base: '#D6DCE6', roughness: 0.17, env: 1.6},
  /** The chart behind. */
  chartLine: '#F3D27A',
  candleUp: '#E0AE50',
  candleDown: '#AEB7C6',
  grid: 'rgba(243,210,122,0.10)',
  /** Glow tint per beat (the chart's light and the floor ring). */
  tint: {
    hook: '#C8963E',
    bull: '#F0C060',
    bear: '#9FB0CC',
    whale: '#F3D27A',
    hawk: '#A8B4C8',
    dove: '#F3D27A',
    phone: '#C8963E',
  },
  /** The phone: the same gold finish as the Miran Gold phone in the other reels. */
  phoneFrame: '#E2B45C',
  phoneBack: '#C79B52',
  alert: '#E8A33D',
};

// ─── The chart (abstract: no prices or numbers are shown) ────────────────────

export const CHART = {
  /**
   * The price, from 0 (bottom of the chart) to 1 (top), as [chart frame, level] keyframes.
   * The chart has its own clock (it slows down while the whale's big candle forms), so
   * these frames are chart frames; see `chartClock` in story.ts.
   */
  price: [
    [-560, 0.47],
    [-470, 0.5],
    [-380, 0.45],
    [-300, 0.49],
    [-220, 0.44],
    [-140, 0.48],
    [-60, 0.45],
    // Hook: sideways chop as the bull and the bear push.
    [20, 0.49],
    [80, 0.44],
    [130, 0.5],
    [180, 0.45],
    [240, 0.48],
    [300, 0.46],
    // The bull: buyers in control, the chart climbs.
    [330, 0.5],
    [372, 0.6],
    [404, 0.63],
    [430, 0.72],
    [470, 0.76],
    [520, 0.75],
    [575, 0.77],
    // The bear: sellers in control, the chart drops.
    [600, 0.72],
    [630, 0.58],
    [660, 0.52],
    [690, 0.38],
    [720, 0.32],
    [775, 0.33],
    [800, 0.31],
    // The whale: one big order, one big candle. The jump itself is added in story.ts so it
    // always fills exactly one candle (CHART.whale), whatever the timings.
    [800, 0.31],
    [1010, 0.61],
    // The hawk: the gold chart dips.
    [1062, 0.6],
    [1090, 0.5],
    [1120, 0.44],
    [1150, 0.42],
    [1210, 0.44],
    [1320, 0.43],
    // The dove: the chart lifts.
    [1346, 0.45],
    [1380, 0.53],
    [1420, 0.6],
    [1460, 0.64],
    [1530, 0.63],
    // Before the rate decision: waiting, sideways.
    [1590, 0.65],
    [1650, 0.62],
    [1710, 0.64],
    [1790, 0.63],
  ] as [number, number][],
  /** Small tick noise on top of the curve. */
  noise: 0.007,
  /** Chart frames per candle, and how many candles fit across. */
  candle: 22,
  candles: 20,
  /** The whale's candle: from → to (one candle), and how many reel frames the chart's clock
   * falls behind while it forms (it slows down, then catches up once the whale is under). */
  whale: {from: 0.315, to: 0.62, slow: 34},
  /** Panel in the studio (world units): centre and size. */
  panel: {x: 0, y: 1.86, z: -2.6, w: 4.6, h: 2.5},
};

// ─── Layout per format ───────────────────────────────────────────────────────

export type AnimalsFormat = 'vertical' | 'feed';

export const LAYOUT: Record<
  AnimalsFormat,
  {
    width: number;
    height: number;
    /** Screen y (fraction of the height) of the camera target. */
    focus: number;
    /** Camera distance scale (bigger = everything smaller on screen). */
    distScale: number;
    /** The hook question: top (px) and size. */
    titleTop: number;
    titleSize: number;
    /** The animal's name label: top (px) and size; the note under it. */
    labelTop: number;
    labelSize: number;
    noteSize: number;
    endLogoTop: number;
    endLogoSize: number;
    disclaimerTop: number;
    disclaimerSize: number;
  }
> = {
  vertical: {
    width: 1080,
    height: 1920,
    focus: 0.41,
    distScale: 1,
    titleTop: 236,
    titleSize: 64,
    labelTop: 1330,
    labelSize: 92,
    noteSize: 34,
    endLogoTop: 380,
    endLogoSize: 340,
    disclaimerTop: 1160,
    disclaimerSize: 31,
  },
  feed: {
    width: 1080,
    height: 1350,
    focus: 0.4,
    distScale: 1.2,
    titleTop: 86,
    titleSize: 58,
    labelTop: 1000,
    labelSize: 80,
    noteSize: 30,
    endLogoTop: 96,
    endLogoSize: 280,
    disclaimerTop: 800,
    disclaimerSize: 27,
  },
};
