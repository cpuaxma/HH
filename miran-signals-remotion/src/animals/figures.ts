// The five market animals, sculpted in code (see sdf.ts) as cast-metal statues: real
// proportions and anatomy (muscle masses, joints, hooves, claws, flight feathers), smooth
// cast surfaces with crisp form changes, eyes set in sockets under a lid (no beads), and
// creases darkened by a baked cavity term. Original designs made for this reel: no model,
// photo or existing design was copied or traced. Each animal is a small rig: a body plus
// jointed parts (head, arms, tail, wings) that the story poses frame by frame.
//
// Local axes for every animal: it faces +x, y is up, z is its left side; the floor is y = 0
// (the birds and the whale are centred on their own origin instead).
import {Bounded, Part, Sdf, Vec, allK, blade, chain, cone, ell, feather, pairZ, regionMask, shingles, withK} from './sdf';

export type Metal = 'gold' | 'silver';

export type Joint = {
  name: string;
  /** Where the part turns, in the animal's local coordinates. */
  pivot: Vec;
  parent?: string;
  part: () => Part;
  /** Marching-cubes cells along the part's longest side. */
  res?: number;
};

export type FigureDef = {
  id: string;
  metal: Metal;
  joints: Joint[];
  /** Joints whose own fast moves count for motion blur (the root always does). */
  blurJoints?: string[];
  /** The baked cavity shading: how far it looks (units), how strong, and the darkest it gets. */
  cavity?: {reach: number; strength: number; floor: number};
};

const S = (s: 1 | -1, v: Vec): Vec => [v[0], v[1], v[2] * s];
const add = (a: Vec, b: Vec, k = 1): Vec => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const lerpV = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** An eye set in a socket, with upper and lower lids: carved and added after the rest of the part. */
const eye = (c: Vec, r: number, out: Vec, lidTilt = 0, lids = 1) => {
  const o = norm3(out);
  const socket = withK(ell(add(c, o, r * 0.55), [r * 1.4, r * 1.15, r * 1.4]), 0.012);
  const ball = withK(ell(c, [r, r * 0.9, r]), 0.004);
  if (lids <= 0) return {carve: [socket], after: [ball]};
  const lid = withK(ell(add(add(c, o, r * 0.42), [0, 1, 0], r * 0.6), [r * 1.3, r * 0.4 * lids, r * 1.05], [0, 0, lidTilt]), 0.008);
  const lower = withK(ell(add(add(c, o, r * 0.38), [0, -1, 0], r * 0.76), [r * 1.1, r * 0.28 * lids, r * 0.9]), 0.008);
  return {carve: [socket], after: [ball, lid, lower]};
};
const norm3 = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

// ─── The bull (gold): a fighting bull, the great hump of neck muscle, a deep wide chest, a
// tucked waist, lean legs and cloven hooves, horns sweeping forward ─────────────────────

/** A cloven hoof (two claws, a slit between, the coronet above, dewclaws behind). */
const hoof = (x: number, z: number) => ({
  prims: [
    ...allK(
      [
        ell([x + 0.03, 0.031, z + 0.021], [0.056, 0.032, 0.021], [0, 0, -0.15]),
        ell([x + 0.03, 0.031, z - 0.021], [0.056, 0.032, 0.021], [0, 0, -0.15]),
      ],
      0.01,
    ),
    withK(ell([x + 0.006, 0.06, z], [0.05, 0.024, 0.046]), 0.022),
    ...allK([ell([x - 0.042, 0.08, z + 0.021], [0.011, 0.013, 0.01]), ell([x - 0.042, 0.08, z - 0.021], [0.011, 0.013, 0.01])], 0.01),
  ],
  carve: [withK(ell([x + 0.075, 0.03, z], [0.05, 0.05, 0.004]), 0.005)],
});

const bullFrontLeg = (s: 1 | -1) => {
  const z = 0.17 * s;
  // The near foreleg a step ahead of the other.
  const dx = s > 0 ? 0.045 : -0.01;
  const h = hoof(0.415 + dx, z);
  return {
    prims: [
      // Shoulder blade and the triceps behind it, blending into the chest.
      withK(ell([0.3, 0.84, 0.15 * s], [0.23, 0.21, 0.11], [0, 0, 0.5]), 0.09),
      withK(ell([0.26, 0.67, 0.16 * s], [0.14, 0.13, 0.095]), 0.08),
      // The forearm, the knee, the cannon, the fetlock, the pastern.
      withK(cone([0.34, 0.63, z], [0.385 + dx * 0.6, 0.3, z], 0.1, 0.058), 0.06),
      withK(ell([0.39 + dx * 0.6, 0.285, z], [0.054, 0.052, 0.05]), 0.03),
      withK(cone([0.39 + dx * 0.6, 0.27, z], [0.4 + dx, 0.09, z], 0.043, 0.037), 0.03),
      withK(ell([0.4 + dx, 0.09, z], [0.048, 0.042, 0.045]), 0.022),
      withK(cone([0.4 + dx, 0.09, z], [0.42 + dx, 0.06, z], 0.038, 0.038), 0.018),
      ...h.prims,
    ],
    carve: h.carve,
  };
};

