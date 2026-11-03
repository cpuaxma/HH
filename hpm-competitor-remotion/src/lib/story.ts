// Every animated value in the reel, as a pure function of a (possibly fractional) frame.
// The 3D renderer evaluates these at sub-frame times for motion blur, so nothing here
// may depend on state or on the order frames are rendered in.
import {COMPETITOR_COMMENTS, NUMBERS, TIMING, YOUR_NOTIFS, competitorNotifFrames} from '../data';
import {clamp01, easeInOut, easeOut, keyframes, ramp, smootherstep, springAt} from './ease';

export type V3 = [number, number, number];

// ─── Phones ──────────────────────────────────────────────────────────────────

export const PHONE = {
  /** Outer size in world units (≈ metres × 10). */
  width: 0.76,
  height: 1.62,
  depth: 0.078,
  cornerRadius: 0.118,
  /** Screen inset from the outer edge (the black glass border). */
  bezel: 0.017,
};
/** Screen size (inside the bezel). */
export const SCREEN = {
  width: PHONE.width - 2 * PHONE.bezel - 0.024,
  height: PHONE.height - 2 * PHONE.bezel - 0.024,
};

export const BASE = {
  you: {pos: [-0.5, 1.08, 0] as V3, yaw: 0.12},
  competitor: {pos: [0.5, 1.08, 0] as V3, yaw: -0.12},
  tilt: -0.05,
};

export type PhonePose = {pos: V3; rot: V3; scale: number};

const NOTIFS = competitorNotifFrames();

/** Decaying buzz after each notification. */
const buzz = (t: number) => {
  let x = 0;
  let r = 0;
  for (const a of NOTIFS) {
    const d = t - a;
    if (d < 0 || d > 26) continue;
    const env = Math.exp(-d / 7) * smootherstep(d / 1.5);
    x += env * Math.sin((2 * Math.PI * d) / 3.6);
    r += env * Math.sin((2 * Math.PI * d) / 4.4 + 1.3);
  }
  return {x: Math.max(-1.6, Math.min(1.6, x)), r: Math.max(-1.6, Math.min(1.6, r))};
};

/** Heartbeat shape (0→1→0) every `period` frames after `from`. */
export const syncPulse = (t: number) => {
  if (t < TIMING.syncPulseFrom) return 0;
  const k = ((t - TIMING.syncPulseFrom) % TIMING.syncPulsePeriod) / TIMING.syncPulsePeriod;
  return Math.exp(-k * 7) * smootherstep(k * 14);
};

/** 0→1 progress through your phone's 360° flip, with a speed ramp (slow, whip, settle). */
export const flipProgress = (t: number) => {
  const p = clamp01((t - TIMING.flipStart) / (TIMING.flipEnd - TIMING.flipStart));
  // Ease in hard, then a fast middle and a hard stop at the landing (the impact).
  return p < 0.5 ? 0.5 * Math.pow(2 * p, 2.6) : 1 - 0.5 * Math.pow(2 * (1 - p), 1.7);
};

/** True once the new post shows on your screen (the back is facing the camera at the switch). */
export const yourScreenIsNew = (t: number) => t >= (TIMING.flipStart + TIMING.flipEnd) / 2;

export const youPose = (t: number): PhonePose => {
  const [x, y, z] = BASE.you.pos;
  const bob = 0.009 * Math.sin((2 * Math.PI * t) / 190 + 1.1);
  // Anticipation: a small wind-up the other way just before the flip.
  const wind = -0.16 * Math.sin(Math.PI * ramp(t, TIMING.flipStart - 16, TIMING.flipStart + 4, easeInOut));
  const p = flipProgress(t);
  const spin = 2 * Math.PI * p;
  // Hop: up during the spin, down onto the impact.
  const hop = 0.3 * Math.sin(Math.PI * clamp01((t - TIMING.flipStart + 4) / (TIMING.flipEnd - TIMING.flipStart + 4)));
  // Settle after landing: damped wobble.
  const since = t - TIMING.flipEnd;
  const settle = since > 0 ? Math.exp(-since / 9) * Math.sin(since / 2.4) : 0;
  const pulse = syncPulse(t);
  return {
    pos: [x, y + bob + hop + 0.012 * settle, z],
    rot: [BASE.tilt + 0.05 * settle, BASE.you.yaw + spin + wind, -0.015 * settle],
    scale: 1 + 0.018 * pulse,
  };
};

/** The buzz is damped while the camera is right on the competitor's screen (keeps the text readable). */
const buzzScale = (t: number) => 1 - 0.92 * ramp(t, 166, 196, easeInOut) * (1 - ramp(t, 296, 320, easeInOut));

