// The arena as a pure function of the frame: every pillar and tile state is recomputed from
// scratch (no simulation carried between frames), so any frame renders identically, in any order.
import {BEATS, SCENES} from '../config';
import {EASE, clamp, impulse, mix, prog, rnd, springAt} from '../lib/anim';
import {ARROW_CENTER, AZ_END} from './camera';
import {axisAngle, qmul, setQ} from './fall';
import {CELLS, COUNT, TILE_T, type Cell} from './grid';
import {rippleRadius, rumorOrigin} from './mechanisms/rumor';
import {PLAN} from './plan';
import type {PillarState, TileState} from './types';

type Q = {x: number; y: number; z: number; w: number};

const slerp = (a: Q, b: Q, t: number): Q => {
  let cos = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  let bx = b.x;
  let by = b.y;
  let bz = b.z;
  let bw = b.w;
  if (cos < 0) {
    cos = -cos;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (cos > 0.9995) {
    const r = {x: mix(a.x, bx, t), y: mix(a.y, by, t), z: mix(a.z, bz, t), w: mix(a.w, bw, t)};
    const l = Math.hypot(r.x, r.y, r.z, r.w);
    return {x: r.x / l, y: r.y / l, z: r.z / l, w: r.w / l};
  }
  const th = Math.acos(cos);
  const s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s;
  const wb = Math.sin(t * th) / s;
  return {x: a.x * wa + bx * wb, y: a.y * wa + by * wb, z: a.z * wa + bz * wb, w: a.w * wa + bw * wb};
};

// ── Hook: the light-up ripple from the centre outwards ──
export const spawnAt = (c: Cell) => 5 + Math.hypot(c.x, c.z) * 2.7 + rnd(`spawn-${c.i}`) * 2;

// ── Survivors: rise, then fly into the arrow ──
const SURV = PLAN.survivors.map((i) => CELLS[i]);
const RISE = SURV.map((c, j) => ({
  delay: rnd(`rise-d-${j}`) * 18,
  h: 1.5 + rnd(`rise-h-${j}`) * 1.1,
  spin: (rnd(`rise-s-${j}`) < 0.5 ? -1 : 1) * (0.012 + rnd(`rise-r-${j}`) * 0.012),
  phase: rnd(`rise-p-${j}`) * 6.28,
  wob: rnd(`rise-w-${j}`) * 6.28,
}));

const SP = 0.74; // arrow "pixel" spacing
/** 25 slots of a bold upward arrow: head rows of 1,3,5,7,9? no — 1,3,5,7 + a 3×3 shaft. (u right, v up) */
export const ARROW_SLOTS: [number, number][] = (() => {
  const rows = [[0], [-1, 0, 1], [-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1, 2, 3], [-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
  const out: [number, number][] = [];
  rows.forEach((us, r) => us.forEach((u) => out.push([u * SP, (3 - r) * SP * 0.95 - (r >= 4 ? 0.06 : 0)])));
  return out;
})();
if (ARROW_SLOTS.length !== SURV.length) throw new Error(`Arrow has ${ARROW_SLOTS.length} slots for ${SURV.length} survivors`);

const RIGHT = {x: Math.cos(AZ_END), z: -Math.sin(AZ_END)};
const FACE: Q = qmul(axisAngle(0, 1, 0, AZ_END, {x: 0, y: 0, z: 0, w: 1}), axisAngle(1, 0, 0, Math.PI / 2, {x: 0, y: 0, z: 0, w: 1}));
// Match survivors to slots left-to-right (as seen from the final camera) so the paths barely cross.
const ASSIGN: number[] = (() => {
  const sIdx = SURV.map((c, j) => ({j, k: c.x * RIGHT.x + c.z * RIGHT.z + RISE[j].h * 0.01})).sort((a, b) => a.k - b.k);
  const slots = ARROW_SLOTS.map(([u, v], s) => ({s, k: u + v * 0.001})).sort((a, b) => a.k - b.k);
  const out = new Array(SURV.length);
  sIdx.forEach((e, n) => (out[e.j] = slots[n].s));
  return out;
})();
const slotWorld = (s: number, scale = 1, lift = 0) => {
  const [u, v] = ARROW_SLOTS[s];
  return {x: ARROW_CENTER.x + RIGHT.x * u * scale, y: ARROW_CENTER.y + v * scale + lift, z: ARROW_CENTER.z + RIGHT.z * u * scale};
};
/** Fly order: the shaft assembles first, the tip of the head last. */
const FLY = ASSIGN.map((s) => {
  const v = ARROW_SLOTS[s][1];
  return BEATS.arrowFly + (v + 3 * SP) * 2.2;
});
export const ARROW_TIP = slotWorld(0);

const emptyPillar = (): PillarState => ({x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1, sx: 1, sy: 1, sz: 1, glow: 1, red: 0, crack: 0, dissolve: 0, grey: 0, heat: 0, reflect: 1});
const emptyTile = (): TileState => ({x: 0, y: 0, z: 0, rz: 0, rx: 0, pivotX: 0, pivotY: 0, hinge: 0, glow: 0, dead: 0, flash: 0, opacity: 1, ripple: 0, shake: 0});

/** Gold glow every standing pillar earns as it survives each wave (plus a pulse at each hit). */
const waveGlow = (f: number) => {
  let g = 0;
  for (const t of PLAN.traps) {
    if (f >= t.hit) g += 0.2;
    g += 0.7 * impulse(f, t.hit + 1, 24);
  }
  return g;
};

const ctaShine = (f: number) => {
  let s = 0;
  for (let at = BEATS.logoIn + 14; at < 1200; at += BEATS.shineEvery) s = Math.max(s, impulse(f, at, 26));
  return s;
};

const compute = (f: number) => {
  const pillars: PillarState[] = [];
  const tiles: TileState[] = [];
  const wg = waveGlow(f);
  const rise0 = BEATS.riseStart;
  const sinkFloor = EASE.inOut(prog(f, rise0 + 10, rise0 + 120));

  for (let i = 0; i < COUNT; i++) {
    const c = CELLS[i];
    const p = emptyPillar();
    const tl = emptyTile();
    p.x = c.x;
    p.z = c.z;
    tl.x = c.x;
    tl.z = c.z;
    tl.y = -TILE_T / 2;

    // Hook light-up.
    const sp = spawnAt(c);
    const grow = springAt(f, sp, 0.42, 0.42);
    p.sy = clamp(grow, 0.001, 1.2);
    p.sx = p.sz = clamp(0.6 + 0.4 * grow, 0.6, 1.1);
    p.heat = 1.1 * Math.exp(-Math.max(0, f - sp) / 5) * (f >= sp ? 1 : 0);
    p.glow = (f >= sp ? 1 : 0) * (1 + 0.07 * Math.sin(f * 0.07 + i * 1.7)) + wg;
    if (f < sp) p.dissolve = 1;
    const tileOn = EASE.out(prog(f, sp - 4, sp + 6));
    tl.glow = 0.55 * tileOn + 0.9 * Math.exp(-Math.max(0, f - sp + 2) / 6) * tileOn + 0.25 * wg;
    tl.opacity = mix(0.0, 1, EASE.out(prog(f, sp - 6, sp + 4)));

    const k = PLAN.trapOf[i];
    if (k >= 0) {
      const t = PLAN.traps[k];
      const lt = f - t.start;
      if (lt > -2) {
        t.mech.pillar(t.prepared, PLAN.slot[i], lt, p);
        t.mech.tile?.(t.prepared, c, lt, tl);
      }
      if (p.dissolve >= 0.999 || p.y < -14) p.sy = 0;
      // Every dead tile joins the reveal's red pulse (the 75 empty, cracked tiles).
      if (f > PLAN.deathAbs[i]) {
        const pulse = impulse(f, BEATS.revealText - 10 + Math.hypot(c.x, c.z) * 1.3, 22);
        const hold = prog(f, BEATS.revealText - 8, BEATS.revealText + 8) * (1 - prog(f, SCENES.reveal[1] - 16, SCENES.reveal[1]));
        tl.flash = Math.max(tl.flash, pulse * 0.85, hold * 0.32);
      }
    } else {
      // Survivor.
      const j = PLAN.survivors.indexOf(i);
      const r = RISE[j];
      p.glow += 0.35 * prog(f, 740, 790);
      tl.glow += 0.5 * prog(f, 740, 790);
      const up = EASE.inOut(prog(f, rise0 + r.delay, rise0 + r.delay + 46));
      if (up > 0) {
        const bob = Math.sin(f * 0.06 + r.phase) * 0.07 * up;
        p.y = up * r.h + bob;
        const yaw = r.spin * Math.max(0, f - rise0 - r.delay) * up;
        const sway = axisAngle(Math.cos(r.wob), 0, Math.sin(r.wob), 0.07 * up * Math.sin(f * 0.045 + r.phase), {x: 0, y: 0, z: 0, w: 1});
        setQ(p, qmul(sway, axisAngle(0, 1, 0, yaw, {x: 0, y: 0, z: 0, w: 1})));
        p.glow += 0.6 * up;
        for (const h of BEATS.habitAt) p.glow += 0.9 * impulse(f, h + 2 + r.delay * 0.3, 22);
        p.reflect = 1 - up;
        tl.glow += 1.2 * impulse(f, rise0 + r.delay, 20);
      }
      // Fly into the arrow.
      const s = ASSIGN[j];
      const fp = EASE.inOut(prog(f, FLY[j], FLY[j] + 26));
      if (fp > 0) {
        const a = {x: p.x, y: p.y, z: p.z};
        const qa = {x: p.qx, y: p.qy, z: p.qz, w: p.qw};
        // CTA: the arrow drifts up a touch and settles back behind the logo.
        const settle = EASE.inOut(prog(f, BEATS.logoIn - 16, BEATS.logoIn + 30));
        const b = slotWorld(s, mix(1, 1.55, settle), 0.05 * Math.sin(f * 0.05) * settle);
        const swirl = (rnd(`swirl-${j}`) - 0.5) * 2.4;
        const cx = (a.x + b.x) / 2 + RIGHT.z * swirl;
        const cy = Math.max(a.y, b.y) + 1.6;
        const cz = (a.z + b.z) / 2 - RIGHT.x * swirl;
        const u = fp;
        const w0 = (1 - u) * (1 - u);
        const w1 = 2 * (1 - u) * u;
        const w2 = u * u;
        p.x = w0 * a.x + w1 * cx + w2 * b.x;
        p.y = w0 * a.y + w1 * cy + w2 * b.y;
        p.z = w0 * a.z + w1 * cz + w2 * b.z;
        const sway = axisAngle(0, 1, 0, 0.06 * Math.sin(f * 0.04) * settle, {x: 0, y: 0, z: 0, w: 1});
        setQ(p, slerp(qa, qmul(sway, FACE), u));
        p.sy = mix(1, 0.4, u);
        p.sx = p.sz = mix(1, 1.32, u);
        p.reflect = 0;
        // Lock flare runs down from the tip; then the CTA shines sweep across.
        const v = ARROW_SLOTS[s][1];
        p.heat = Math.max(p.heat, 1.4 * impulse(f, BEATS.arrowLock + (3 * SP - v) * 2, 18), 0.8 * ctaShine(f - (ARROW_SLOTS[s][0] + 3) * 1.6));
        p.glow = mix(p.glow, 1.7 - 1.0 * settle, u);
        p.heat *= 1 - 0.5 * settle;
      }
    }

    // Survivors scene: the floor sinks away into the fog.
    if (sinkFloor > 0) {
      tl.y -= 3.2 * sinkFloor;
      tl.opacity *= 1 - 0.55 * sinkFloor;
      tl.glow *= 1 - 0.6 * sinkFloor;
      if (k >= 0) tl.flash *= 1 - sinkFloor;
    }
    pillars.push(p);
    tiles.push(tl);
  }

  // Rumour: the whisper ripple washes across every tile.
  const rt = PLAN.traps.find((t) => t.def.mechanism === 'rumor');
  if (rt) {
    const lt = f - rt.start;
    const R = rippleRadius(rt.prepared, lt);
    if (R > -1 && lt < rt.len + 10) {
      const o = rumorOrigin(rt.prepared);
      const fade = 1 - prog(lt, rt.len - 30, rt.len + 6);
      for (let i = 0; i < COUNT; i++) {
        const d = Math.hypot(CELLS[i].x - o.x, CELLS[i].z - o.z);
        tiles[i].ripple = Math.exp(-(((d - R) / 0.6) ** 2)) * fade * (R > 0 ? 1 : 0);
      }
    }
  }
  return {pillars, tiles};
};

const cache = new Map<number, ReturnType<typeof compute>>();
/** World state at frame f (memoised: every 3D layer and DOM tracker reads the same snapshot). */
export const worldAt = (f: number) => {
  let w = cache.get(f);
  if (!w) {
    w = compute(f);
    if (cache.size > 12) cache.delete(cache.keys().next().value as number);
    cache.set(f, w);
  }
  return w;
};
