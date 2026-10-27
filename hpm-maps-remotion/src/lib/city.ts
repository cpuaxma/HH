import {BUSINESSES, CITY, PEPPER_ROUTE} from '../data';
import {makeRandom} from './random';
import {distanceToRoute, getRoute, routeDirection, routePoint} from './route';

export type Rect = {x0: number; z0: number; x1: number; z1: number};
/** A building box. `rot` turns it about its centre (radians), for buildings that face the curved boulevard. */
export type Box = {cx: number; cz: number; sx: number; sz: number; y0: number; h: number; color: number; rot?: number};
export type Tree = {x: number; z: number; r: number; trunk: number; color: number};
export type Segment = {ax: number; az: number; bx: number; bz: number};
export type Road = {pos: number; width: number};
/** A diagonal avenue: a strip of road along the line from a to b. */
export type Avenue = {ax: number; az: number; bx: number; bz: number; width: number};

export type Featured = {
  /** The point on the route where the head stops. */
  corner: {x: number; z: number};
  /** Footprint and height of the highlighted building. */
  box: Box;
  /** Roof centre, where the pin stands. */
  roof: {x: number; y: number; z: number};
};

export type City = {
  xRoads: Road[];
  zRoads: Road[];
  blocks: Rect[];
  parks: Rect[];
  avenues: Avenue[];
  boxes: Box[];
  trees: Tree[];
  edgeLines: Segment[];
  featured: Featured[];
  /** Roofs (x, y, z) used for the finale pin cascade. */
  roofs: {x: number; y: number; z: number}[];
  shoreZ: number;
  /** Arc length along the route of each stop. */
  stopS: number[];
  /** For each stop: how the route bends on the way in, for the nav banner. */
  approach: {turn: 'left' | 'right' | 'straight'}[];
};

const SIDEWALK = 4;
const LINE_W = 0.45;

const snap = (roads: Road[], v: number) =>
  roads.reduce((best, r) => (Math.abs(r.pos - v) < Math.abs(best.pos - v) ? r : best)).pos;

/** Signed distance from (x, z) to the centre line of an avenue. */
const avenueDistance = (a: Avenue, x: number, z: number) => {
  const dx = a.bx - a.ax;
  const dz = a.bz - a.az;
  const len = Math.hypot(dx, dz);
  return ((x - a.ax) * dz - (z - a.az) * dx) / len;
};

const rectHitsAvenue = (r: Rect, a: Avenue, margin: number) => {
  const half = a.width / 2 + margin;
  const d = [
    avenueDistance(a, r.x0, r.z0),
    avenueDistance(a, r.x1, r.z0),
    avenueDistance(a, r.x0, r.z1),
    avenueDistance(a, r.x1, r.z1),
  ];
  return !(Math.min(...d) > half || Math.max(...d) < -half);
};

/** Clip the segment p→q to a rectangle (Liang–Barsky). Returns [t0, t1] or null. */
const clipToRect = (s: Segment, r: Rect): [number, number] | null => {
  const dx = s.bx - s.ax;
  const dz = s.bz - s.az;
  let t0 = 0;
  let t1 = 1;
  const checks: [number, number][] = [
    [-dx, s.ax - r.x0],
    [dx, r.x1 - s.ax],
    [-dz, s.az - r.z0],
    [dz, r.z1 - s.az],
  ];
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return null;
  }
  return [t0, t1];
};

/** Cut away the parts of a segment that run across an avenue. */
/** Cut away the parts of a segment that run across the pepper boulevard. */
const cutByRoute = (s: Segment, half: number): Segment[] => {
  const len = Math.hypot(s.bx - s.ax, s.bz - s.az);
  const n = Math.max(1, Math.ceil(len));
  const out: Segment[] = [];
  let start: number | null = null;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const inside = distanceToRoute(s.ax + (s.bx - s.ax) * t, s.az + (s.bz - s.az) * t) < half;
    if (!inside && start === null) start = t;
    if ((inside || k === n) && start !== null) {
      const end = inside ? (k - 1) / n : t;
      if ((end - start) * len > 0.5) {
        out.push({ax: s.ax + (s.bx - s.ax) * start, az: s.az + (s.bz - s.az) * start, bx: s.ax + (s.bx - s.ax) * end, bz: s.az + (s.bz - s.az) * end});
      }
      start = null;
    }
  }
  return out;
};