export const competitorPose = (t: number): PhonePose => {
  const [x, y, z] = BASE.competitor.pos;
  const bob = 0.016 * Math.sin((2 * Math.PI * t) / 150 + 0.4);
  const k = buzzScale(t);
  const raw = buzz(t);
  const b = {x: raw.x * k, r: raw.r * k};
  const pulse = syncPulse(t);
  return {
    pos: [x + 0.0055 * b.x, y + bob, z],
    rot: [BASE.tilt, BASE.competitor.yaw + 0.004 * b.r, 0.011 * b.r],
    scale: 1 + 0.018 * pulse,
  };
};

// ─── Light and glow ──────────────────────────────────────────────────────────

/** Flash on each competitor notification (0–1). */
export const notifFlash = (t: number) => {
  let f = 0;
  for (const a of NOTIFS) {
    const d = t - a;
    if (d >= 0 && d < 40) f = Math.max(f, Math.exp(-d / 9));
  }
  return f;
};

/** Brightness of the competitor's warm glow (screen light + floor pool). */
export const competitorGlow = (t: number) => 1 + 0.45 * notifFlash(t) + 0.5 * syncPulse(t);

/** How "dead" your screen is: 0 normal, 1 fully dimmed and desaturated. Cleared by the flip. */
export const yourDim = (t: number) => (yourScreenIsNew(t) ? 0 : ramp(t, TIMING.dimStart, TIMING.dimEnd, easeInOut));

/** 0 cold and grey, 1 warm and lit (after the flip lands). */
export const yourWarmth = (t: number) => ramp(t, TIMING.flipEnd - 6, TIMING.flipEnd + 30, easeOut);

export const yourGlow = (t: number) => {
  const w = yourWarmth(t);
  let flash = 0;
  for (const n of YOUR_NOTIFS) {
    const d = t - n.at;
    if (d >= 0 && d < 40) flash = Math.max(flash, Math.exp(-d / 9));
  }
  return (1 - w) * (1 - 0.6 * yourDim(t)) + w * (1 + 0.4 * flash + 0.5 * syncPulse(t));
};

/** The impact frame (and a short decay) when your phone lands. */
export const impact = (t: number) => {
  const d = t - TIMING.impactAt;
  if (d < 0 || d >= TIMING.impactFrames) return 0;
  return 1 - d / TIMING.impactFrames;
};

// ─── Numbers on the screens ──────────────────────────────────────────────────

export const competitorLikes = keyframes(NUMBERS.competitorLikes);
export const competitorComments = keyframes(NUMBERS.competitorComments);
export const competitorNewFollowers = keyframes(NUMBERS.competitorNewFollowers);
const yourLikesAfter = keyframes(NUMBERS.yourLikesAfter);
const yourCommentsAfter = keyframes(NUMBERS.yourCommentsAfter);
export const yourLikes = (t: number) => (yourScreenIsNew(t) ? yourLikesAfter(t) : NUMBERS.yourLikes);
export const yourComments = (t: number) => (yourScreenIsNew(t) ? yourCommentsAfter(t) : NUMBERS.yourComments);

/** Hours on your clock (9 → 21) during the time-lapse, then real-time-ish. */
export const clockHours = (t: number) =>
  TIMING.clockFromHour + (TIMING.clockToHour - TIMING.clockFromHour) * ramp(t, TIMING.clockStart, TIMING.clockEnd, (x) => x);

export const clockLabel = (t: number) => {
  const h = clockHours(t);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60 / 5) * 5;
  return `${hh}:${String(mm).padStart(2, '0')}`;
};

/** Notifications that have arrived on the competitor's phone (frame, index), newest last. */
export const competitorArrivals = (t: number) =>
  NOTIFS.map((at, i) => ({at, i})).filter((n) => n.at <= t);

/** How many comments have slid in under the competitor's post (fractional for the slide). */
export const commentSlide = (t: number) => COMPETITOR_COMMENTS.map((c) => ramp(t, c.at, c.at + 16, easeOut));

/** Trending pill: spring scale 0 → 1. */
export const trendingPop = (t: number) => springAt(t - TIMING.trendingAt, {freq: 2.4, damping: 0.45});

/** Screen slide from the post to the profile on the competitor's phone (0 → 1). */
export const profileSlide = (t: number) => ramp(t, TIMING.profileAt, TIMING.profileAt + 26, easeInOut);

/** "Managed by Hot Pepper Media" tag reveal (spring). */
export const tagPop = (t: number) => springAt(t - TIMING.tagAt, {freq: 1.9, damping: 0.42});
