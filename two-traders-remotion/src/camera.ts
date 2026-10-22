import {Easing, interpolate, random} from 'remotion';
import {BEAT} from './timeline';
import {ease} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = Easing.inOut(Easing.cubic);

export type Cam = {scale: number; ox: number; oy: number; tx: number; ty: number; rot: number; filter: string; blur: boolean};

// Scene segments for the per-scene push-in (1 → 1+amount), easing back over the
// last 14 frames so the next scene starts from 1 without a jump.
const SEGMENTS = [0, 296, 896, 1616, 2276, 2996, 3446, 3600];
const push = (f: number, amount: number) => {
  for (let i = 0; i < SEGMENTS.length - 1; i++) {
    const a = SEGMENTS[i];
    const b = SEGMENTS[i + 1];
    if (f >= a && f < b) {
      const peak = (b - a - 14) / (b - a);
      const p = (f - a) / (b - a);
      if (p <= peak) return 1 + amount * ease.inOut(p / peak);
      return 1 + amount * (1 - ease.inOut((p - peak) / (1 - peak)));
    }
  }
  return 1;
};

const decay = (f: number, at: number, len: number, amp: number, seed: string) => {
  const d = f - at;
  if (d < 0 || d > len) return {x: 0, y: 0};
  const k = (1 - d / len) * amp;
  const s = Math.floor(f / 2);
  return {x: (random(`${seed}x${s}`) * 2 - 1) * k, y: (random(`${seed}y${s}`) * 2 - 1) * k};
};

// Ray's S4 framings: medium, close on the hands, dutch tilt, wide
const CUT_FRAMES = [
  {s: 1.14, ox: 244, oy: 400, rot: 0},
  {s: 1.3, ox: 210, oy: 640, rot: 0},
  {s: 1.2, ox: 244, oy: 380, rot: -5},
  {s: 1.0, ox: 270, oy: 520, rot: 0},
];
export const WHIP = 12;

// Recede behind the logo reveal
const recede = (f: number) => interpolate(f, [BEAT.flare, BEAT.flare + 45], [0, 1], {...clamp, easing: ease.enter});

export const rayCam = (f: number): Cam => {
  let scale = push(f, 0.05);
  let ox = 270;
  let oy = 520;
  let rot = Math.sin(f / 97) * 0.25;
  let tx = Math.sin(f / 53) * 3 + Math.sin(f / 23) * 1.5;
  let ty = Math.cos(f / 61) * 2.5;
  let blur = false;

  // impacts
  const slam = decay(f, BEAT.slamImpact, 22, 12, 'slam');
  const jab = decay(f, BEAT.jab, 30, 6, 'jab');
  tx += slam.x + jab.x;
  ty += slam.y + jab.y;
  if ((f >= 418 && f <= 438) || (f >= 1060 && f <= 1094)) blur = true;

  // S4: four hard framings joined by whip-pans
  const cuts = BEAT.cuts;
  if (f >= cuts[0] - 2 && f < 2284) {
    let k = 0;
    for (let i = 0; i < cuts.length; i++) if (f >= cuts[i]) k = i;
    const c = CUT_FRAMES[k];
    const local = f - cuts[k];
    const len = (k < 3 ? cuts[k + 1] : 2272) - cuts[k];
    scale = c.s * (1 + 0.03 * Math.min(1, local / len));
    ox = c.ox;
    oy = c.oy;
    rot = c.rot;
    const dir = k % 2 === 0 ? 1 : -1;
    const w = interpolate(local, [0, WHIP], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
    tx += dir * 320 * w;
    if (local < WHIP + 2) blur = true;
    // whip back to the base framing as the turn begins
    if (f >= 2272) {
      const back = interpolate(f, [2272, 2284], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
      scale = interpolate(back, [0, 1], [c.s, 1]);
      tx = -300 * (1 - back);
      rot = 0;
      blur = true;
    }
  }

  // S5: slow push-in on Ray's face, released into S6
  if (f >= 2284 && f < 3060) {
    const pin = interpolate(f, [2320, 2700], [0, 1], {...clamp, easing: io});
    const out = interpolate(f, [2990, 3060], [0, 1], {...clamp, easing: ease.inOut});
    scale = 1 + 0.24 * pin * (1 - out);
    ox = 244;
    oy = 360;
  }

  // S6: desaturate and dim to 60%, then recede for the logo
  const grade = interpolate(f, [3000, 3060], [0, 1], {...clamp, easing: ease.inOut});
  const r = recede(f);
  scale *= 1 - 0.04 * r;
  const filter = `saturate(${1 - 0.65 * grade}) brightness(${(1 - 0.4 * grade) * (1 - 0.72 * r)}) blur(${(r * 5).toFixed(2)}px)`;
  return {scale, ox, oy, tx, ty, rot, filter, blur};
};

export const samCam = (f: number): Cam => {
  let scale = push(f, 0.03);
  let ox = 270;
  let oy = 520;
  let filterExtra = '';
  // S2 insert: push toward the monitor, the trade card takes over
  const [i0, i1] = BEAT.insert;
  if (f >= i0 - 4 && f <= i1 + 4) {
    const inP = interpolate(f, [i0, i0 + 34], [0, 1], {...clamp, easing: ease.enter});
    const outP = interpolate(f, [i1 - 30, i1], [0, 1], {...clamp, easing: io});
    const w = inP * (1 - outP);
    scale = scale * (1 + 0.45 * w);
    ox = 140;
    oy = 470;
    filterExtra = ` blur(${(w * 3).toFixed(2)}px) brightness(${1 - 0.3 * w})`;
  }
  const grade = interpolate(f, [3000, 3060], [0, 1], {...clamp, easing: ease.inOut});
  const r = recede(f);
  scale *= 1 - 0.04 * r;
  const filter = `brightness(${(1 + 0.12 * grade) * (1 - 0.78 * r)}) saturate(${1 + 0.15 * grade}) sepia(${0.1 * grade}) blur(${(r * 5).toFixed(2)}px)${filterExtra}`;
  return {scale, ox, oy, tx: 0, ty: 0, rot: 0, filter, blur: false};
};