const cutByAvenues = (s: Segment, avenues: Avenue[]): Segment[] => {
  let pieces: [number, number][] = [[0, 1]];
  for (const a of avenues) {
    const da = avenueDistance(a, s.ax, s.az);
    const db = avenueDistance(a, s.bx, s.bz);
    const half = a.width / 2;
    if (da === db) {
      if (Math.abs(da) < half) return [];
      continue;
    }
    // Parameter range where |d(t)| < half.
    const tA = (-half - da) / (db - da);
    const tB = (half - da) / (db - da);
    const lo = Math.min(tA, tB);
    const hi = Math.max(tA, tB);
    const next: [number, number][] = [];
    for (const [p0, p1] of pieces) {
      if (hi <= p0 || lo >= p1) {
        next.push([p0, p1]);
        continue;
      }
      if (lo > p0) next.push([p0, lo]);
      if (hi < p1) next.push([hi, p1]);
    }
    pieces = next;
  }
  const dx = s.bx - s.ax;
  const dz = s.bz - s.az;
  return pieces
    .filter(([p0, p1]) => (p1 - p0) * Math.hypot(dx, dz) > 0.5)
    .map(([p0, p1]) => ({ax: s.ax + dx * p0, az: s.az + dz * p0, bx: s.ax + dx * p1, bz: s.az + dz * p1}));
};

const makeRoads = (min: number, max: number, rnd: ReturnType<typeof makeRandom>): Road[] => {
  const roads: Road[] = [];
  let pos = min;
  let i = 0;
  while (pos <= max) {
    roads.push({pos, width: i % 3 === 0 ? 13 : 10});
    pos += rnd.range(54, 72);
    i++;
  }
  return roads;
};

let cached: City | null = null;

