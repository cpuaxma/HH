// Where each line-art animal is, frame by frame: a pure function of the (fractional) frame and
// the format, on the same beats as before (data.ts T). Facets assemble as an animal arrives
// and break up and drift away as it leaves.
import {clamp01, easeIn, easeInOut, easeOut, lerp, ramp, smootherstep} from '../../lib/ease';
import {AnimalsFormat, T} from '../data';
import type {ArtPose} from './render';

const ss = smootherstep;
const bump = (t: number, at: number, up: number, hold: number, down: number) => ss((t - at) / up) * (1 - ss((t - at - up - hold) / down));
const strike = (t: number, at: number, rise = 8, fall = 40) => {
  const d = t - at;
  if (d <= 0) return 0;
  return ss(d / rise) * Math.exp(-Math.max(0, d - rise) / (fall / 3));
};
/** A sweep of light across the figure, starting at `at` (screen x from far left to far right). */
const sweep = (t: number, at: number, len = 70) => {
  const k = (t - at) / len;
  return k < 0 || k > 1 ? null : lerp(-300, 1380, easeInOut(k));
};
const firstSheen = (t: number, ats: number[]) => {
  for (const a of ats) {
    const s = sweep(t, a);
    if (s !== null) return s;
  }
  return null;
};

/** The stage per format: centre x, the ground line, the middle (for the whale and birds), px per shape unit. */
export const STAGE: Record<AnimalsFormat, {cx: number; ground: number; mid: number; unit: number; top: number}> = {
  vertical: {cx: 540, ground: 1196, mid: 820, unit: 0.86, top: 380},
  feed: {cx: 540, ground: 912, mid: 590, unit: 0.65, top: 200},
};

/** Integrated flap phase for a flap rate that changes over time (closed form per segment). */
const flapPhase = (t: number, segs: [number, number][]) => {
  let ph = 0;
  for (let i = 0; i < segs.length; i++) {
    const [a, r] = segs[i];
    const b = i + 1 < segs.length ? segs[i + 1][0] : Infinity;
    if (t <= a) break;
    ph += ((Math.min(t, b) - a) / 60) * r * 2 * Math.PI;
  }
  return ph;
};

// ─── The bull ────────────────────────────────────────────────────────────────

export const BULL_OUT = T.bearAt - 26;
export const bullArt = (t: number, fmt: AnimalsFormat): ArtPose => {
  const S = STAGE[fmt];
  const move = ramp(t, T.bullAt - 16, T.bullAt + 56, easeInOut);
  const push = T.faceoffPush.reduce((a, at) => a + bump(t, at, 12, 10, 34), 0);
  const thrust = T.bullThrust.reduce((a, at) => a + strike(t, at, 9, 54), 0);
  const breathe = Math.sin((2 * Math.PI * t) / 150);
  const hookX = fmt === 'vertical' ? -250 : -240;
  return {
    x: S.cx + lerp(hookX + 34 * push, 10, move),
    y: S.ground,
    s: S.unit * lerp(0.5, 0.9, move),
    rot: -0.015 * thrust + 0.01 * push,
    parts: {
      head: {rot: lerp(0.14 + 0.1 * push, 0.04, move) - 0.42 * thrust + 0.01 * breathe},
      tail: {rot: 0.08 * Math.sin(t / 40) + 0.2 * thrust},
    },
    reveal: ramp(t, 8, 64, easeOut),
    revealDir: [1, -0.3],
    vanish: ramp(t, BULL_OUT, BULL_OUT + 44, easeIn),
    sheenX: firstSheen(t, [34, T.bullAt + 30, T.bullThrust[0] - 4, T.bullThrust[1] - 4]),
    flash: 0.35 * thrust,
  };
};

// ─── The bear ────────────────────────────────────────────────────────────────

