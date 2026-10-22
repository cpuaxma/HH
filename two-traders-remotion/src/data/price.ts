import {random} from 'remotion';

// One deterministic gold price path, shared by both monitors and the hook strip.
// x is "market time" (0..104), y is a normalised price (0 low → 1 high).
// Spike (S1) · entry zone (S2) · sharp drop (S3) · chop (S4) · reversal rally (S5)
const ANCHORS: Array<[number, number]> = [
  [0, 0.36], [4, 0.4], [8, 0.34], [12, 0.42], [15, 0.48], [17, 0.62], [19, 0.74], [21, 0.7],
  [24, 0.72], [27, 0.68], [30, 0.71], [33, 0.67], [36, 0.7], [39, 0.69],
  [42, 0.58], [45, 0.46], [48, 0.36], [51, 0.28], [53, 0.31], [56, 0.26],
  [58, 0.36], [60, 0.27], [62, 0.38], [64, 0.24], [66, 0.34], [68, 0.22], [70, 0.3], [72, 0.2], [74, 0.16],
  [76, 0.22], [78, 0.27], [80, 0.35], [83, 0.47], [86, 0.57], [89, 0.66], [92, 0.74], [95, 0.8], [100, 0.86], [104, 0.88],
];

const cosLerp = (a: number, b: number, t: number) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;

// Small seeded wiggle so the line reads as a live market
const noise = (t: number) => {
  const step = 0.5;
  const i = Math.floor(t / step);
  const f = (t - i * step) / step;
  const n = (k: number) => random(`gold-${k}`) * 2 - 1;
  return cosLerp(n(i), n(i + 1), f) * 0.011;
};

export const priceAt = (t: number) => {
  const x = Math.max(0, Math.min(104, t));
  let k = 0;
  while (k < ANCHORS.length - 2 && ANCHORS[k + 1][0] < x) k++;
  const [x0, y0] = ANCHORS[k];
  const [x1, y1] = ANCHORS[k + 1];
  return cosLerp(y0, y1, (x - x0) / (x1 - x0)) + noise(x);
};

// Frame → how much of the market has happened
const REVEAL: Array<[number, number]> = [
  [0, 6], [70, 21], [300, 22], [880, 38], [900, 39], [960, 44], [1040, 52], [1600, 56],
  [1620, 56], [2270, 74], [2280, 74], [2560, 90], [3000, 100], [3600, 104],
];

export const marketTime = (frame: number) => {
  if (frame <= REVEAL[0][0]) return REVEAL[0][1];
  for (let i = 0; i < REVEAL.length - 1; i++) {
    const [f0, m0] = REVEAL[i];
    const [f1, m1] = REVEAL[i + 1];
    if (frame <= f1) return m0 + ((m1 - m0) * (frame - f0)) / (f1 - f0);
  }
  return REVEAL[REVEAL.length - 1][1];
};

export const priceAtFrame = (frame: number) => priceAt(marketTime(frame));

const firstFrame = (from: number, to: number, test: (p: number) => boolean) => {
  for (let f = from; f <= to; f++) if (test(priceAtFrame(f))) return f;
  return to;
};

// Trade events, derived from the path so markers and levels always line up
const BUY_FRAME = 430;
const T1_FRAME = 450;
const CLOSE_FRAME = 2272;
const T2_FRAME = 2300;

const t1Entry = priceAtFrame(T1_FRAME);
const t2Entry = priceAtFrame(T2_FRAME);

export const EVENTS = {
  buy: {frame: BUY_FRAME, m: marketTime(BUY_FRAME), price: priceAtFrame(BUY_FRAME)},
  close: {frame: CLOSE_FRAME, m: marketTime(CLOSE_FRAME), price: priceAtFrame(CLOSE_FRAME)},
  trade1: {
    frame: T1_FRAME,
    m: marketTime(T1_FRAME),
    entry: t1Entry,
    tp: t1Entry + 0.1,
    sl: t1Entry - 0.08,
    slHit: firstFrame(900, 1100, (p) => p <= t1Entry - 0.08),
  },
  trade2: {
    frame: T2_FRAME,
    m: marketTime(T2_FRAME),
    entry: t2Entry,
    tp: t2Entry + 0.2,
    sl: t2Entry - 0.08,
    tpHit: firstFrame(T2_FRAME, 3000, (p) => p >= t2Entry + 0.2),
  },
};

// Placeholder price levels for the trade cards (no currency, labelled Illustrative)
export const levelValue = (p: number) => (4100 + p * 160).toFixed(2);