const bullHindLeg = (s: 1 | -1) => {
  const z = 0.155 * s;
  const dx = s > 0 ? 0.01 : -0.045;
  const h = hoof(-0.565 + dx, z);
  return {
    prims: [
      // The haunch: the big thigh muscle and the stifle, then the gaskin, the hock and its point.
      withK(ell([-0.5, 0.74, 0.14 * s], [0.26, 0.23, 0.11], [0, 0, -0.15]), 0.09),
      withK(ell([-0.38, 0.62, 0.16 * s], [0.11, 0.12, 0.08]), 0.08),
      withK(cone([-0.52, 0.62, z], [-0.62 + dx * 0.6, 0.33, z], 0.1, 0.054), 0.06),
      withK(ell([-0.63 + dx * 0.6, 0.315, z], [0.05, 0.056, 0.044]), 0.03),
      withK(ell([-0.668 + dx * 0.6, 0.34, z], [0.026, 0.033, 0.023]), 0.02),
      withK(cone([-0.615 + dx * 0.6, 0.3, z], [-0.585 + dx, 0.09, z], 0.042, 0.036), 0.03),
      withK(ell([-0.585 + dx, 0.09, z], [0.046, 0.041, 0.043]), 0.022),
      withK(cone([-0.585 + dx, 0.09, z], [-0.565 + dx, 0.06, z], 0.036, 0.036), 0.018),
      ...h.prims,
    ],
    carve: h.carve,
  };
};

export const BULL: FigureDef = {
  id: 'bull',
  metal: 'gold',
  blurJoints: ['head'],
  cavity: {reach: 0.09, strength: 1.6, floor: 0.3},
  joints: [
    {
      name: 'body',
      pivot: [0, 0, 0],
      res: 200,
      part: () => {
        const legs = [bullFrontLeg(1), bullFrontLeg(-1), bullHindLeg(1), bullHindLeg(-1)];
        return {
          blend: 0.07,
          prims: [
            // The barrel and the deep chest, the brisket, and the tucked waist and flank.
            ell([0.0, 0.74, 0], [0.46, 0.25, 0.27]),
            ell([0.31, 0.72, 0], [0.26, 0.28, 0.27]),
            withK(ell([0.43, 0.53, 0], [0.13, 0.1, 0.14]), 0.07),
            ell([-0.22, 0.68, 0], [0.3, 0.13, 0.21]),
            // The hump of neck muscle over the shoulders, and the thick neck.
            withK(ell([0.32, 1.0, 0], [0.33, 0.17, 0.2], [0, 0, -0.3]), 0.14),
            cone([0.34, 0.95, 0], [0.66, 0.88, 0], 0.235, 0.185),
            ell([0.54, 0.74, 0], [0.16, 0.16, 0.13]),
            // The dewlap: a fold of skin under the neck and chest.
            withK(ell([0.5, 0.59, 0], [0.19, 0.13, 0.03], [0, 0, 0.3]), 0.05),
            // The back, the rump and the pin bones at the tail head.
            ell([-0.24, 0.87, 0], [0.34, 0.12, 0.21]),
            ell([-0.52, 0.85, 0], [0.24, 0.16, 0.22]),
            withK(ell([-0.71, 0.93, 0], [0.07, 0.05, 0.11]), 0.06),
            ...legs.flatMap((l) => l.prims),
            // The tail, long and hanging, with a tuft of hair.
            ...allK(
              chain([
                [-0.75, 0.95, 0, 0.038],
                [-0.79, 0.74, 0, 0.025],
                [-0.8, 0.52, 0, 0.02],
                [-0.79, 0.36, 0, 0.018],
              ]),
              0.03,
            ),
            withK(ell([-0.79, 0.3, 0], [0.032, 0.065, 0.032]), 0.02),
            ...Array.from({length: 7}, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return withK(cone([-0.79, 0.31, 0], [-0.79 + 0.026 * Math.cos(a), 0.17 + 0.025 * (i % 3), 0.026 * Math.sin(a)], 0.015, 0.005), 0.012);
            }),
          ],
          carve: [
            ...legs.flatMap((l) => l.carve),
            // Folds of skin on the dewlap and the neck.
            ...[0.43, 0.51, 0.59].map((x) => withK(blade([x, 0.45, 0], [x - 0.03, 0.72, 0], 0.08, 0.006, [1, 0, 0]), 0.012)),
          ],
        };
      },
    },
    {
      name: 'head',
      pivot: [0.64, 0.9, 0],
      res: 176,
      part: () => {
        const eyes = [eye([0.862, 0.925, 0.13], 0.021, [0.3, 0.05, 1], -0.25), eye([0.862, 0.925, -0.13], 0.021, [0.3, 0.05, -1], -0.25)];
        // Tight curls of hair on the forehead.
        const fore = regionMask([0.85, 0.98, 0], [0.07, 0.085, 0.11], 0.5);
        const K = (2 * Math.PI) / 0.034;
        const curls = (x: number, y: number, z: number) => {
          const m = fore(x, y, z);
          if (m <= 0) return 0;
          const q = Math.abs(Math.sin(y * K + 0.6 * Math.sin(z * K * 0.5)) * Math.sin(z * K + 0.6 * Math.sin(y * K * 0.5)));
          return 0.0045 * (1 - Math.sqrt(q)) * m;
        };
        return {
          blend: 0.04,
          prims: [
            // A broad skull, a short broad face and a wide, flat-fronted muzzle.
            ell([0.77, 0.97, 0], [0.13, 0.12, 0.16]),
            cone([0.81, 0.95, 0], [0.92, 0.77, 0], 0.142, 0.11),
            ell([0.942, 0.72, 0], [0.076, 0.082, 0.112]),
            withK(ell([0.976, 0.732, 0], [0.04, 0.06, 0.094]), 0.018),
            // Cheeks, jaw and chin.
            ...pairZ((s) => [ell([0.81, 0.86, 0.092 * s], [0.11, 0.1, 0.078], [0, 0, -0.6])]),
            ell([0.875, 0.735, 0], [0.09, 0.06, 0.092], [0, 0, -0.65]),
            ell([0.92, 0.655, 0], [0.045, 0.035, 0.066]),
            // The poll, and the brow ridges over the eyes.
            ell([0.76, 1.04, 0], [0.07, 0.05, 0.14]),
            ...pairZ((s) => [withK(ell([0.856, 0.955, 0.116 * s], [0.052, 0.024, 0.04], [0, 0, -0.45]), 0.018)]),
            // Ears out sideways under the horns.
            ...pairZ((s) => [withK(feather([0.75, 0.98, 0.13 * s], [0.77, 0.93, 0.265 * s], 0.028, 0.034, 0.014, [0.5, 1, 0]), 0.03)]),
            // Horns: out from the poll, then forward and up to fine points.
            ...pairZ((s) =>
              allK(
                chain([
                  [0.76, 1.04, 0.11 * s, 0.062],
                  [0.78, 1.07, 0.22 * s, 0.051],
                  [0.84, 1.11, 0.3 * s, 0.041],
                  [0.93, 1.18, 0.33 * s, 0.03],
                  [1.01, 1.26, 0.3 * s, 0.017],
                  [1.06, 1.31, 0.26 * s, 0.005],
                ]),
                0.022,
              ),
            ),
          ],
          detail: curls,
          detailAmp: 0.0045,
          carve: [
            // Nostrils.
            ...pairZ((s) => [withK(ell([1.012, 0.737, 0.048 * s], [0.011, 0.024, 0.013], [0, 0.6 * s, 0.35]), 0.01)]),
            // The ears' hollows.
            ...pairZ((s) => [withK(feather([0.762, 0.988, 0.17 * s], [0.775, 0.944, 0.25 * s], 0.012, 0.02, 0.007, [0.5, 1, 0]), 0.008)]),
            ...eyes.flatMap((e) => e.carve),
          ],
          after: eyes.flatMap((e) => e.after),
        };
      },
    },
  ],
};

