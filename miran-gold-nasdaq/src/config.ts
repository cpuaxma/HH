/**
 * Single source of truth for the reel: video format, colors, copy, timings and layout.
 * Edit text, timings or colors here; the scene components read everything from this file.
 *
 * Copy rules: Arabic text exactly as briefed, Western digits (0-9) only.
 * A scene's text is given as `lines` (explicit line breaks); the words are joined with spaces,
 * so the sentence itself is unchanged.
 */

export const VIDEO = {
  id: 'NasdaqReel',
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 33 * 30, // 990
};

const s = (seconds: number) => Math.round(seconds * VIDEO.fps);

export const COLORS = {
  bg: '#0B0B0C',
  gold: '#D4AF37',
  goldLight: '#F4DC8A',
  goldDeep: '#9C7A1E',
  white: '#FFFFFF',
  gray: '#8A8A8A',
  red: '#E5484D',
  redDeep: '#8E1F23',
};

export const GOLD_TEXT_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 48%, ${COLORS.goldDeep} 100%)`;

export const FONT = {
  // Cairo is loaded via @remotion/google-fonts in fonts.ts; these follow it if a glyph is missing.
  fallback: "'Noto Kufi Arabic', 'Noto Sans Arabic', 'Segoe UI', Tahoma, 'DejaVu Sans', Arial, sans-serif",
  bold: 700,
  extraBold: 800,
  lineHeight: 1.45,
};

/** Instagram Reels safe zones. All key text stays between these lines. */
export const SAFE = {
  top: 250,
  bottom: 340,
  side: 110,
  get contentTop() {
    return this.top;
  },
  get contentBottom() {
    return VIDEO.height - this.bottom; // 1580
  },
  get contentWidth() {
    return VIDEO.width - this.side * 2; // 860
  },
};

/** Scene windows in frames (absolute). Transitions cross-fade across each boundary. */
export const SCENES = {
  hook: {from: 0, to: s(3)},
  whatIs: {from: s(3), to: s(9)},
  notEqual: {from: s(9), to: s(17)},
  domino: {from: s(17), to: s(25)},
  takeaway: {from: s(25), to: s(30)},
  cta: {from: s(30), to: s(33)},
} as const;

export type SceneKey = keyof typeof SCENES;

/** Length of each cross-scene transition (centered on the boundary). */
export const TRANSITION = 16;

export const TEXT = {
  hook: {
    lines: ['لماذا يهبط', 'السوق كله', 'بسبب سهم واحد؟'],
  },
  whatIs: {
    titleWords: ['مؤشر', 'ناسداك'], // followed by the 0 → 100 counter
    counterTo: 100,
    body: ['يضم أكبر 100 شركة غير مالية', 'في بورصة ناسداك'],
  },
  notEqual: {
    first: ['لكن الشركات', 'ليست متساوية الوزن'],
    second: ['كلما كبرت الشركة،', 'زاد تأثيرها على المؤشر'],
    label: 'مثال توضيحي',
  },
  domino: {
    first: ['وعندما يتعرض قطاع', 'الذكاء الاصطناعي للضغط...'],
    second: ['العمالقة تهبط...', 'والمؤشر كله يهبط'],
    label: 'مثال توضيحي',
    dropTo: -3, // percent
    dropDecimals: 1,
  },
  takeaway: {
    lines: ['قبل أن تتداول المؤشر...', 'اعرف من يحركه'],
    highlightLine: 1, // index of the line that gets the gold highlight band
  },
  // The outro (Miran Gold brand end card) is in English; everything before it is Arabic.
  cta: {
    line: 'Learn more with Miran Gold',
    brandWords: ['Miran', 'Gold'], // shown in gold
    button: 'Link in bio',
    footer: 'Educational content, not investment advice',
  },
};

/** Per-scene beats, in frames relative to the scene's own start. */
export const BEATS = {
  hook: {wordsAt: 2, stagger: 4},
  whatIs: {
    titleAt: 4,
    counterFrom: 10,
    counterTo: 70,
    bodyAt: 44,
    stagger: 4,
  },
  notEqual: {
    firstAt: 4,
    morphFrom: 18, // dots travel to their bubble positions
    morphDur: 46,
    swellFrom: 62, // the giants grow
    swellDur: 50,
    labelAt: 84,
    secondAt: 120,
    stagger: 4,
  },
  domino: {
    firstAt: 4,
    regroupFrom: 10, // bubble cluster shrinks up to make room for the chart
    regroupDur: 34,
    chartAt: 24,
    dropFrom: 64, // giants turn red + shrink, chart falls, counter runs
    dropDur: 66,
    labelAt: 40,
    secondAt: 138,
    stagger: 4,
  },
  takeaway: {firstAt: 4, highlightFrom: 54, highlightDur: 26, stagger: 5},
  cta: {logoAt: 0, shimmerFrom: 16, shimmerDur: 34, lineAt: 22, buttonAt: 36, footerAt: 46, stagger: 3},
};

/** Layout (absolute pixel positions; y values are top edges unless noted). */
export const LAYOUT = {
  topLogo: {size: 104, top: SAFE.top + 6},
  progress: {height: 5, inset: 140, bottom: SAFE.bottom + 2},

  hook: {centerY: 880, fontSize: 104},

  whatIs: {titleTop: 420, titleSize: 96, bodyTop: 572, bodySize: 52},
  /** 10×10 grid of index constituents (scene 2). */
  grid: {cols: 10, rows: 10, gap: 66, centerX: 540, centerY: 1098, dotRadius: 10},

  notEqual: {firstTop: 420, firstSize: 68, secondTop: 1340, secondSize: 52},
  /** Bubble cluster (scenes 3-4): region the packing fills. */
  bubbles: {
    centerX: 540,
    centerY: 1000,
    minX: 130,
    maxX: 950,
    minY: 706,
    maxY: 1292,
    gap: 7,
    giantRadii: [138, 116, 100, 88, 76, 66, 58],
    smallMin: 10,
    smallMax: 21,
    labelTop: 652,
  },

  domino: {
    firstTop: 410,
    firstSize: 62,
    clusterScale: 0.56,
    clusterCenterY: 800,
    giantShrink: 0.6,
    chartTop: 1050,
    chartHeight: 270,
    chartLeft: 130,
    chartRight: 950,
    numberSize: 96,
    secondTop: 1360,
    secondSize: 52,
  },

  takeaway: {centerY: 900, fontSize: 78},

  cta: {logoSize: 440, logoTop: 400, lineTop: 900, lineSize: 62, buttonTop: 1030, buttonSize: 46, footerTop: 1500, footerSize: 28},
};

/** Optional soundtrack slot. Put a file in public/ and set its name here (e.g. 'music.mp3'). */
export const AUDIO: {src: string | null; volume: number; fadeOutFrames: number} = {
  src: null,
  volume: 0.8,
  fadeOutFrames: 30,
};

export const MOTION = {
  /** Word reveal spring: soft, no overshoot. */
  word: {damping: 200, stiffness: 140, mass: 0.7},
  /** Punchy hook spring: overshoots a little. */
  punch: {damping: 12, stiffness: 170, mass: 0.8},
  /** Bubbles/dots. */
  bubble: {damping: 18, stiffness: 90, mass: 1},
  wordRise: 26,
  wordBlur: 10,
  glowPulseFrames: 54, // one soft gold pulse cycle
};
