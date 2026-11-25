// TRAP · no plan: pillars wander off their tiles in random directions and drift over the edge.
import {EASE, clamp, prog, rnd} from '../../lib/anim';
import {type Cell, EDGE, N, PILLAR_R} from '../grid';
import {fallAway, tiltOnEdge} from '../fall';
import {spread} from '../select';
import type {Mechanism} from '../types';

type V = {x0: number; z0: number; c1: [number, number]; p2: [number, number]; start: number; walk: number; uDeath: number; nx: number; nz: number; phase: number; yawRate: number};
type D = {v: V[]};

const outward = (c: Cell): [number, number] => {
  let nx = 0;
  let nz = 0;
  if (c.c === 0) nx -= 1;
  if (c.c === N - 1) nx += 1;
  if (c.r === 0) nz -= 1;
  if (c.r === N - 1) nz += 1;
  if (!nx && !nz) {
    nx = c.x;
    nz = c.z;
  }
  const l = Math.hypot(nx, nz) || 1;
  return [nx / l, nz / l];
};

const bez = (v: V, u: number): [number, number] => {
  const a = (1 - u) * (1 - u);
  const b = 2 * (1 - u) * u;
  const c = u * u;
  return [a * v.x0 + b * v.c1[0] + c * v.p2[0], a * v.z0 + b * v.c1[1] + c * v.p2[1]];
};
const off = (x: number, z: number) => Math.max(Math.abs(x), Math.abs(z)) > EDGE + 0.08;
const POW = 1.7; // u = τ^POW: a hesitant start that speeds up

export const wander: Mechanism<D> = {
  id: 'wander',
  priority: 2,
  select: (pool, count, ctx) => {
    const ring = (k: number) => pool.filter((c) => Math.min(c.c, c.r, N - 1 - c.c, N - 1 - c.r) === k);
    // Prefer the side and near edges (the far edge belongs to FOMO when it is in the list).
    let cands = ring(0).filter((c) => c.r !== 0);
    if (cands.length < count) cands = ring(0);
    if (cands.length < count) cands = [...ring(0), ...ring(1)];
    return spread(cands, count, `${ctx.seed}-wander`);
  },
  prepare: (victims, ctx) => {
    const v = victims.map((c, k): V => {
      const [nx, nz] = outward(c);
      const side = rnd(`${ctx.seed}-w-side-${k}`) < 0.5 ? -1 : 1;
      const lat = side * rnd(`${ctx.seed}-w-lat-${k}`, 0.35, 0.7);
      // Control point: wander sideways first; then curl out over the edge.
      const c1: [number, number] = [c.x + -nz * lat + nx * 0.05, c.z + nx * lat + nz * 0.05];
      const p2: [number, number] = [c.x + nx * 1.25 + -nz * lat * 0.4, c.z + nz * 1.25 + nx * lat * 0.4];
      const start = 8 + rnd(`${ctx.seed}-w-start-${k}`) * 20;
      const walk = rnd(`${ctx.seed}-w-walk-${k}`, 34, 44);
      const vv: V = {x0: c.x, z0: c.z, c1, p2, start, walk, uDeath: 1, nx, nz, phase: rnd(`${ctx.seed}-w-ph-${k}`) * 6.28, yawRate: (rnd(`${ctx.seed}-w-yaw-${k}`) - 0.5) * 0.05};
      for (let s = 0; s <= 400; s++) {
        const [x, z] = bez(vv, s / 400);
        if (off(x, z)) {
          vv.uDeath = s / 400;
          break;
        }
      }
      return vv;
    });
    const death = v.map((w) => w.start + w.walk * Math.pow(w.uDeath, 1 / POW));
    return {victims: victims.map((c) => c.i), death, data: {v}};
  },
  pillar: (p, k, t, out) => {
    const w = p.data.v[k];
    const td = p.death[k];
    const uAt = (tt: number) => Math.pow(clamp((tt - w.start) / w.walk), POW);
    if (t < td) {
      const u = uAt(t);
      const [x, z] = bez(w, u);
      out.x = x;
      out.z = z;
      // Hesitation, then an unsteady waddle that grows as it walks.
      const alive = prog(t, w.start - 10, w.start + 6);
      const [x2, z2] = bez(w, Math.min(1, u + 0.01));
      const dx = x2 - x || w.nx;
      const dz = z2 - z || w.nz;
      const wobble = Math.sin((t - w.start) * 0.55 + w.phase) * (0.05 + 0.07 * u) * alive;
      tiltOnEdge(out, -dz, dx, wobble, PILLAR_R, w.yawRate * Math.max(0, t - w.start + 10));
      out.glow *= 1 - 0.25 * u;
      return;
    }
    const u0 = w.uDeath;
    const [x, z] = bez(w, u0);
    const [x2, z2] = bez(w, Math.min(1, u0 + 0.01));
    const dudt = (POW * Math.pow(u0, (POW - 1) / POW)) / w.walk;
    const vx = ((x2 - x) / 0.01) * dudt;
    const vz = ((z2 - z) / 0.01) * dudt;
    out.glow *= 0.75;
    fallAway(out, t - td, {x, y: 0, z, vx, vy: 0, vz, spin: 0.075, dirX: vx, dirZ: vz, tilt0: 0.1});
  },
  tile: (p, cell, t, out) => {
    const k = p.victims.indexOf(cell.i);
    const td = p.death[k];
    // The tile goes dark the moment its trader leaves it.
    const leave = p.data.v[k].start + p.data.v[k].walk * 0.45;
    out.glow *= 1 - EASE.out(prog(t, leave - 4, leave + 8));
    out.dead = Math.max(out.dead, EASE.out(prog(t, td - 4, td + 6)));
    out.flash = Math.max(out.flash, Math.exp(-Math.max(0, t - td) / 5) * prog(t, td - 3, td));
  },
};