// ─── The bear (silver): a grizzly up on its short hind legs, a heavy pear-shaped body and
// shoulder hump, the head held low and forward, paws hanging with long curved claws, and
// layered locks of fur ──────────────────────────────────────────────────────────────────

/**
 * Combed fur: fine grooves running down around a vertical axis through (cx, cz), wavering a
 * little, fading in and out in long locks.
 */
const combed = (cx: number, cz: number, amp = 0.0045, spacing = 0.034): Sdf => (x, y, z) => {
  const dx = x - cx;
  const dz = z - cz;
  const r = Math.hypot(dx, dz);
  const th = Math.atan2(dz, dx);
  const arc = th * r + 0.018 * Math.sin(y * 7 + th * 3) + 0.01 * Math.sin(y * 17 + th * 7);
  const g = Math.pow(0.5 + 0.5 * Math.cos((2 * Math.PI * arc) / spacing), 6);
  const lock = 0.55 + 0.45 * Math.sin(y * 9 + th * 5 + Math.sin(th * 11));
  return amp * g * lock;
};

const without = (f: Sdf, bare: ((x: number, y: number, z: number) => number)[]): Sdf => (x, y, z) => {
  let m = 1;
  for (const b of bare) m *= 1 - b(x, y, z);
  return m <= 0 ? 0 : m * f(x, y, z);
};