const BEAR_HOOK_OUT = T.bullAt - 40;
const BEAR_UP = T.bearAt + 18;
export const BEAR_OUT = T.whaleAt - 30;
export const bearArt = (t: number, fmt: AnimalsFormat): ArtPose => {
  const S = STAGE[fmt];
  const breathe = Math.sin((2 * Math.PI * t) / 170 + 1);
  if (t < T.bearAt) {
    // The hook: on the right, facing the bull, arms up.
    const push = T.faceoffPush.reduce((a, at) => a + bump(t, at + 6, 12, 10, 34), 0);
    const threat = ss((t - 20) / 60);
    return {
      x: S.cx + (fmt === 'vertical' ? 290 : 280) - 34 * push,
      y: S.ground,
      s: S.unit * 0.56,
      flip: true,
      rot: 0.02 * push,
      parts: {
        arm: {rot: -0.3 * threat - 0.12 * push + 0.02 * breathe},
        armFar: {rot: -0.18 * threat - 0.08 * push},
        head: {rot: 0.06 + 0.06 * push},
      },
      reveal: ramp(t, 18, 74, easeOut),
      revealDir: [1, -0.3],
      vanish: ramp(t, BEAR_HOOK_OUT, BEAR_HOOK_OUT + 40, easeIn),
      sheenX: firstSheen(t, [44]),
    };
  }
  // Its own beat: the near paw goes up (lean back), then swipes down hard.
  const raise = ramp(t, T.bearRaise, T.bearRaise + 30, easeInOut);
  const swipe = ramp(t, T.bearSwipe, T.bearSwipe + 11, easeIn);
  const settle = ramp(t, T.bearSwipe + 30, T.bearSwipe + 90, easeInOut);
  const hit = strike(t, T.bearSwipe + 9, 4, 40);
  return {
    x: S.cx + 30,
    y: S.ground,
    s: S.unit * 0.98,
    rot: -0.1 * raise + 0.13 * swipe - 0.03 * settle + 0.004 * breathe,
    parts: {
      arm: {rot: -0.1 - 0.42 * raise + 1.3 * swipe - 0.78 * settle},
      armFar: {rot: 0.05 - 0.3 * raise + 0.45 * swipe - 0.15 * settle},
      head: {rot: -0.14 * raise + 0.16 * swipe - 0.02 * settle + 0.01 * breathe},
    },
    reveal: ramp(t, BEAR_UP - 6, BEAR_UP + 46, easeOut),
    revealDir: [0.2, -1],
    vanish: ramp(t, BEAR_OUT, BEAR_OUT + 44, easeIn),
    sheenX: firstSheen(t, [BEAR_UP + 20, T.bearSwipe + 4]),
    flash: 0.4 * hit,
  };
};

// ─── The whale ───────────────────────────────────────────────────────────────

export const whaleArt = (t: number, fmt: AnimalsFormat): ArtPose => {
  const S = STAGE[fmt];
  const up = ramp(t, T.whaleSurface - 10, T.whaleSurface + 76, easeOut);
  const down = ramp(t, T.whaleDive, T.whaleDive + 56, easeIn);
  const bob = Math.sin((2 * Math.PI * (t - T.whaleSurface)) / 160);
  const flick = strike(t, T.whaleCandle + 40, 10, 60);
  return {
    x: S.cx + lerp(-180, 30, up) + 200 * down,
    y: S.mid + lerp(420, 0, up) + 340 * down + 10 * bob * up,
    s: S.unit * 0.92,
    rot: lerp(-0.5, -0.06, up) + 0.55 * down + 0.02 * bob,
    parts: {
      tail: {rot: 0.08 * bob - 0.35 * flick + 0.2 * down},
      fin: {rot: 0.1 * bob - 0.12 * flick},
      finFar: {rot: 0.08 * bob},
    },
    reveal: ramp(t, T.whaleSurface - 14, T.whaleSurface + 50, easeOut),
    revealDir: [1, -0.4],
    vanish: ramp(t, T.whaleDive + 14, T.whaleDive + 60, easeIn),
    sheenX: firstSheen(t, [T.whaleSurface + 20, T.whaleCandle + 30]),
    flash: 0.3 * flick,
  };
};

// ─── The birds ───────────────────────────────────────────────────────────────

const HAWK_OUT = T.doveAt - 24;
/** Phone tie-in: the hawk hovers on the left, the dove on the right, either side of the phone. */
const FLANK_AT = T.phoneAt + 30;
const FLANK: Record<AnimalsFormat, {hawk: [number, number]; dove: [number, number]; s: number}> = {
  vertical: {hawk: [170, 520], dove: [870, 560], s: 0.3},
  feed: {hawk: [170, 300], dove: [880, 330], s: 0.24},
};

export const hawkArt = (t: number, fmt: AnimalsFormat): ArtPose => {
  const S = STAGE[fmt];
  const F = FLANK[fmt];
  // The dive: in from the top right, wings tucked, getting bigger; it flares open at the strike.
  const dive = ramp(t, T.hawkDive - 6, T.hawkStrike, (x) => x * x);
  const open = ramp(t, T.hawkStrike - 8, T.hawkStrike + 10, easeOut);
  const flare = bump(t, T.hawkStrike - 4, 8, 8, 30);
  const out = ramp(t, HAWK_OUT, HAWK_OUT + 34, easeIn);
  const back = ramp(t, FLANK_AT - 64, FLANK_AT + 10, easeOut);
  const phase = flapPhase(t, [
    [T.hawkStrike + 4, 1.3],
    [T.hawkStrike + 60, 0.9],
    [HAWK_OUT - 10, 1.8],
    [FLANK_AT - 64, 1.1],
  ]);
  const flying = ss((t - T.hawkStrike) / 16);
  const flap = Math.sin(phase) * flying;
  // Hover spot, then away (up and left), then back in at the phone's left.
  const hx = lerp(lerp(S.cx + 360, S.cx, dive), S.cx - 80 * out, open) - 760 * out;
  const hy = lerp(lerp(S.mid - 520, S.mid - 30, dive), S.mid - 40 - 360 * out, open) + 16 * flap;
  const x = back > 0 ? lerp(-260, F.hawk[0], back) : hx;
  const y = back > 0 ? lerp(F.hawk[1] - 120, F.hawk[1], back) + 10 * flap : hy;
  const sc = back > 0 ? F.s : lerp(lerp(0.3, 0.7, dive), 0.74, open) * (1 - 0.35 * out);
  const tuck = 1 - open;
  const wing = (side: 1 | -1) => ({rot: side * (-0.26 * flap + 0.95 * tuck - 0.1 * flare), sx: 1 - 0.5 * tuck, sy: 1 - 0.22 * Math.abs(flap) - 0.25 * tuck});
  return {
    x,
    y,
    s: S.unit * sc,
    rot: back > 0 ? 0.03 * Math.sin(t / 50) : lerp(0.18, 0, open) - 0.05 * out,
    parts: {wingR: wing(1), wingL: wing(-1)},
    reveal: ramp(t, T.hawkDive - 10, T.hawkDive + 34, easeOut),
    revealDir: [-0.6, 1],
    vanish: 0,
    opacity: back > 0 ? 1 : 1 - ramp(t, HAWK_OUT + 20, HAWK_OUT + 34),
    sheenX: firstSheen(t, [T.hawkStrike - 10, T.hawkStrike + 70]),
    flash: 0.35 * flare,
  };
};

