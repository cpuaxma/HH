import {TIMING} from '../data';
import {finaleCenter} from './camera';
import {getCity} from './city';
import {makeRandom} from './random';
import {distanceToRoute, insidePepper} from './route';

export type FinalePin = {x: number; y: number; z: number; start: number};

let cached: FinalePin[] | null = null;

/** The finale's pin cascade: roofs around (not inside) the pepper, popping from the centre outwards. */
export const getFinalePins = (): FinalePin[] => {
  if (cached) return cached;
  const city = getCity();
  const c = finaleCenter();
  const rnd = makeRandom(4242);
  const featured = city.featured.map((f) => f.roof);
  const candidates = city.roofs.filter(
    (r) =>
      Math.abs(r.x - c.x) < 300 &&
      r.z - c.z > -225 &&
      r.z - c.z < 430 &&
      !featured.some((f) => Math.hypot(f.x - r.x, f.z - r.z) < 70),
  );
  const chosen: {x: number; y: number; z: number}[] = [];
  for (let attempt = 0; attempt < 4000 && chosen.length < 44; attempt++) {
    const r = rnd.pick(candidates);
    // Keep the pepper outline clear so it reads from above.
    if (distanceToRoute(r.x, r.z) < 40 || insidePepper(r.x, r.z)) continue;
    if (chosen.some((p) => Math.hypot(p.x - r.x, p.z - r.z) < 62)) continue;
    if (featured.some((p) => Math.hypot(p.x - r.x, p.z - r.z) < 62)) continue;
    chosen.push(r);
  }
  const sorted = chosen.map((p) => ({...p, d: Math.hypot(p.x - c.x, p.z - c.z)})).sort((a, b) => a.d - b.d);
  cached = sorted.map((p, i) => ({x: p.x, y: p.y, z: p.z, start: TIMING.finalePinsStart + i * 1.45 + rnd.range(0, 3)}));
  return cached;
};