const bearArm = (s: 1 | -1): Part => {
  const z = 0.37 * s;
  return {
    blend: 0.05,
    prims: [
      withK(ell([0.06, 1.24, 0.29 * s], [0.16, 0.17, 0.13]), 0.06),
      ...chain([
        [0.06, 1.26, 0.3 * s, 0.135],
        [0.13, 1.0, 0.36 * s, 0.112],
        [0.28, 0.85, z, 0.088],
      ]),
      ell([0.2, 0.93, 0.37 * s], [0.12, 0.1, 0.1], [0, 0, -0.6]),
      // The paw, hanging from the wrist: broad, with five toes and long curved claws.
      ell([0.34, 0.79, z], [0.075, 0.09, 0.112], [0, 0, -0.35]),
      ...[-0.066, -0.033, 0, 0.033, 0.066].flatMap((dz) => [
        withK(ell([0.372, 0.725, z + dz], [0.03, 0.03, 0.02]), 0.018),
        ...allK(
          chain([
            [0.385, 0.71, z + dz, 0.019],
            [0.41, 0.672, z + dz * 1.05, 0.0145],
            [0.418, 0.632, z + dz * 1.08, 0.0095],
            [0.405, 0.598, z + dz * 1.1, 0.0035],
          ]),
          0.008,
        ),
      ]),
    ],
    detail: without(combed(0.17, 0.35 * s), [regionMask([0.38, 0.68, z], [0.08, 0.1, 0.12], 0.3)]),
    detailAmp: 0.0045,
  };
};

export const BEAR: FigureDef = {
  id: 'bear',
  metal: 'silver',
  blurJoints: ['armL'],
  cavity: {reach: 0.07, strength: 1.7, floor: 0.28},
  joints: [
    {
      name: 'body',
      pivot: [0, 0, 0],
      res: 200,
      part: () => ({
        blend: 0.07,
        prims: [
          // A heavy pear-shaped body: wide hips and belly, a deep chest, the hump on the shoulders.
          ell([0.0, 0.5, 0], [0.31, 0.33, 0.34]),
          ell([0.06, 0.8, 0], [0.3, 0.32, 0.34]),
          ell([0.09, 1.06, 0], [0.26, 0.28, 0.31]),
          ell([-0.06, 1.14, 0], [0.24, 0.3, 0.3]),
          ell([-0.09, 1.36, 0], [0.21, 0.15, 0.27]),
          // The neck, held forward, with its thick ruff.
          cone([0.0, 1.3, 0], [0.16, 1.45, 0], 0.21, 0.165),
          ell([0.09, 1.4, 0], [0.18, 0.13, 0.25]),
          ...pairZ((s) => [
            ell([0.04, 1.24, 0.24 * s], [0.16, 0.16, 0.12]),
            // Short, heavy hind legs, a little bowed, on long flat feet.
            ell([0.03, 0.4, 0.19 * s], [0.21, 0.22, 0.15]),
            cone([0.07, 0.3, 0.215 * s], [0.1, 0.1, 0.225 * s], 0.135, 0.1),
            ell([0.17, 0.055, 0.225 * s], [0.2, 0.055, 0.11], [0, -0.12 * s, 0]),
            ...[-0.07, -0.035, 0, 0.035, 0.07].flatMap((dz) => [
              withK(ell([0.345, 0.045, 0.225 * s + dz + 0.03 * s], [0.04, 0.035, 0.022]), 0.02),
              withK(cone([0.37, 0.042, 0.225 * s + dz + 0.03 * s], [0.4, 0.018, 0.225 * s + dz * 1.08 + 0.035 * s], 0.014, 0.005), 0.008),
            ]),
          ]),
          withK(ell([-0.3, 0.55, 0], [0.06, 0.06, 0.07]), 0.04),
        ],
        detail: without(combed(0.02, 0), [regionMask([0.26, 0.66, 0], [0.16, 0.34, 0.22], 0.5), ...[1, -1].map((s) => regionMask([0.36, 0.03, 0.25 * s], [0.08, 0.05, 0.12], 0.3)), ...[1, -1].map((s) => regionMask([0.17, 0.0, 0.225 * s], [0.25, 0.05, 0.13], 0.2))]),
        detailAmp: 0.0045,
      }),
    },
    {
      name: 'head',
      pivot: [0.06, 1.45, 0],
      res: 176,
      part: () => {
        // The head sits forward and low on the neck.
        const H = (x: number, y: number, z: number): Vec => [x + 0.05, y - 0.05, z];
        const eyeAt = (s: 1 | -1) => H(0.23, 1.662, 0.092 * s);
        const eyes = [eye(eyeAt(1), 0.015, [0.45, 0.1, 1], -0.2, 0.7), eye(eyeAt(-1), 0.015, [0.45, 0.1, -1], -0.2, 0.7)];
        const fur = combed(0.15, 0, 0.003, 0.026);
        return {
          blend: 0.045,
          prims: [
            // A broad skull and furred cheeks, and a face that tapers like a wedge to the nose.
            ell(H(0.1, 1.62, 0), [0.16, 0.14, 0.17]),
            ...pairZ((s) => [ell(H(0.08, 1.55, 0.13 * s), [0.12, 0.13, 0.1])]),
            // The forehead rises from the muzzle (the stop), over the eyes.
            ell(H(0.13, 1.7, 0), [0.13, 0.08, 0.15]),
            cone(H(0.17, 1.64, 0), H(0.33, 1.59, 0), 0.135, 0.078),
            ...pairZ((s) => [withK(ell(H(0.225, 1.686, 0.08 * s), [0.05, 0.02, 0.034], [0, 0, -0.25]), 0.02)]),
            withK(ell(H(0.348, 1.592, 0), [0.04, 0.042, 0.058]), 0.015),
            cone(H(0.12, 1.53, 0), H(0.31, 1.542, 0), 0.09, 0.052),
            // Rounded ears, set wide on the back of the head, half sunk in the fur.
            ...pairZ((s) => [withK(ell(H(0.0, 1.745, 0.14 * s), [0.036, 0.05, 0.04], [0.4 * s, 0, 0]), 0.06)]),
          ],
          // Fur only on the back of the head and the cheeks; the face is smooth.
          detail: without(fur, [regionMask(H(0.3, 1.6, 0), [0.22, 0.16, 0.12], 0.5)]),
          detailAmp: 0.003,
          carve: [
            ...pairZ((s) => [withK(ell(H(0.386, 1.598, 0.025 * s), [0.011, 0.012, 0.012]), 0.008)]),
            withK(blade(H(0.23, 1.55, 0), H(0.365, 1.558, 0), 0.1, 0.006), 0.007),
            ...eyes.flatMap((e) => e.carve),
          ],
          after: eyes.flatMap((e) => e.after),
        };
      },
    },
    {name: 'armL', pivot: [0.06, 1.28, 0.3], res: 150, part: () => bearArm(1)},
    {name: 'armR', pivot: [0.06, 1.28, -0.3], res: 150, part: () => bearArm(-1)},
  ],
};

