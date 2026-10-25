import {interpolate, spring} from 'remotion';
import {EASE, MOTION, SPRING_HERO, SPRING_TEXT, VIDEO} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [start, start+dur] with the shared entrance curve. */
export const ease = (frame: number, start: number, dur: number, easing = EASE.enter) =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing});

/** Critically damped entrance spring (no overshoot). */
export const enter = (frame: number, start: number, dur = MOTION.wordEnter) =>
  spring({frame: frame - start, fps: VIDEO.fps, config: SPRING_TEXT, durationInFrames: dur});

/** Hero spring: soft overshoot past 1 before settling. */
export const hero = (frame: number, start: number) =>
  spring({frame: frame - start, fps: VIDEO.fps, config: SPRING_HERO});

/** Hero entrance: scale 0.7→1, rotateY 25°→0, with the spring's overshoot. */
export const heroStyle = (p: number, extra = ''): React.CSSProperties => ({
  opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
  transform: `perspective(1400px) ${extra} rotateY(${interpolate(p, [0, 1], [25, 0])}deg) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
});

/** Scene exit: 0→1 over the last `dur` frames, accelerating (ease-in cubic). */
export const exitProgress = (frame: number, end: number, dur = MOTION.sceneExit) =>
  interpolate(frame, [end - dur, end], [0, 1], {...clamp, easing: EASE.exit});

export const exitStyle = (q: number): React.CSSProperties => ({
  opacity: 1 - q,
  filter: q > 0.001 ? `blur(${q * 12}px)` : undefined,
});

/** Stroke props that reveal a path (pathLength=1) between tail and head. */
export const dash = (head: number, tail = 0, opacity = 1): React.CSSProperties => {
  const len = Math.max(0, head - tail);
  return {strokeDasharray: `${len} 2`, strokeDashoffset: -tail, opacity: len > 0.0005 ? opacity : 0};
};

/** First frame at which ease(frame, start, dur) reaches `target`. */
export const frameAt = (target: number, start: number, dur: number) => {
  for (let f = start; f <= start + dur; f += 0.25) if (ease(f, start, dur) >= target) return f;
  return start + dur;
};

export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export type Pt = [number, number];

export const polyD = (pts: Pt[]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ');

/** Cumulative arc lengths of a polyline (last entry = total length). */
const cumLengths = (pts: Pt[]) => {
  const out = [0];
  for (let i = 1; i < pts.length; i++) out.push(out[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return out;
};

/** Point at fraction t (0–1) of a polyline's length. */
export const pointAt = (pts: Pt[], t: number): Pt => {
  const cum = cumLengths(pts);
  const target = Math.max(0, Math.min(1, t)) * cum[cum.length - 1];
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] >= target) {
      const k = (target - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
    }
  }
  return pts[pts.length - 1];
};

/** Fraction of a left-to-right polyline's length drawn when its head reaches x. */
export const fractionAtX = (pts: Pt[], x: number) => {
  const cum = cumLengths(pts);
  const total = cum[cum.length - 1];
  if (x <= pts[0][0]) return 0;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) {
      const k = (x - pts[i - 1][0]) / Math.max(1e-6, pts[i][0] - pts[i - 1][0]);
      return (cum[i - 1] + (cum[i] - cum[i - 1]) * k) / total;
    }
  }
  return 1;
};
