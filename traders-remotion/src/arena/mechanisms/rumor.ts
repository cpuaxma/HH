// TRAP · trading on rumours: a whisper ripple spreads across the floor; whoever follows it drains to grey and sinks.
import {EASE, prog} from '../../lib/anim';
import {dist} from '../grid';
import {spread} from '../select';
import type {Mechanism, Prepared} from '../types';

type D = {ox: number; oz: number; speed: number; reach: number[]; sink: number[]; away: [number, number][]};

const START = 10;
const SPREAD = 54; // frames for the ripple to reach the farthest follower

export const rumor: Mechanism<D> = {
  id: 'rumor',
  priority: 9,
  select: (pool, count, ctx) => (pool.length === count ? pool : spread(pool, count, `${ctx.seed}-rumor`)),
  prepare: (victims) => {
    const cx = victims.reduce((s, c) => s + c.x, 0) / victims.length;
    const cz = victims.reduce((s, c) => s + c.z, 0) / victims.length;
    const src = [...victims].sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz))[0];
    const ordered = [...victims].sort((a, b) => dist(a, src) - dist(b, src));
    const maxD = Math.max(...ordered.map((c) => dist(c, src)), 1);
    const speed = maxD / SPREAD;
    const reach = ordered.map((c) => START + dist(c, src) / speed);
    const sink = reach.map((r) => r + 14);
    const away = ordered.map((c): [number, number] => {
      const dx = c.x - src.x;
      const dz = c.z - src.z;
      const l = Math.hypot(dx, dz);
      return l < 0.01 ? [0, 0] : [dx / l, dz / l];
    });
    return {victims: ordered.map((c) => c.i), death: sink.map((s) => s + 7), data: {ox: src.x, oz: src.z, speed, reach, sink, away}};
  },
  pillar: (p, k, t, out) => {
    const r = p.data.reach[k];
    const sk = p.data.sink[k];
    const [ax, az] = p.data.away[k];
    const g = EASE.inOut(prog(t, r, r + 14));
    out.grey = g;
    out.glow *= 1 - 0.9 * g;
    // Follow the whisper a little way, swaying.
    const drift = 0.3 * EASE.inOut(prog(t, r, sk + 6));
    out.x += ax * drift + Math.sin(t * 0.8 + k) * 0.01 * g;
    out.z += az * drift;
    if (t > sk) {
      const u = t - sk;
      out.y -= 0.5 * 0.0075 * u * u;
      out.dissolve = Math.max(out.dissolve, EASE.in(prog(u, 10, 40)));
      out.crack = Math.max(out.crack, 0.35 * prog(u, 4, 16));
    }
    out.reflect *= 1 - g;
  },
  tile: (p, cell, t, out) => {
    const k = p.victims.indexOf(cell.i);
    const sk = p.data.sink[k];
    // The glass turns ghostly so the pillar visibly sinks through it, then the tile is left cracked.
    out.opacity *= 1 - 0.65 * prog(t, sk - 2, sk + 4) * (1 - prog(t, sk + 22, sk + 40));
    out.glow *= 1 - prog(t, p.data.reach[k], sk);
    out.dead = Math.max(out.dead, EASE.out(prog(t, sk + 4, sk + 24)));
  },
};

/** Ripple ring radius at local frame t (negative = not started). */
export const rippleRadius = (p: Prepared<unknown>, t: number) => {
  const d = p.data as D;
  return (t - START) * d.speed;
};
export const rumorOrigin = (p: Prepared<unknown>) => {
  const d = p.data as D;
  return {x: d.ox, z: d.oz};
};
export const rumorReach = (p: Prepared<unknown>) => (p.data as D).reach;
