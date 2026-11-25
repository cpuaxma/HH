import {rnd} from '../lib/anim';
import {type Cell, dist} from './grid';

/** Farthest-point sampling: an even, organic spread of `count` cells from `cands`. */
export const spread = (cands: Cell[], count: number, seed: string, first?: Cell): Cell[] => {
  if (cands.length < count) throw new Error(`Not enough cells to pick ${count} (only ${cands.length}) for ${seed}`);
  const out: Cell[] = [first ?? cands[Math.floor(rnd(`${seed}-first`) * cands.length)]];
  const left = cands.filter((c) => c !== out[0]);
  while (out.length < count) {
    let best = 0;
    let bestScore = -Infinity;
    left.forEach((c, j) => {
      const d = Math.min(...out.map((o) => dist(o, c)));
      const s = d + rnd(`${seed}-j-${c.i}-${out.length}`) * 0.35;
      if (s > bestScore) {
        bestScore = s;
        best = j;
      }
    });
    out.push(left.splice(best, 1)[0]);
  }
  return out;
};

/** 1-D cubic Hermite on u∈[0,1] (for joining motions with matching velocity). */
export const hermite01 = (p0: number, m0: number, p1: number, m1: number, u: number) => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
};