// ─── The whale (gold): a humpback, with its long flippers, throat pleats and flukes ──────

/** A long flipper along a curve of [x, y, z, half width] points, scalloped on its leading edge. */
const flipper = (s: 1 | -1, pts: [number, number, number, number][]): Bounded[] => {
  const out: Bounded[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a: Vec = [pts[i][0], pts[i][1], pts[i][2] * s];
    const b: Vec = [pts[i + 1][0], pts[i + 1][1], pts[i + 1][2] * s];
    out.push(withK(feather(a, b, pts[i][3], pts[i + 1][3], 0.022, [0.15, 1, 0.3 * s]), 0.05));
    // Gentle bumps along the leading edge (towards +x).
    const p = lerpV(a, b, 0.5);
    out.push(withK(ell([p[0] + pts[i][3] * 0.75, p[1] + 0.004, p[2]], [0.02, 0.016, 0.03]), 0.03));
  }
  return out;
};

export const WHALE: FigureDef = {
  id: 'whale',
  metal: 'gold',
  cavity: {reach: 0.09, strength: 1.4, floor: 0.34},
  joints: [
    {
      name: 'body',
      pivot: [0, 0, 0],
      res: 220,
      part: () => {
        const eyes = [eye([0.5, -0.07, 0.335], 0.02, [0.2, 0.1, 1]), eye([0.5, -0.07, -0.335], 0.02, [0.2, 0.1, -1])];
        // Knobs along the top of the head and the edge of the lower jaw.
        const knobs: Bounded[] = [];
        for (let i = 0; i < 8; i++) {
          const x = 0.66 + i * 0.07;
          const top = 0.255 * Math.sqrt(Math.max(0, 1 - ((x - 0.72) / 0.53) ** 2));
          if (i % 2 === 1) knobs.push(withK(ell([x, top - 0.01, 0.0], [0.018, 0.014, 0.018]), 0.022));
          if (i % 2 === 0) for (const s of [1, -1]) knobs.push(withK(ell([x + 0.02, top * 0.8 - 0.026, 0.09 * s * (1 - i / 14)], [0.016, 0.013, 0.016]), 0.022));
        }
        // Throat pleats: long grooves along the underside from the chin to the belly.
        const pleats = (x: number, y: number, z: number) => {
          if (y > -0.08 || x < -0.2) return 0;
          const along = Math.max(0, Math.min(1, (x + 0.2) / 0.25)) * Math.max(0, Math.min(1, (1.22 - x) / 0.15));
          const under = Math.max(0, Math.min(1, (-0.08 - y) / 0.06));
          const ang = Math.atan2(z, -y - 0.05);
          const g = Math.pow(0.5 + 0.5 * Math.cos(ang * 22), 6);
          return 0.009 * g * along * under;
        };
        return {
          blend: 0.1,
          prims: [
            // The head (flat on top), the long body tapering to the tail stock.
            ell([0.72, 0.0, 0], [0.53, 0.26, 0.33]),
            ell([0.18, 0.0, 0], [0.66, 0.37, 0.4]),
            cone([-0.3, 0.02, 0], [-1.05, 0.06, 0], 0.34, 0.1),
            withK(ell([-0.86, 0.06, 0], [0.28, 0.13, 0.055]), 0.08),
            // The lower jaw and the throat.
            ell([0.68, -0.13, 0], [0.55, 0.16, 0.31]),
            // The small dorsal fin on its hump.
            withK(ell([-0.5, 0.32, 0], [0.13, 0.06, 0.04]), 0.06),
            withK(cone([-0.5, 0.33, 0], [-0.62, 0.43, 0], 0.045, 0.01), 0.04),
            // The flippers: about a third of the body long.
            ...pairZ((s) =>
              flipper(s, [
                [0.46, -0.2, 0.3, 0.07],
                [0.36, -0.28, 0.52, 0.08],
                [0.24, -0.36, 0.74, 0.066],
                [0.13, -0.42, 0.93, 0.045],
                [0.05, -0.45, 1.06, 0.02],
              ]),
            ),
            ...knobs,
          ],
          detail: pleats,
          detailAmp: 0.009,
          carve: [
            // The long curving line of the mouth.
            ...[
              [1.24, -0.03, 1.0, -0.035],
              [1.0, -0.035, 0.76, -0.05],
              [0.76, -0.05, 0.55, -0.085],
            ].map(([x0, y0, x1, y1]) => withK(blade([x0, y0, 0], [x1, y1, 0], 0.5, 0.011), 0.014)),
            // The blowholes.
            ...pairZ((s) => [withK(ell([0.4, 0.33, 0.035 * s], [0.04, 0.02, 0.012], [0, 0.25 * s, 0]), 0.01)]),
            ...eyes.flatMap((e) => e.carve),
          ],
          after: eyes.flatMap((e) => e.after),
        };
      },
    },
    {
      name: 'tail',
      pivot: [-0.95, 0.06, 0],
      res: 170,
      part: () => ({
        blend: 0.05,
        prims: [
          cone([-0.95, 0.06, 0], [-1.3, 0.075, 0], 0.115, 0.055),
          withK(ell([-1.15, 0.07, 0], [0.22, 0.1, 0.04]), 0.06),
          // The flukes: swept back to fine tips, with a notch in the middle.
          ...pairZ((s) => [
            withK(blade([-1.3, 0.075, 0.02 * s], [-1.47, 0.08, 0.5 * s], 0.13, 0.026, [0, 1, 0]), 0.05),
            withK(blade([-1.36, 0.077, 0.12 * s], [-1.55, 0.085, 0.56 * s], 0.06, 0.016, [0, 1, 0]), 0.04),
          ]),
        ],
        carve: [
          withK(ell([-1.49, 0.075, 0], [0.06, 0.06, 0.03]), 0.02),
          // The scalloped trailing edge.
          ...pairZ((s) => [0.16, 0.27, 0.38, 0.48].map((zz) => withK(ell([-1.55 - zz * 0.25 + 0.06, 0.075, zz * s], [0.035, 0.05, 0.035]), 0.015))),
        ],
      }),
    },
  ],
};

