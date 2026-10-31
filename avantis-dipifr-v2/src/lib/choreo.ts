/**
 * The 3D choreography, computed purely from the frame number: where the
 * certificate group sits, where each of the four tiles is, the seal, the gold
 * glows and the light sweeps. Shared by the 3D scene and the HTML overlays.
 */
import {LOCK, MODULES, TIMING, lockFrame, moduleStart} from '../data';
import {easeIn, easeInOut, easeOut, easeOutQuint, lerp, ramp, springAt} from './timeline';

/** Certificate and tile size in world units. Four tiles stack into the certificate. */
export const CERT = {w: 4.2, h: 5.6, depth: 0.22};
export const TILE_H = CERT.h / 4;
/** Tile i's centre within the certificate (tile 0 at the top). */
export const slotY = (i: number) => (1.5 - i) * TILE_H;

export type Pose = {pos: [number, number, number]; rot: [number, number, number]; scale: number};

/** Where the stack sits while the course builds it. */
export const STACK: Pose = {pos: [0, 1.75, 0], rot: [0, 0, 0], scale: 0.75};
/** Where the certificate sits in the answer scene. */
const ANSWER: Pose = {pos: [0, 0.35, 0], rot: [0, 0, 0], scale: 0.9};

const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
  rot: [lerp(a.rot[0], b.rot[0], t), lerp(a.rot[1], b.rot[1], t), lerp(a.rot[2], b.rot[2], t)],
  scale: lerp(a.scale, b.scale, t),
});

/** The certificate group: rotates in for the answer, moves to the stack spot, flies out before the benefits. */
export const groupPose = (f: number): Pose & {visible: boolean} => {
  const inStart = TIMING.answerStart - 12;
  const inP = ramp(f, inStart, inStart + 84, easeOutQuint);
  const float = 1 - ramp(f, TIMING.breakStart - 20, TIMING.breakStart, easeInOut);
  let pose: Pose = {
    pos: [ANSWER.pos[0], lerp(-1.2, ANSWER.pos[1], inP), lerp(-9, 0, inP)],
    rot: [
      lerp(0.35, 0, inP) + 0.05 * Math.sin(f / 37) * float,
      lerp(-1.75, 0, inP) + 0.1 * Math.sin(f / 53 + 0.6) * float,
      lerp(0.12, 0, inP),
    ],
    scale: ANSWER.scale,
  };
  // While the tiles are away, the (empty) group takes the stack's place.
  pose = mixPose(pose, STACK, ramp(f, TIMING.breakStart + 30, TIMING.courseStart + 10));
  // The finished certificate floats gently after the seal...
  const after = ramp(f, TIMING.sealStamp, TIMING.sealStamp + 30);
  pose.rot[1] += 0.06 * Math.sin((f - TIMING.sealStamp) / 30) * after;
  // ...then flies up and away on the beat the benefits start.
  const out = ramp(f, TIMING.benefitsStart - 6, TIMING.benefitsStart + 26, easeIn);
  pose.pos = [pose.pos[0], pose.pos[1] + out * 13, pose.pos[2] - out * 4];
  pose.rot = [pose.rot[0] - out * 0.5, pose.rot[1], pose.rot[2]];
  return {...pose, visible: f >= inStart && out < 1};
};

export type TileState = {
  /** World-space pose when `world` is true, otherwise relative to the certificate group. */
  pose: Pose;
  world: boolean;
  visible: boolean;
  /** 0..1+: gold edge glow. */
  glow: number;
};

const local = (i: number, rotX: number, extra: Partial<Pose> = {}): Pose => ({
  pos: [0, slotY(i), 0],
  rot: [rotX, 0, 0],
  scale: 1,
  ...extra,
});