export const getCity = (): City => {
  if (cached) return cached;
  const rnd = makeRandom(CITY.seed);
  const {minX, maxX, minZ, maxZ} = CITY.bounds;

  const xRoads = makeRoads(minX, maxX, rnd); // roads of constant x (run north–south)
  const zRoads = makeRoads(minZ, maxZ, rnd); // roads of constant z (run east–west)
  zRoads[0].width = 16; // the seafront Corniche
  const shoreZ = zRoads[0].pos - zRoads[0].width / 2 - 7;

  const avenues: Avenue[] = [
    {ax: minX - 40, az: 120, bx: maxX + 40, bz: 430, width: 12},
    {ax: minX - 40, az: -40, bx: 120, bz: maxZ + 40, width: 12},
  ];

  // Blocks between roads.
  const blocks: Rect[] = [];
  for (let i = 0; i < xRoads.length - 1; i++) {
    for (let j = 0; j < zRoads.length - 1; j++) {
      blocks.push({
        x0: xRoads[i].pos + xRoads[i].width / 2,
        x1: xRoads[i + 1].pos - xRoads[i + 1].width / 2,
        z0: zRoads[j].pos + zRoads[j].width / 2,
        z1: zRoads[j + 1].pos - zRoads[j + 1].width / 2,
      });
    }
  }
  const blockAt = (x: number, z: number) => blocks.find((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1);

  // Featured buildings: just inside the pepper (right of travel, which runs
  // clockwise), turned to face the boulevard. Each stop slides along the route
  // until its building clears the grid streets and avenues.
  const route = getRoute();
  const BLVD = PEPPER_ROUTE.boulevard;
  const SIZE = 22;
  const featured: Featured[] = [];
  const stopS: number[] = [];
  const approach: City['approach'] = [];
  const clearOfStreets = (x: number, z: number, r: number) =>
    xRoads.every((rd) => Math.abs(x - rd.pos) > rd.width / 2 + r) &&
    zRoads.every((rd) => Math.abs(z - rd.pos) > rd.width / 2 + r) &&
    avenues.every((av) => Math.abs(avenueDistance(av, x, z)) > av.width / 2 + r);
  BUSINESSES.forEach((b, i) => {
    const s0 = b.along * route.length;
    const offset = BLVD / 2 + SIDEWALK + SIZE / 2;
    const place = (s: number) => {
      const p = routePoint(s);
      const d = routeDirection(s, 10);
      return {s, p, d, x: p.x - d.z * offset, z: p.z + d.x * offset};
    };
    let spot = place(s0);
    for (let k = 1; k <= 40; k++) {
      const c = place(s0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 4);
      const ok = clearOfStreets(c.x, c.z, SIZE * 0.72) && distanceToRoute(c.x, c.z) > offset - 2;
      if (ok) {
        spot = c;
        break;
      }
    }
    const floors = 6 + (i % 3);
    const h = floors * CITY.floorHeight + 0.6;
    featured.push({
      corner: spot.p,
      box: {cx: spot.x, cz: spot.z, sx: SIZE, sz: SIZE, y0: 0, h, color: 0xffffff, rot: Math.atan2(spot.d.x, spot.d.z)},
      roof: {x: spot.x, y: h, z: spot.z},
    });
    stopS.push(spot.s);
    // How the route bends over the last stretch into the stop.
    const before = routeDirection(spot.s - 150, 10);
    const cross = before.x * spot.d.z - before.z * spot.d.x;
    const dot = before.x * spot.d.x + before.z * spot.d.z;
    const bend = Math.atan2(cross, dot);
    approach.push({turn: Math.abs(bend) < 0.5 ? 'straight' : bend > 0 ? 'right' : 'left'});
  });
  const nearFeatured = (x: number, z: number, r: number) =>
    featured.some((f) => Math.hypot(f.box.cx - x, f.box.cz - z) < SIZE * 0.72 + r);


  // Parks: a campus green near Bliss Street and a square in the middle of town.
  const parkSeeds: [number, number][] = [
    [-60, -400],
    [20, 60],
    [380, 200],
  ];
  const parks: Rect[] = [];
  for (const [x, z] of parkSeeds) {
    const b = blockAt(snap(xRoads, x) + 30, snap(zRoads, z) + 30);
    if (b && !nearFeatured((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, Math.hypot(b.x1 - b.x0, b.z1 - b.z0) / 2)) parks.push(b);
  }

  const boxes: Box[] = [];
  const roofs: City['roofs'] = [];
  const trees: Tree[] = [];
  const pickColor = () => rnd.int(0, 4);
  const treeColor = () => rnd.next();

  for (const f of featured) boxes.push(f.box);

  const inAvenue = (r: Rect, margin: number) => avenues.some((a) => rectHitsAvenue(r, a, margin));
  const cx = (minX + maxX) / 2;

  for (const block of blocks) {
    const isPark = parks.includes(block);
    if (!isPark) {
      const ix0 = block.x0 + SIDEWALK;
      const ix1 = block.x1 - SIDEWALK;
      const iz0 = block.z0 + SIDEWALK;
      const iz1 = block.z1 - SIDEWALK;
      const nx = Math.max(1, Math.round((ix1 - ix0) / 21));
      const nz = Math.max(1, Math.round((iz1 - iz0) / 21));
      const gap = 1.6;
      const lw = (ix1 - ix0 - gap * (nx - 1)) / nx;
      const ld = (iz1 - iz0 - gap * (nz - 1)) / nz;
      for (let a = 0; a < nx; a++) {
        for (let b = 0; b < nz; b++) {
          // Interior lots of big blocks are courtyards; keep the perimeter built up.
          const interior = a > 0 && a < nx - 1 && b > 0 && b < nz - 1;
          if (interior && rnd.chance(0.55)) continue;
          if (rnd.chance(0.05)) continue;
          const lot: Rect = {
            x0: ix0 + a * (lw + gap),
            x1: ix0 + a * (lw + gap) + lw,
            z0: iz0 + b * (ld + gap),
            z1: iz0 + b * (ld + gap) + ld,
          };
          const lcx = (lot.x0 + lot.x1) / 2;
          const lcz = (lot.z0 + lot.z1) / 2;
          const half = Math.hypot(lot.x1 - lot.x0, lot.z1 - lot.z0) / 2;
          if (nearFeatured(lcx, lcz, half + 1.5)) continue;
          if (distanceToRoute(lcx, lcz) < BLVD / 2 + 2.5 + half * 0.85) continue;
          if (inAvenue(lot, 3)) continue;
          const inset = () => rnd.range(0, 1.6);
          const x0 = lot.x0 + inset();
          const x1 = lot.x1 - inset();
          const z0 = lot.z0 + inset();
          const z1 = lot.z1 - inset();
          // Taller towards the seafront and the centre, low-rise further out.
          const centre = (block.x0 + block.x1) / 2;
          const seaward = 1 - Math.min(1, Math.max(0, ((block.z0 + block.z1) / 2 - minZ) / 700));
          const inward = 1 - Math.min(1, Math.abs(centre - cx) / 600);
          const bias = 0.35 * seaward + 0.25 * inward;
          const t = Math.min(1, Math.pow(rnd.next(), 1.7 - bias));
          const floors = Math.max(1, Math.min(CITY.maxFloors, Math.round(1 + t * (CITY.maxFloors - 1))));
          const h = floors * CITY.floorHeight + 0.6;
          const color = pickColor();
          const box: Box = {cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, sx: x1 - x0, sz: z1 - z0, y0: 0, h, color};
          boxes.push(box);
          let top = h;
          // Stepped tops on some mid- and high-rise buildings.
          if (floors >= 4 && rnd.chance(0.32)) {
            const k = rnd.range(0.55, 0.75);
            const extra = rnd.int(1, 3) * CITY.floorHeight;
            boxes.push({cx: box.cx, cz: box.cz, sx: box.sx * k, sz: box.sz * k, y0: h, h: extra, color});
            top = h + extra;
            if (rnd.chance(0.35)) {
              const k2 = k * rnd.range(0.5, 0.7);
              boxes.push({cx: box.cx, cz: box.cz, sx: box.sx * k2, sz: box.sz * k2, y0: top, h: CITY.floorHeight, color});
              top += CITY.floorHeight;
            }
          }
          roofs.push({x: box.cx, y: top, z: box.cz});
        }
      }
    }

    // Street trees along the sidewalk.
    const edges: [number, number, number, number][] = [
      [block.x0 + 2, block.z0 + 2, block.x1 - 2, block.z0 + 2],
      [block.x1 - 2, block.z0 + 2, block.x1 - 2, block.z1 - 2],
      [block.x1 - 2, block.z1 - 2, block.x0 + 2, block.z1 - 2],
      [block.x0 + 2, block.z1 - 2, block.x0 + 2, block.z0 + 2],
    ];
    for (const [ax, az, bx, bz] of edges) {
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.floor(len / 8.5);
      for (let k = 1; k < n; k++) {
        if (rnd.chance(0.32)) continue;
        const u = k / n;
        const x = ax + (bx - ax) * u;
        const z = az + (bz - az) * u;
        const spot: Rect = {x0: x - 2, x1: x + 2, z0: z - 2, z1: z + 2};
        if (inAvenue(spot, 0)) continue;
        if (nearFeatured(x, z, 2.5)) continue;
        if (distanceToRoute(x, z) < BLVD / 2 + 1.8) continue;
        trees.push({x, z, r: rnd.range(1.5, 2.2), trunk: rnd.range(1.8, 2.6), color: treeColor()});
      }
    }

    if (isPark) {
      const placed: {x: number; z: number}[] = [];
      for (let attempt = 0; attempt < 900 && placed.length < 70; attempt++) {
        const x = rnd.range(block.x0 + 5, block.x1 - 5);
        const z = rnd.range(block.z0 + 5, block.z1 - 5);
        // Keep a cross-shaped path through the park clear.
        if (Math.abs(x - (block.x0 + block.x1) / 2) < 3 || Math.abs(z - (block.z0 + block.z1) / 2) < 3) continue;
        if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < 5.2)) continue;
        if (inAvenue({x0: x - 2, x1: x + 2, z0: z - 2, z1: z + 2}, 0)) continue;
        if (distanceToRoute(x, z) < BLVD / 2 + 2 || nearFeatured(x, z, 3)) continue;
        placed.push({x, z});
        trees.push({x, z, r: rnd.range(1.9, 3.0), trunk: rnd.range(2, 3), color: treeColor()});
      }
    }
  }

  // Curb lines around each block, cut where an avenue crosses.
  const edgeLines: Segment[] = [];
  for (const b of blocks) {
    const ring: Segment[] = [
      {ax: b.x0, az: b.z0, bx: b.x1, bz: b.z0},
      {ax: b.x1, az: b.z0, bx: b.x1, bz: b.z1},
      {ax: b.x1, az: b.z1, bx: b.x0, bz: b.z1},
      {ax: b.x0, az: b.z1, bx: b.x0, bz: b.z0},
    ];
    for (const seg of ring) for (const piece of cutByAvenues(seg, avenues)) edgeLines.push(...cutByRoute(piece, BLVD / 2));
  }
  // Curb lines of the pepper boulevard, kept to the inside of blocks.
  for (const side of [-1, 1]) {
    const step = 4;
    for (let s = 0; s < route.length - step; s += step) {
      const p = routePoint(s);
      const q = routePoint(s + step);
      const d = routeDirection(s + step / 2, 3);
      const o = (side * BLVD) / 2;
      const seg: Segment = {ax: p.x - d.z * o, az: p.z + d.x * o, bx: q.x - d.z * o, bz: q.z + d.x * o};
      const mx = (seg.ax + seg.bx) / 2;
      const mz = (seg.az + seg.bz) / 2;
      // Skip where it would run over a street or into the other side of the stem.
      if (!blockAt(mx, mz) || distanceToRoute(mx, mz) < BLVD / 2 - 0.6) continue;
      edgeLines.push(seg);
    }
  }
  // Avenue curb lines, kept to the inside of blocks.
  for (const a of avenues) {
    const dx = a.bx - a.ax;
    const dz = a.bz - a.az;
    const len = Math.hypot(dx, dz);
    const nx = dz / len;
    const nz = -dx / len;
    for (const side of [-1, 1]) {
      const off = (side * a.width) / 2;
      const s: Segment = {ax: a.ax + nx * off, az: a.az + nz * off, bx: a.bx + nx * off, bz: a.bz + nz * off};
      for (const b of blocks) {
        const t = clipToRect(s, b);
        if (!t) continue;
        const [t0, t1] = t;
        if ((t1 - t0) * len < 0.5) continue;
        edgeLines.push({
          ax: s.ax + (s.bx - s.ax) * t0,
          az: s.az + (s.bz - s.az) * t0,
          bx: s.ax + (s.bx - s.ax) * t1,
          bz: s.az + (s.bz - s.az) * t1,
        });
      }
    }
  }

  cached = {
    xRoads,
    zRoads,
    blocks,
    parks,
    avenues,
    boxes,
    trees,
    edgeLines,
    featured,
    roofs,
    shoreZ,
    stopS,
    approach,
  };
  return cached;
};

export const EDGE_LINE_WIDTH = LINE_W;