// ─── The birds: one rig, two characters ─────────────────────────────────────────────────

type BirdShape = {
  /** The torso's half lengths. */
  body: Vec;
  head: Vec;
  headAt: Vec;
  /** The upper mandible as a capsule chain, and the lower one. */
  beak: [number, number, number, number][];
  lower: [number, number, number, number][];
  cere: Vec;
  eye: {at: Vec; r: number; out: Vec};
  /** A heavy brow over the eye (the hawk's frown); 0 for none. */
  brow: number;
  tail: {len: number; width: number; tip: number; count: number; spread: number};
  inner: {len: number; chord: number; feathers: number; featherLen: number};
  outer: {len: number; chord: number; feathers: number; featherLen: number; fan: [number, number]; width: number; tip: number};
  /** Legs and talons held under the body (the hawk), or none (the dove tucks them away). */
  talons: boolean;
};

const bird = (id: string, metal: Metal, b: BirdShape): FigureDef => {
  const wingZ0 = b.body[2] * 0.72;
  const elbowZ = wingZ0 + b.inner.len;
  const TH = 0.0085;
  const wing = (s: 1 | -1): Joint[] => [
    {
      name: s > 0 ? 'wingL' : 'wingR',
      pivot: [0.06, 0.045, wingZ0 * s],
      res: 150,
      part: () => {
        const n = b.inner.feathers;
        const span = b.inner.len / n;
        return {
          blend: 0.035,
          prims: [
            // The arm along the leading edge, the coverts over it, and two rows of feathers behind.
            withK(cone([0.07, 0.05, wingZ0 * s], [0.05, 0.055, elbowZ * s], 0.036, 0.022), 0.03),
            withK(blade([0.045, 0.05, wingZ0 * s], [0.035, 0.055, elbowZ * s], b.inner.chord * 0.42, 0.016), 0.03),
            ...Array.from({length: n}, (_, i) => {
              const z = wingZ0 + span * (i + 0.5);
              return withK(feather([0.02, 0.05, z * s], [-0.06, 0.047, (z + 0.004) * s], span * 0.72, span * 0.62, TH), 0.006);
            }),
            ...Array.from({length: n}, (_, i) => {
              const z = wingZ0 + span * (i + 0.5);
              const L = b.inner.featherLen * (1 - 0.1 * Math.abs(i / (n - 1) - 0.6));
              return withK(feather([-0.01, 0.042, z * s], [-0.01 - L, 0.034, (z + 0.01) * s], span * 0.66, span * 0.6, TH), 0.004);
            }),
          ],
        };
      },
    },
    {
      name: s > 0 ? 'tipL' : 'tipR',
      parent: s > 0 ? 'wingL' : 'wingR',
      pivot: [0.02, 0.045, elbowZ * s],
      res: 170,
      part: () => {
        const m = b.outer.feathers;
        const [a0, a1] = b.outer.fan;
        return {
          blend: 0.03,
          prims: [
            // The hand, its coverts, then the primaries fanned from the tip back to the secondaries.
            withK(cone([0.05, 0.055, elbowZ * s], [0.02, 0.055, (elbowZ + b.outer.len * 0.6) * s], 0.024, 0.014), 0.025),
            withK(blade([0.025, 0.053, elbowZ * s], [0.008, 0.055, (elbowZ + b.outer.len * 0.62) * s], b.outer.chord * 0.45, 0.013), 0.025),
            ...Array.from({length: m}, (_, i) => {
              const k = m === 1 ? 0.5 : i / (m - 1);
              const a = a0 + (a1 - a0) * k;
              const L = b.outer.featherLen * (1 - 0.28 * k);
              const root: Vec = [0.01 - 0.03 * k, 0.048 - 0.004 * k, (elbowZ + b.outer.len * (0.58 - 0.48 * k)) * s];
              const tip: Vec = [root[0] - Math.sin(a) * L, root[1] + 0.01 * (1 - k), root[2] + Math.cos(a) * L * s];
              return withK(feather(root, tip, b.outer.width, b.outer.tip * (0.8 + 0.4 * k), TH), 0.004);
            }),
          ],
        };
      },
    },
  ];
  const eyes = [eye(b.eye.at, b.eye.r, b.eye.out, -0.1, 0.45), eye(S(-1, b.eye.at), b.eye.r, S(-1, b.eye.out), -0.1, 0.45)];
  // Rows of small feathers over the body and head, flowing back to the tail.
  const plumage = shingles(0.0036, [0.04, 0.036], (x, y, z) => [-x, Math.atan2(z, y) * Math.hypot(z, y)], 2);
  const bare = [regionMask(add(b.cere, [0.04, -0.01, 0]), [0.09, 0.06, 0.06], 0.3), regionMask([0.13, -0.16, 0], [0.07, 0.06, 0.1], 0.3), regionMask([-b.body[0] - b.tail.len * 0.5, 0, 0], [b.tail.len * 0.62, 0.06, 0.2], 0.2), ...[1, -1].map((s) => regionMask(S(s as 1 | -1, b.eye.at), [b.eye.r * 1.6, b.eye.r * 1.6, b.eye.r * 1.6], 0.4))];
  const talons: Bounded[] = !b.talons
    ? []
    : pairZ((s) => {
        const foot: Vec = [0.15, -0.155, 0.045 * s];
        const toes = [-0.4, 0, 0.4].flatMap((ang) => {
          const d: Vec = [Math.cos(ang), 0, Math.sin(ang) * s];
          const p1 = add(foot, d, 0.045);
          const p2 = add(add(p1, d, 0.024), [0, -0.02, 0]);
          return allK(
            chain([
              [foot[0], foot[1], foot[2], 0.012],
              [p1[0], p1[1], p1[2], 0.0105],
              [p2[0], p2[1], p2[2], 0.003],
            ]),
            0.008,
          );
        });
        return [
          // Feathered thighs, bare legs, three toes forward and one back, each with a talon.
          withK(ell([0.04, -0.07, 0.048 * s], [0.07, 0.05, 0.038]), 0.03),
          withK(cone([0.07, -0.095, 0.046 * s], [0.15, -0.152, 0.045 * s], 0.017, 0.013), 0.015),
          ...toes,
          ...allK(
            chain([
              [foot[0], foot[1], foot[2], 0.011],
              [foot[0] - 0.038, foot[1] - 0.004, foot[2], 0.0095],
              [foot[0] - 0.056, foot[1] - 0.024, foot[2], 0.003],
            ]),
            0.008,
          ),
        ];
      });
  const tailFeathers = Array.from({length: b.tail.count}, (_, i) => {
    const k = b.tail.count === 1 ? 0 : i / (b.tail.count - 1) - 0.5;
    const ang = k * b.tail.spread;
    const root: Vec = [-b.body[0] * 0.8, 0.012, k * b.body[2] * 0.5];
    const L = b.tail.len * (1 - 0.06 * Math.abs(k));
    return withK(feather(root, [root[0] - Math.cos(ang) * L, 0.004 - 0.006 * Math.abs(k), root[2] + Math.sin(ang) * L], b.tail.width, b.tail.tip, TH), 0.004);
  });
  return {
    id,
    metal,
    cavity: {reach: 0.035, strength: 1.6, floor: 0.32},
    joints: [
      {
        name: 'body',
        pivot: [0, 0, 0],
        res: 190,
        part: () => ({
          blend: 0.045,
          prims: [
            // The keel of the breast, the back, the belly, the neck and the head.
            ell([b.body[0] * 0.3, -0.015, 0], [b.body[0] * 0.68, b.body[1], b.body[2]]),
            ell([-b.body[0] * 0.2, 0.015, 0], [b.body[0] * 0.85, b.body[1] * 0.8, b.body[2] * 0.88], [0, 0, 0.05]),
            ell([b.body[0] * 0.05, -b.body[1] * 0.35, 0], [b.body[0] * 0.6, b.body[1] * 0.72, b.body[2] * 0.8]),
            // The shoulders, where the wings join, high on the back.
            ...pairZ((s) => [withK(ell([0.07, 0.04, wingZ0 * 0.85 * s], [0.09, 0.045, 0.045]), 0.04)]),
            cone([b.body[0] * 0.5, 0.02, 0], b.headAt, b.body[2] * 0.75, b.head[2] * 0.92),
            ell(b.headAt, b.head),
            ...(b.brow > 0
              ? pairZ((s) => [withK(ell(add(S(s, b.eye.at), [0.006, b.eye.r * 1.15, -0.005 * s]), [b.eye.r * 2.6, b.eye.r * 0.75 * b.brow, b.eye.r * 1.45], [0, 0, -0.22]), 0.012)])
              : []),
            withK(ell(b.cere, [0.028, 0.03, 0.036]), 0.012),
            ...allK(chain(b.beak), 0.01),
            ...allK(chain(b.lower), 0.008),
            // The upper tail coverts, then the tail fanned out.
            withK(ell([-b.body[0] * 0.92, 0.022, 0], [b.tail.len * 0.38, 0.026, b.tail.width * 2.4]), 0.03),
            ...tailFeathers,
            ...talons,
          ],
          detail: without(plumage, bare),
          detailAmp: 0.0036,
          carve: [
            withK(blade([b.cere[0] - 0.01, (b.beak[0][1] + b.lower[0][1]) / 2, 0], [b.beak[b.beak.length - 2][0], (b.beak[0][1] + b.lower[0][1]) / 2 - 0.012, 0], 0.06, 0.0035), 0.005),
            ...pairZ((s) => [withK(ell([b.cere[0] + 0.012, b.cere[1] + 0.006, 0.017 * s], [0.008, 0.005, 0.005]), 0.004)]),
            ...eyes.flatMap((e) => e.carve),
          ],
          after: eyes.flatMap((e) => e.after),
        }),
      },
      ...wing(1),
      ...wing(-1),
    ],
  };
};