/** Where tile i is and how it is turned. rotX 0 shows the certificate side, π the module side. */
export const tileState = (i: number, f: number): TileState => {
  const side = i % 2 === 0 ? -1 : 1;
  // 1. Part of the whole certificate (answer scene).
  if (f < TIMING.breakStart) return {pose: local(i, 0), world: false, visible: true, glow: 0};

  // 2. Break: the strips part, flip to their module side, then fly off.
  const s = moduleStart(i);
  if (f < s) {
    const b = TIMING.breakStart;
    const gap = ramp(f, b, b + 18, easeOut) * 0.28 * (1.5 - i);
    const flip = ramp(f, b + 6 + i * 4, b + 30 + i * 4, easeInOut) * Math.PI;
    const away = ramp(f, b + 30 + i * 3, b + 56 + i * 3, easeIn);
    const visible = away < 1;
    return {
      pose: local(i, flip, {
        pos: [side * away * 10, slotY(i) + gap - away * 1.5, away * 2],
        rot: [flip, side * away * 0.6, side * away * 0.5],
      }),
      world: false,
      visible,
      glow: 0,
    };
  }

  // 3. Course: fly in to the hero spot, hold, then snap into the stack on the beat.
  const L = lockFrame(i);
  if (f < L) {
    const start: Pose = {pos: [side * 6.5, -9, 6], rot: [Math.PI + 1.1, side * 0.5, side * 0.6], scale: 0.75};
    const hero: Pose = {pos: [0, 0.55, 7], rot: [Math.PI - 0.08, 0, 0], scale: 0.75};
    const slot: Pose = {
      pos: [STACK.pos[0], STACK.pos[1] + STACK.scale * slotY(i), STACK.pos[2] + 0.002],
      rot: [Math.PI, 0, 0],
      scale: STACK.scale,
    };
    const arrive = ramp(f, s, s + LOCK.hero, easeOutQuint);
    let pose = mixPose(start, hero, arrive);
    // Hero hold: a slow drift so it never freezes.
    const hold = ramp(f, s + LOCK.hero - 10, s + LOCK.leave, easeInOut);
    pose.rot = [pose.rot[0] + hold * 0.08, pose.rot[1], pose.rot[2]];
    pose.pos = [pose.pos[0], pose.pos[1] + hold * 0.12, pose.pos[2]];
    // Snap: accelerate into the slot so it lands with an impact on the beat.
    pose = mixPose(pose, slot, ramp(f, s + LOCK.leave, L, easeIn));
    return {pose, world: true, visible: true, glow: 0.25 * arrive};
  }

  // 4. Locked in the stack; after all four, each flips back to its certificate side.
  const m = TIMING.morphStart + i * 7;
  const flip = Math.PI * (1 + ramp(f, m, m + 26, easeInOut));
  const glow = 2.4 * Math.exp(-(f - L) / 14) + 1.6 * Math.exp(-Math.max(0, f - TIMING.sealStamp) / 18) * (f >= TIMING.sealStamp ? 1 : 0);
  return {pose: local(i, flip), world: false, visible: true, glow};
};

/** The seal: on the certificate in the answer, gone while the course builds, then stamped on. */
export const sealState = (f: number) => {
  const breakOut = ramp(f, TIMING.breakStart, TIMING.breakStart + 14, easeIn);
  if (f < TIMING.sealStamp - 18) return {scale: 1 - breakOut, lift: 0, visible: breakOut < 1};
  // Stamp: drops from in front, accelerating, and lands on the beat.
  const drop = ramp(f, TIMING.sealStamp - 18, TIMING.sealStamp, easeIn);
  const settle = springAt(f, TIMING.sealStamp, 24, 0.45);
  return {scale: lerp(2.4, 1, drop) * (1 + 0.12 * (1 - settle) * (f >= TIMING.sealStamp ? 1 : 0)), lift: (1 - drop) * 3, visible: true};
};

/** Light sweeps across the certificate face: position (−1 before, 1 after) of a diagonal band. */
export const sweepAt = (f: number) => {
  const a = ramp(f, TIMING.answerStart + 74, TIMING.answerStart + 124, easeInOut);
  const b = ramp(f, TIMING.sealStamp - 12, TIMING.sealStamp + 34, easeInOut);
  if (f < TIMING.morphStart) return a > 0 && a < 1 ? a * 2 - 1 : -2;
  return b > 0 && b < 1 ? b * 2 - 1 : -2;
};

/** Impacts that shake the camera: each tile locking in, and the seal stamp. */
export const impacts = () => [...MODULES.map((_, i) => lockFrame(i)), TIMING.sealStamp];
