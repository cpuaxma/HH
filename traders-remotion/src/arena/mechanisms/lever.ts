// TRAP · excessive leverage: a whole band of tiles fuses into one plank, rocks on a fulcrum with
// growing swings, tips hard toward the edge, the pillars slide off, and the plank snaps.
import {EASE, prog, springAt} from '../../lib/anim';
import {CELLS, EDGE, G, N, PILLAR_R, TILE, TILE_T, idx} from '../grid';
import {fallAway, setQ, axisAngle} from '../fall';
import {hermite01} from '../select';
import type {Mechanism, Prepared} from '../types';

type D = {pivotX: number; endX: number; slide: number[]; snap: number; cells: number[]};

const MAX = 0.42; // final tilt (rad) toward the edge
const ROCK_START = 6;
const TILT_AT = 28; // rock is exactly two periods of 11 frames → ends at a zero crossing
const TILT_LEN = 12;
const A = 0.0115; // slide acceleration along the plank (units/frame²)
const TOP = TILE_T / 2; // tile top above the plank's pivot line

const bandShape = (count: number) => {
  const h = count <= N ? 1 : 2;
  const w = Math.ceil(count / h);
  if (h * w !== count || w > N) throw new Error(`lever: remove=${count} must be ≤10, or an even number ≤20`);
  const rows = h === 1 ? [4] : [3, 4];
  const cols = Array.from({length: w}, (_, j) => N - w + j);
  return rows.flatMap((r) => cols.map((c) => idx(c, r)));
};

/** Plank angle (radians, negative = edge side down) at local frame t, before the snap. */
export const leverAngle = (t: number) => {
  if (t < ROCK_START) return 0;
  if (t < TILT_AT) {
    const amp = 0.02 + 0.075 * prog(t, ROCK_START, TILT_AT);
    return -amp * Math.sin(((t - ROCK_START) / 11) * Math.PI * 2);
  }
  const slope0 = -0.095 * ((2 * Math.PI) / 11); // matches the rock's velocity at TILT_AT
  return hermite01(0, slope0 * TILT_LEN, -MAX, 0, prog(t, TILT_AT, TILT_AT + TILT_LEN));
};

export const leverInfo = (p: Prepared<unknown>) => p.data as D;

export const lever: Mechanism<D> = {
  id: 'lever',
  priority: 0,
  reserve: bandShape,
  select: (_pool, count) => bandShape(count).map((i) => CELLS[i]).sort((a, b) => b.x - a.x),
  prepare: (victims) => {
    const xs = victims.map((c) => c.x);
    const pivotX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const endX = Math.max(...xs) + TILE / 2; // = EDGE when the band touches the edge
    // Nearest the low end slide first, so no one catches up with the one ahead.
    const slide = victims.map((c) => TILT_AT + 5 + (endX - c.x) * 0.9);
    const death = victims.map((c, k) => slide[k] + Math.sqrt((2 * (endX - c.x + PILLAR_R * 0.2)) / A));
    const snap = Math.max(...death) + 2;
    return {victims: victims.map((c) => c.i), death, data: {pivotX, endX: Math.max(endX, EDGE - 0.01), slide, snap, cells: victims.map((c) => c.i)}};
  },
  pillar: (p, k, t, out) => {
    const d = p.data;
    const c = CELLS[p.victims[k]];
    const lx = c.x - d.pivotX;
    const td = p.death[k];
    const th = (tt: number) => leverAngle(tt);
    const s = (tt: number) => (tt > d.slide[k] ? 0.5 * A * (tt - d.slide[k]) ** 2 : 0);
    const place = (tt: number) => {
      const a = th(tt);
      const x = lx + s(tt);
      const cy = -TOP; // pivot line sits at the tile centre
      return {x: d.pivotX + x * Math.cos(a) - TOP * Math.sin(a), y: cy + x * Math.sin(a) + TOP * Math.cos(a), a};
    };
    if (t < td) {
      const q = place(t);
      out.x = q.x;
      out.y = q.y;
      setQ(out, axisAngle(0, 0, 1, q.a));
      out.glow *= 1 + 0.4 * prog(t, TILT_AT, TILT_AT + 10);
      return;
    }
    const q = place(td);
    const v = A * (td - d.slide[k]);
    fallAway(out, t - td, {x: q.x, y: q.y, z: c.z, vx: v * Math.cos(q.a), vy: v * Math.sin(q.a), vz: 0, spin: 0.06, dirX: 1, dirZ: 0, tilt0: -q.a, g: G});
  },
  tile: (p, cell, t, out) => {
    const d = p.data;
    const lx = cell.x - d.pivotX;
    out.pivotX = d.pivotX;
    out.pivotY = -TOP;
    if (t < d.snap) {
      out.rz = leverAngle(t);
    } else {
      const u = t - d.snap;
      if (lx > 0) {
        // The edge half breaks off and falls into the dark.
        out.rz = -MAX - 0.9 * EASE.in(prog(u, 0, 30));
        out.y -= 0.5 * G * u * u;
        out.opacity *= 1 - prog(u, 10, 40);
      } else {
        // The inner half slams back past level and hangs broken.
        out.rz = -MAX + (MAX + 0.1) * springAt(u, 0, 0.5, 0.35);
        out.y -= 0.12 * prog(u, 0, 6);
      }
    }
    out.glow *= 1 - prog(t, TILT_AT, d.snap);
    out.dead = Math.max(out.dead, EASE.out(prog(t, TILT_AT + 6, d.snap)));
    out.flash = Math.max(out.flash, Math.exp(-Math.max(0, t - d.snap) / 6) * prog(t, d.snap - 2, d.snap));
  },
};