/** The hawk (silver): sleek and long-winged, a heavy brow, a hooked beak, talons ready. */
export const HAWK: FigureDef = bird('hawk', 'silver', {
  body: [0.3, 0.105, 0.1],
  head: [0.092, 0.075, 0.072],
  headAt: [0.31, 0.06, 0],
  beak: [
    [0.38, 0.072, 0, 0.03],
    [0.42, 0.066, 0, 0.024],
    [0.45, 0.05, 0, 0.017],
    [0.462, 0.028, 0, 0.0095],
    [0.456, 0.008, 0, 0.0035],
  ],
  lower: [
    [0.375, 0.042, 0, 0.02],
    [0.425, 0.033, 0, 0.01],
  ],
  cere: [0.37, 0.076, 0],
  eye: {at: [0.343, 0.08, 0.054], r: 0.016, out: [0.5, 0.05, 1]},
  brow: 1,
  tail: {len: 0.27, width: 0.026, tip: 0.03, count: 9, spread: 0.5},
  inner: {len: 0.32, chord: 0.15, feathers: 10, featherLen: 0.15},
  outer: {len: 0.34, chord: 0.11, feathers: 7, featherLen: 0.27, fan: [0.14, 1.3], width: 0.022, tip: 0.022},
  talons: true,
});

