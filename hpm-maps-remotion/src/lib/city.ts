import {BUSINESSES, CITY, ROUTE_START} from '../data';
import {makeRandom} from './random';

export type Rect = {x0: number; z0: number; x1: number; z1: number};
export type Box = {cx: number; cz: number; sx: number; sz: number; y0: number; h: number; color: number};
export type Tree = {x: number; z: number; r: number; trunk: number; color: number};
export type Segment = {ax: number; az: number; bx: number; bz: number};
export type Road = {pos: number; width: number};
/** A diagonal avenue: a strip of road along the line from a to b. */
export type Avenue = {ax: number; az: number; bx: number; bz: number; width: number};

export type Featured = {
  /** The intersection the route stops at. */
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
  routeStart: {x: number; z: number};
  stopCorners: {x: number; z: number}[];
  /** Route polyline through intersections: start, then each L-turn corner and stop. */
  waypoints: {x: number; z: number}[];
  /** For each stop: the manoeuvre at the last corner and the length of the final leg. */
  approach: {turn: 'left' | 'right' | 'straight'; finalLeg: number}[];
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

const rectsOverlap = (a: Rect, b: Rect, margin = 0) =>
  a.x0 < b.x1 + margin && a.x1 > b.x0 - margin && a.z0 < b.z1 + margin && a.z1 > b.z0 - margin;

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

/** Direction of the last leg of the L-shaped path the route takes into a stop. */
export type Leg = {dx: number; dz: number};

/** Picks the L-shaped path from p to q that keeps going straight / never reverses. */
export const lPath = (
  p: {x: number; z: number},
  q: {x: number; z: number},
  incoming: Leg | null,
): {x: number; z: number}[] => {
  const xFirst = {x: q.x, z: p.z};
  const zFirst = {x: p.x, z: q.z};
  const score = (corner: {x: number; z: number}) => {
    const lx = corner.x - p.x;
    const lz = corner.z - p.z;
    const len = Math.hypot(lx, lz);
    if (len < 1e-6 || !incoming) return 0;
    const dot = (lx * incoming.dx + lz * incoming.dz) / len;
    return dot < -0.5 ? -10 : dot;
  };
  const corner = score(xFirst) >= score(zFirst) ? xFirst : zFirst;
  return [corner, q];
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

  const routeStart = {x: snap(xRoads, ROUTE_START[0]), z: snap(zRoads, ROUTE_START[1])};
  const stopCorners = BUSINESSES.map((b) => ({x: snap(xRoads, b.mapPosition[0]), z: snap(zRoads, b.mapPosition[1])}));

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

  // Featured buildings: on the block ahead and to the right of the arrival direction.
  const featured: Featured[] = [];
  const waypoints = [routeStart];
  const approach: City['approach'] = [];
  let prev = routeStart;
  let incoming: Leg | null = {dx: 0, dz: -1};
  stopCorners.forEach((q, i) => {
    const [corner] = lPath(prev, q, incoming);
    let dx = q.x - corner.x;
    let dz = q.z - corner.z;
    const finalLeg = Math.hypot(dx, dz);
    const firstLeg = Math.hypot(corner.x - prev.x, corner.z - prev.z);
    if (finalLeg < 1e-6) {
      dx = corner.x - prev.x;
      dz = corner.z - prev.z;
    }
    const len = Math.hypot(dx, dz);
    const d = {dx: dx / len, dz: dz / len};
    // The manoeuvre is the last change of direction on the way in, which can be
    // back at the previous stop when one leg of the L has zero length.
    const dirs: Leg[] = incoming ? [incoming] : [];
    if (firstLeg > 1e-6) dirs.push({dx: (corner.x - prev.x) / firstLeg, dz: (corner.z - prev.z) / firstLeg});
    if (finalLeg > 1e-6) dirs.push(d);
    let turn: 'left' | 'right' | 'straight' = 'straight';
    for (let k = 1; k < dirs.length; k++) {
      const cross = dirs[k - 1].dx * dirs[k].dz - dirs[k - 1].dz * dirs[k].dx;
      if (Math.abs(cross) > 0.5) turn = cross > 0 ? 'right' : 'left';
    }
    if (finalLeg > 1e-6 && firstLeg > 1e-6) waypoints.push(corner);
    approach.push({turn, finalLeg: finalLeg > 1e-6 ? finalLeg : len});
    waypoints.push(q);
    const right = {dx: -d.dz, dz: d.dx};
    const probe = {x: q.x + (d.dx + right.dx) * 20, z: q.z + (d.dz + right.dz) * 20};
    const block = blockAt(probe.x, probe.z);
    if (!block) throw new Error(`No block next to stop ${i}`);
    const size = 22;
    const floors = 6 + (i % 3);
    const h = floors * CITY.floorHeight + 0.6;
    // Corner of the block nearest the intersection.
    const cxEdge = Math.abs(block.x0 - q.x) < Math.abs(block.x1 - q.x) ? block.x0 + SIDEWALK : block.x1 - SIDEWALK;
    const czEdge = Math.abs(block.z0 - q.z) < Math.abs(block.z1 - q.z) ? block.z0 + SIDEWALK : block.z1 - SIDEWALK;
    const cx = cxEdge + Math.sign(probe.x - q.x) * (size / 2);
    const cz = czEdge + Math.sign(probe.z - q.z) * (size / 2);
    featured.push({
      corner: q,
      box: {cx, cz, sx: size, sz: size, y0: 0, h, color: 0xffffff},
      roof: {x: cx, y: h, z: cz},
    });
    incoming = d;
    prev = q;
  });
  const featuredRects: Rect[] = featured.map((f) => ({
    x0: f.box.cx - f.box.sx / 2,
    x1: f.box.cx + f.box.sx / 2,
    z0: f.box.cz - f.box.sz / 2,
    z1: f.box.cz + f.box.sz / 2,
  }));

  // Parks: a campus green near Bliss Street and a square in the middle of town.
  const parkSeeds: [number, number][] = [
    [-60, -400],
    [20, 60],
    [380, 200],
  ];
  const parks: Rect[] = [];
  for (const [x, z] of parkSeeds) {
    const b = blockAt(snap(xRoads, x) + 30, snap(zRoads, z) + 30);
    if (b && !featuredRects.some((f) => rectsOverlap(f, b, 2))) parks.push(b);
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
          if (featuredRects.some((f) => rectsOverlap(f, lot, 1.5))) continue;
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
        if (featuredRects.some((f) => rectsOverlap(f, spot, 0.5))) continue;
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
    for (const s of ring) edgeLines.push(...cutByAvenues(s, avenues));
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
    routeStart,
    stopCorners,
    waypoints,
    approach,
  };
  return cached;
};

export const EDGE_LINE_WIDTH = LINE_W;
