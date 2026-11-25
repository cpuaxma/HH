// TRAP · revenge trading: one pillar heats up red, then a red arc leaps from pillar to pillar,
// faster and faster, toppling each one.
import {EASE, prog, rnd} from '../../lib/anim';
import {N, PILLAR_R, dist, idx} from '../grid';
import type {Mechanism} from '../types';
import {tiltOnEdge} from '../fall';

type D = {strike: number[]; dir: [number, number][]; heatFrom: number};

const HEAT_FROM = 4;
const FIRST = 18;
const TOPPLE = 10;

export const chain: Mechanism<D> = {
  id: 'chain',
  priority: 3,
  select: (pool, count, ctx) => {
    const left = [...pool];
    // Start near the middle-front of the board, where the camera sees it best.
    left.sort((a, b) => Math.hypot(a.x - 0.5, a.z - 1.2) - Math.hypot(b.x - 0.5, b.z - 1.2));
    const out = [left.shift()!];
    while (out.length < count) {
      const cur = out[out.length - 1];
      let best = 0;
      let score = Infinity;
      left.forEach((c, j) => {
        const s = dist(cur, c) + rnd(`${ctx.seed}-ch-${c.i}-${out.length}`) * 0.6;
        if (s < score) {
          score = s;
          best = j;
        }
      });
      out.push(left.splice(best, 1)[0]);
    }
    return out;
  },
  prepare: (victims, ctx) => {
    const strike: number[] = [FIRST];
    for (let k = 1; k < victims.length; k++) strike.push(strike[k - 1] + Math.max(2.6, 7.2 * Math.pow(0.84, k - 1)));
    // Topple toward an empty neighbour (or off the board), as close as possible to the chain's direction.
    const dir = victims.map((c, k): [number, number] => {
      const from = victims[Math.max(0, k - 1)];
      const to = victims[Math.min(victims.length - 1, k + 1)];
      const pdx = k === 0 ? to.x - c.x : c.x - from.x;
      const pdz = k === 0 ? to.z - c.z : c.z - from.z;
      const pa = Math.atan2(pdz, pdx);
      let bestA = pa;
      let bestS = Infinity;
      for (let j = 0; j < 8; j++) {
        const a = (j / 8) * Math.PI * 2;
        const nc = Math.round(c.c + Math.cos(a));
        const nr = Math.round(c.r + Math.sin(a));
        const inside = nc >= 0 && nc < N && nr >= 0 && nr < N;
        const occupied = inside && ctx.standing.has(idx(nc, nr)) && !victims.slice(0, k).some((v) => v.i === idx(nc, nr));
        let da = Math.abs(a - pa) % (Math.PI * 2);
        if (da > Math.PI) da = Math.PI * 2 - da;
        const s = da + (occupied ? 4 : 0) + rnd(`${ctx.seed}-cd-${k}-${j}`) * 0.2;
        if (s < bestS) {
          bestS = s;
          bestA = a;
        }
      }
      return [Math.cos(bestA), Math.sin(bestA)];
    });
    return {victims: victims.map((c) => c.i), death: strike.map((s) => s + TOPPLE), data: {strike, dir, heatFrom: HEAT_FROM}};
  },
  pillar: (p, k, t, out) => {
    const s = p.data.strike[k];
    const [dx, dz] = p.data.dir[k];
    if (k === 0) {
      // The first loss: it heats up, trembling with rage.
      const h = prog(t, HEAT_FROM, s);
      out.red = Math.max(out.red, EASE.in(h));
      out.heat = Math.max(out.heat, 0.35 * h * (0.6 + 0.4 * Math.sin(t * 1.3)));
      out.x += Math.sin(t * 3.3) * 0.014 * h;
      out.z += Math.cos(t * 2.9) * 0.014 * h;
    }
    if (t < s) return;
    out.red = 1;
    out.heat = Math.max(out.heat, Math.exp(-(t - s) / 4));
    const fall = EASE.in(prog(t, s + 1, s + 1 + TOPPLE));
    const land = t - (s + 1 + TOPPLE);
    const bounce = land > 0 ? -0.09 * Math.exp(-land / 3) * Math.sin(land * 0.9) : 0;
    tiltOnEdge(out, dx, dz, fall * (Math.PI / 2 - 0.04) + bounce, PILLAR_R);
    out.crack = Math.max(out.crack, EASE.out(prog(t, s + 4, s + 16)));
    out.dissolve = Math.max(out.dissolve, EASE.in(prog(t, s + 16, s + 42)));
    out.y -= 0.25 * prog(t, s + 14, s + 42);
    out.glow *= 0.5;
    out.reflect *= 1 - fall;
  },
  tile: (p, cell, t, out) => {
    const k = p.victims.indexOf(cell.i);
    const s = p.data.strike[k];
    out.glow *= 1 - prog(t, s, s + 6);
    out.dead = Math.max(out.dead, EASE.out(prog(t, s + 6, s + 14)));
    out.flash = Math.max(out.flash, Math.exp(-Math.max(0, t - s - 10) / 6) * prog(t, s + 8, s + 11));
  },
};
export const CHAIN_FIRST = FIRST;