/** The dove (gold): a full breast, a small round head, a short beak, broad rounded wings. */
export const DOVE: FigureDef = bird('dove', 'gold', {
  body: [0.25, 0.13, 0.115],
  head: [0.07, 0.066, 0.061],
  headAt: [0.275, 0.09, 0],
  beak: [
    [0.335, 0.088, 0, 0.017],
    [0.365, 0.082, 0, 0.0105],
    [0.385, 0.076, 0, 0.004],
  ],
  lower: [
    [0.335, 0.074, 0, 0.012],
    [0.365, 0.071, 0, 0.0055],
  ],
  cere: [0.33, 0.093, 0],
  eye: {at: [0.297, 0.102, 0.049], r: 0.013, out: [0.3, 0.1, 1]},
  brow: 0,
  tail: {len: 0.23, width: 0.028, tip: 0.036, count: 11, spread: 0.66},
  inner: {len: 0.26, chord: 0.15, feathers: 9, featherLen: 0.14},
  outer: {len: 0.29, chord: 0.12, feathers: 8, featherLen: 0.2, fan: [0.25, 1.25], width: 0.024, tip: 0.032},
  talons: false,
});

export const ANIMAL_FIGURES: FigureDef[] = [BULL, BEAR, WHALE, HAWK, DOVE];