const DOVE_FLANK_MOVE = FLANK_AT - 50;
export const doveArt = (t: number, fmt: AnimalsFormat): ArtPose => {
  const S = STAGE[fmt];
  const F = FLANK[fmt];
  const rise = ramp(t, T.doveRise - 10, T.doveLift + 60, easeOut);
  const lift = ramp(t, T.doveLift, T.doveLift + 140, easeInOut);
  const flank = ramp(t, DOVE_FLANK_MOVE, FLANK_AT + 10, easeInOut);
  const phase = flapPhase(t, [
    [T.doveRise - 12, 2.6],
    [T.doveLift + 70, 1.8],
    [T.doveLift + 150, 1.3],
    [DOVE_FLANK_MOVE, 2.0],
    [FLANK_AT + 10, 1.3],
  ]);
  const flap = Math.sin(phase);
  // Wings: up (rest) → swept down and forward on the downstroke.
  const down = 0.5 - 0.5 * Math.cos(phase);
  const x = lerp(lerp(S.cx + 240, S.cx + 20, rise), F.dove[0], flank);
  const y = lerp(lerp(S.mid + 380, S.mid + 40, rise) - 90 * lift, F.dove[1], flank) + 14 * flap;
  return {
    x,
    y,
    s: S.unit * lerp(0.95, F.s, flank),
    rot: lerp(-0.32, -0.08, rise) - 0.04 * flap * (1 - flank),
    parts: {
      wing: {rot: 1.25 * down, sy: 1 - 0.3 * Math.sin(phase + 0.6) ** 2},
      wingFar: {rot: 1.05 * down, sy: 1 - 0.3 * Math.sin(phase + 0.6) ** 2},
    },
    reveal: ramp(t, T.doveRise - 12, T.doveRise + 40, easeOut),
    revealDir: [0.3, -1],
    vanish: 0,
    sheenX: firstSheen(t, [T.doveRise + 20, T.doveLift + 30]),
    flash: 0.25 * strike(t, T.doveLift + 20, 10, 60),
  };
};

/** Every figure drawn at frame t (skipping those that aren't on screen). */
export const ART_POSES = [
  {id: 'bull', at: (t: number, f: AnimalsFormat) => (t < BULL_OUT + 50 ? bullArt(t, f) : null)},
  {id: 'bear', at: (t: number, f: AnimalsFormat) => ((t < T.bullAt - 40 + 44) || (t > BEAR_UP - 8 && t < BEAR_OUT + 50) ? bearArt(t, f) : null)},
  {id: 'whale', at: (t: number, f: AnimalsFormat) => (t > T.whaleSurface - 16 && t < T.whaleDive + 64 ? whaleArt(t, f) : null)},
  {id: 'hawk', at: (t: number, f: AnimalsFormat) => (t > T.hawkDive - 12 && !(t > HAWK_OUT + 36 && t < FLANK_AT - 64) ? hawkArt(t, f) : null)},
  {id: 'dove', at: (t: number, f: AnimalsFormat) => (t > T.doveRise - 14 ? doveArt(t, f) : null)},
];

/** The soft shadow and pedestal light under a standing animal: centre x, width (px), strength. */
export const groundGlow = (t: number, fmt: AnimalsFormat) => {
  const out: {x: number; w: number; k: number}[] = [];
  for (const id of ['bull', 'bear']) {
    const p = ART_POSES.find((a) => a.id === id)!.at(t, fmt);
    if (!p) continue;
    const k = clamp01(p.reveal ?? 1) * (1 - clamp01((p.vanish ?? 0) * 1.6));
    if (k > 0.001) out.push({x: p.x, w: (id === 'bull' ? 980 : 520) * p.s, k});
  }
  return out;
};
