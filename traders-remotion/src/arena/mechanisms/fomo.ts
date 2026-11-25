// TRAP · FOMO: a dazzling peak rises beyond the far edge. Pillars rush toward it and run straight off the cliff.
import {EASE, prog} from '../../lib/anim';
import {EDGE, idx} from '../grid';
import {fallAway, tiltOnEdge} from '../fall';
import type {Mechanism, Prepared} from '../types';

type D = {px: number; pz: number; start: number[]; dir: [number, number][]; collapse: number};

const A = 0.0135;
export const PEAK = {x: 0.6, z: -(EDGE + 2.1), rise: [2, 24] as const};

export const fomo: Mechanism<D> = {
  id: 'fomo',
  priority: 1,
  select: (pool, count) => {
    const chosen: number[] = [];
    const byI = new Map(pool.map((c) => [c.i, c]));
    while (chosen.length < count) {
      // A cell can run only if the way to the edge (smaller rows, same column) is already clear.
      const cands = pool.filter((c) => !chosen.includes(c.i) && (c.r === 0 || chosen.includes(idx(c.c, c.r - 1))));
      if (!cands.length) throw new Error('fomo: not enough runners with a clear path to the far edge');
      cands.sort((a, b) => Math.hypot(a.x - PEAK.x, a.z - PEAK.z) - Math.hypot(b.x - PEAK.x, b.z - PEAK.z));
      chosen.push(cands[0].i);
    }
    return chosen.map((i) => byI.get(i)!);
  },
  prepare: (victims) => {
    const start = victims.map((_, k) => 22 + k * 1.7);
    const dir = victims.map((c): [number, number] => {
      const dx = (PEAK.x - c.x) * 0.16;
      const l = Math.hypot(dx, 1);
      return [dx / l, -1 / l];
    });
    const death = victims.map((c, k) => {
      const d = (c.z + EDGE) / -dir[k][1] + 0.1;
      return start[k] + Math.sqrt((2 * d) / A);
    });
    return {victims: victims.map((c) => c.i), death, data: {px: PEAK.x, pz: PEAK.z, start, dir, collapse: Math.max(...death) + 4}};
  },
  pillar: (p, k, t, out) => {
    const st = p.data.start[k];
    const [dx, dz] = p.data.dir[k];
    const td = p.death[k];
    // Lured: they lean toward the light and glow hotter before they break into a run.
    const lure = prog(t, PEAK.rise[0] + 6, st);
    out.glow *= 1 + 0.6 * lure;
    out.heat = Math.max(out.heat, 0.15 * lure);
    if (t < td) {
      const tau = Math.max(0, t - st);
      const s = 0.5 * A * tau * tau;
      out.x += dx * s;
      out.z += dz * s;
      const lean = 0.08 * lure + 0.22 * EASE.out(prog(t, st, st + 8));
      tiltOnEdge(out, dx, dz, lean, 0.24);
      return;
    }
    const tau = td - st;
    const s = 0.5 * A * tau * tau;
    const v = A * tau;
    fallAway(out, t - td, {x: out.x + dx * s, y: 0, z: out.z + dz * s, vx: dx * v, vy: 0, vz: dz * v, spin: 0.08, dirX: dx, dirZ: dz, tilt0: 0.3});
  },
  tile: (p, cell, t, out) => {
    const k = p.victims.indexOf(cell.i);
    const st = p.data.start[k];
    const leave = st + Math.sqrt((2 * 0.6) / A);
    out.glow *= 1 - prog(t, leave - 2, leave + 6);
    out.dead = Math.max(out.dead, EASE.out(prog(t, leave, leave + 10)));
    out.flash = Math.max(out.flash, Math.exp(-Math.max(0, t - leave) / 5) * prog(t, leave - 2, leave));
  },
};

/** Peak intensity/height at local frame t (0 = hidden). */
export const peakState = (p: Prepared<unknown>, t: number) => {
  const d = p.data as D;
  const up = EASE.out(prog(t, PEAK.rise[0], PEAK.rise[1]));
  const down = EASE.in(prog(t, d.collapse, d.collapse + 16));
  return {x: d.px, z: d.pz, h: up * (1 - 0.85 * down), glow: up * (1 - down) * (0.85 + 0.15 * Math.sin(t * 0.5)), collapse: down};
};
