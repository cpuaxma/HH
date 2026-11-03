// The feed's scroll position as a pure function of (fractional) time.
//
// THE SCROLL: thumb flicks keep the feed racing; each flick gives a velocity kick
//   on top of a base speed that rises towards the stop.
// THE STOP: at T.brake the feed hands over to a damped spring that lands the hero post
//   centred in the viewport, overshooting by SCROLL.overshoot px and settling.
// THE CONTRAST: the hero lifts off the feed and stays put; the bland feed resumes under it.
import {SCROLL, T} from '../data';
import {clamp01, easeInOut, easeOut, lerp, ramp, smoothstep} from './ease';
import {HERO_REST_TOP, POST, VIEW_H} from './layout';

/** Index of the hero's cell in the feed. */
export const HERO_CELL = 40;
/** Scroll offset (feed px) at which the hero sits at rest. Viewport y = feed y − scroll. */
export const S_REST = HERO_CELL * POST.h - HERO_REST_TOP;

const flickPulse = (x: number) => {
  if (x <= 0) return 0;
  const a = 4.5;
  const u = x / a;
  return u * u * Math.exp(2 * (1 - u));
};

/** Feed speed (px/frame) during THE SCROLL. */
const speedA = (t: number) => {
  const base = lerp(SCROLL.speedFrom, SCROLL.speedTo, smoothstep(0, T.brake, t));
  let p = 0;
  for (const f of SCROLL.flicks) p += flickPulse(t - f);
  return base * (0.7 + 0.42 * Math.tanh(p));
};

// Cumulative integral of the speed, tabulated finely (deterministic).
const T0 = -60;
const STEP = 1 / 32;
const N = Math.ceil((T.brake - T0) / STEP) + 2;
const cum = new Float64Array(N);
for (let i = 1; i < N; i++) {
  const a = T0 + (i - 1) * STEP;
  // Simpson's rule on each step.
  cum[i] = cum[i - 1] + (STEP / 6) * (speedA(a) + 4 * speedA(a + STEP / 2) + speedA(a + STEP));
}
const cumAt = (t: number) => {
  const x = (t - T0) / STEP;
  const i = Math.max(0, Math.min(N - 2, Math.floor(x)));
  const f = x - i;
  return cum[i] + (cum[i + 1] - cum[i]) * f;
};

// The brake: x(τ) = scroll − S_REST, a damped spring from (−d, v0).
const v0 = speedA(T.brake);
const w = SCROLL.brakeOmega;
const z = SCROLL.brakeDamping;
const wd = w * Math.sqrt(1 - z * z);
const springX = (tau: number, d: number) => {
  const A = -d;
  const B = (v0 + z * w * A) / wd;
  return Math.exp(-z * w * tau) * (A * Math.cos(wd * tau) + B * Math.sin(wd * tau));
};
const peakOvershoot = (d: number) => {
  let m = -Infinity;
  for (let tau = 0; tau < 80; tau += 0.05) m = Math.max(m, springX(tau, d));
  return m;
};
// Find the brake distance that gives the wanted overshoot. Overshoot falls as d grows from 0
// (the spring has less room, so it brakes harder) down to a minimum, then rises again (a
// spring stretched too far accelerates instead). Search the braking branch only.
let dMin = 0;
let oMin = Infinity;
for (let d = 0; d <= 6000; d += 5) {
  const o = peakOvershoot(d);
  if (o < oMin) {
    oMin = o;
    dMin = d;
  }
}
let lo = 0;
let hi = dMin;
for (let i = 0; i < 60; i++) {
  const mid = (lo + hi) / 2;
  if (peakOvershoot(mid) > SCROLL.overshoot) lo = mid;
  else hi = mid;
}
/** How far the hero still had to travel when the brake hit (px). */
export const BRAKE_DIST = (lo + hi) / 2;
const S_BRAKE = S_REST - BRAKE_DIST;

/** Resumed feed in THE CONTRAST: speed ramps up with a few flicks. */
const RESUME_FLICKS = [0, 18, 34, 49, 63, 76, 89, 102, 115, 128, 141, 154, 167, 180, 193, 206, 219, 232, 245, 258, 271, 284, 297, 310, 323, 336, 349, 362, 375];
const speedC = (t: number) => {
  const u = t - T.feedResume;
  if (u <= 0) return 0;
  let p = 0;
  for (const f of RESUME_FLICKS) p += flickPulse(u - f);
  return SCROLL.resumeSpeed * ramp(u, 0, 16, easeInOut) * (0.72 + 0.4 * Math.tanh(p));
};
const CN = Math.ceil((1600 - T.feedResume) / STEP) + 2;
const cumC = new Float64Array(CN);
for (let i = 1; i < CN; i++) {
  const a = T.feedResume + (i - 1) * STEP;
  cumC[i] = cumC[i - 1] + (STEP / 6) * (speedC(a) + 4 * speedC(a + STEP / 2) + speedC(a + STEP));
}
const cumCAt = (t: number) => {
  const x = (t - T.feedResume) / STEP;
  if (x <= 0) return 0;
  const i = Math.min(CN - 2, Math.floor(x));
  return cumC[i] + (cumC[i + 1] - cumC[i]) * (x - i);
};

/** Scroll offset (feed px) of the hero's own feed (the hero moves with this until it lifts). */
export const heroScroll = (t: number) => {
  if (t < T.brake) return S_BRAKE - (cumAt(T.brake) - cumAt(t));
  return S_REST + springX(t - T.brake, BRAKE_DIST);
};

/** Scroll offset of the bland feed. Same as the hero's until the feed resumes in THE CONTRAST. */
export const feedScroll = (t: number) => heroScroll(t) + cumCAt(t);

/** Feed speed (px/frame), by central difference. */
export const feedSpeed = (t: number) => (feedScroll(t + 0.25) - feedScroll(t - 0.25)) * 2;

/** Viewport y of the hero post's top. */
export const heroTop = (t: number) => HERO_CELL * POST.h - heroScroll(t);

/** 0→1 as the hero lifts off the feed in THE CONTRAST (it shrinks a little and casts a glow). */
export const heroLift = (t: number) => ramp(t, T.heroLift, T.heroLift + 22, easeInOut);

/** Whether the hero is (partly) inside the viewport. */
export const heroVisible = (t: number) => {
  const y = heroTop(t);
  return y < VIEW_H && y + POST.contentH > 0;
};

/**
 * The thumb: a soft touch indicator on the screen (screen px), one drag per flick,
 * then a press-and-hold as the thumb stops the feed.
 */
export const touchAt = (t: number): {x: number; y: number; alpha: number; press: number} => {
  // The stop: the thumb lands and holds.
  const stopDown = T.brake - 1;
  if (t >= stopDown - 2) {
    const a = ramp(t, stopDown - 2, stopDown + 1, easeOut) * (1 - ramp(t, T.brake + 44, T.brake + 58, easeInOut));
    return {x: 560, y: 1460, alpha: a, press: ramp(t, stopDown, stopDown + 10, easeOut)};
  }
  let last = -Infinity;
  for (const f of SCROLL.flicks) if (f <= t) last = f;
  if (last === -Infinity) return {x: 0, y: 0, alpha: 0, press: 0};
  const u = t - last;
  const drag = easeOut(clamp01(u / 7));
  const jitter = Math.sin(last * 12.9898) * 40;
  const alpha = ramp(u, 0, 1.5, easeOut) * (1 - ramp(u, 6, 9, easeInOut));
  return {x: 560 + jitter + drag * 30, y: 1640 - drag * 560, alpha, press: 0};
};
