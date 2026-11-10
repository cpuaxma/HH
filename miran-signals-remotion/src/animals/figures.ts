// The five market animals, sculpted in code from primitives (ellipsoids and tapered capsules
// joined with smooth unions, see sdf.ts). Original, stylised designs made for this reel: no
// model, photo or existing design was copied or traced. Each animal is a small rig: a body
// plus jointed parts (head, horns, arms, tail, wings) that the story poses frame by frame.
//
// Local axes for every animal: it faces +x, y is up, z is its left side; the floor is y = 0
// (the birds and the whale are centred on their own origin instead).
import {Part, Vec, chain, cone, ell, pairZ} from './sdf';

export type Metal = 'gold' | 'silver';

export type Joint = {
  name: string;
  /** Where the part turns, in the animal's local coordinates (or the parent joint's frame). */
  pivot: Vec;
  parent?: string;
  part: () => Part;
  /** Marching-cubes cells along the part's longest side. */
  res?: number;
};

export type Eye = {joint: string; at: Vec; r: number};

export type FigureDef = {id: string; metal: Metal; joints: Joint[]; eyes: Eye[]};

const S = (s: 1 | -1, v: Vec): Vec => [v[0], v[1], v[2] * s];

// ─── The bull (gold): a heavy, low-slung body, the head lowered, horns that sweep up ─────

export const BULL: FigureDef = {
  id: 'bull',
  metal: 'gold',
  joints: [
    {
      name: 'body',
      pivot: [0, 0, 0],
      res: 112,
      part: () => ({
        blend: 0.08,
        prims: [
          ell([0, 0.72, 0], [0.55, 0.29, 0.26]),
          ell([0.3, 0.84, 0], [0.34, 0.34, 0.29], [0, 0, -0.2]),
          ell([-0.38, 0.75, 0], [0.27, 0.27, 0.25]),
          ell([0.06, 0.57, 0], [0.42, 0.19, 0.23]),
          // Dewlap under the neck.
          ell([0.52, 0.62, 0], [0.16, 0.16, 0.13]),
          cone([0.44, 0.88, 0], [0.64, 0.8, 0], 0.24, 0.17),
          ...pairZ((s) => [
            ...chain([
              [0.36, 0.64, 0.14 * s, 0.12],
              [0.4, 0.32, 0.15 * s, 0.072],
              [0.38, 0.08, 0.15 * s, 0.064],
            ]),
            ell([0.4, 0.04, 0.15 * s], [0.085, 0.045, 0.07]),
            ...chain([
              [-0.42, 0.66, 0.14 * s, 0.14],
              [-0.5, 0.34, 0.14 * s, 0.078],
              [-0.45, 0.08, 0.14 * s, 0.064],
            ]),
            ell([-0.43, 0.04, 0.14 * s], [0.085, 0.045, 0.07]),
          ]),
          // Tail with a tuft.
          ...chain([
            [-0.62, 0.88, 0, 0.04],
            [-0.71, 0.62, 0, 0.026],
            [-0.7, 0.38, 0, 0.022],
          ]),
          ell([-0.7, 0.33, 0], [0.045, 0.075, 0.045]),
        ],
      }),
    },
    {
      name: 'head',
      pivot: [0.62, 0.82, 0],
      res: 96,
      part: () => ({
        blend: 0.05,
        prims: [
          ell([0.8, 0.77, 0], [0.2, 0.16, 0.15], [0, 0, -0.55]),
          ell([0.92, 0.62, 0], [0.12, 0.12, 0.13]),
          ell([0.76, 0.9, 0], [0.12, 0.08, 0.15]),
          ...pairZ((s) => [
            ell([0.72, 0.9, 0.19 * s], [0.08, 0.035, 0.055], S(s, [0.4, 0, 0.2])),
            // Horns: out from the poll, then up and forward to fine points.
            ...chain([
              [0.76, 0.95, 0.1 * s, 0.058],
              [0.77, 1.0, 0.25 * s, 0.047],
              [0.83, 1.09, 0.36 * s, 0.036],
              [0.93, 1.22, 0.4 * s, 0.022],
              [0.99, 1.33, 0.37 * s, 0.008],
            ]),
          ]),
        ],
        carve: pairZ((s) => [ell([1.02, 0.6, 0.06 * s], [0.025, 0.03, 0.02])]),
      }),
    },
  ],
  eyes: [
    {joint: 'head', at: [0.86, 0.83, 0.125], r: 0.022},
    {joint: 'head', at: [0.86, 0.83, -0.125], r: 0.022},
  ],
};

// ─── The bear (silver): standing on its hind legs, one paw raised to swipe down ──────────

const bearArm = (s: 1 | -1): Part => ({
  blend: 0.05,
  prims: [
    ...chain([
      [0.06, 1.28, 0.3 * s, 0.125],
      [0.17, 1.03, 0.36 * s, 0.1],
      [0.27, 0.84, 0.37 * s, 0.09],
    ]),
    ell([0.31, 0.77, 0.37 * s], [0.11, 0.09, 0.1]),
    // Claws.
    ...[-0.06, -0.02, 0.02, 0.06].flatMap((dz) =>
      chain([
        [0.38, 0.74, 0.37 * s + dz, 0.022],
        [0.44, 0.69, 0.37 * s + dz * 1.15, 0.013],
        [0.46, 0.63, 0.37 * s + dz * 1.2, 0.004],
      ]),
    ),
  ],
});

export const BEAR: FigureDef = {
  id: 'bear',
  metal: 'silver',
  joints: [
    {
      name: 'body',
      pivot: [0, 0, 0],
      res: 112,
      part: () => ({
        blend: 0.09,
        prims: [
          ell([0, 0.56, 0], [0.34, 0.34, 0.37]),
          ell([0.03, 0.98, 0], [0.3, 0.45, 0.34], [0, 0, -0.08]),
          ell([0.12, 1.08, 0], [0.22, 0.3, 0.29]),
          ell([-0.03, 1.3, 0], [0.24, 0.18, 0.33]),
          cone([0.04, 1.33, 0], [0.08, 1.47, 0], 0.19, 0.15),
          ell([-0.33, 0.5, 0], [0.07, 0.07, 0.07]),
          ...pairZ((s) => [
            ...chain([
              [0.02, 0.48, 0.2 * s, 0.17],
              [0.08, 0.22, 0.22 * s, 0.13],
              [0.1, 0.08, 0.22 * s, 0.11],
            ]),
            ell([0.18, 0.055, 0.22 * s], [0.17, 0.055, 0.11]),
          ]),
        ],
      }),
    },
    {
      name: 'head',
      pivot: [0.06, 1.45, 0],
      res: 88,
      part: () => ({
        blend: 0.05,
        prims: [
          ell([0.1, 1.6, 0], [0.2, 0.19, 0.19]),
          ell([0.3, 1.55, 0], [0.14, 0.09, 0.105]),
          ell([0.42, 1.57, 0], [0.04, 0.035, 0.05]),
          ...pairZ((s) => [ell([0.01, 1.77, 0.14 * s], [0.045, 0.07, 0.06])]),
        ],
        carve: pairZ((s) => [ell([0.04, 1.78, 0.16 * s], [0.02, 0.04, 0.03])]),
      }),
    },
    {name: 'armL', pivot: [0.06, 1.28, 0.3], res: 80, part: () => bearArm(1)},
    {name: 'armR', pivot: [0.06, 1.28, -0.3], res: 80, part: () => bearArm(-1)},
  ],
  eyes: [
    {joint: 'head', at: [0.25, 1.65, 0.095], r: 0.02},
    {joint: 'head', at: [0.25, 1.65, -0.095], r: 0.02},
  ],
};

// ─── The whale (gold): a big rounded head, throat grooves and wide flukes ────────────────

export const WHALE: FigureDef = {
  id: 'whale',
  metal: 'gold',
  joints: [
    {
      name: 'body',
      pivot: [0, 0, 0],
      res: 128,
      part: () => ({
        blend: 0.14,
        prims: [
          ell([0.62, 0.03, 0], [0.58, 0.36, 0.38]),
          ell([-0.02, 0, 0], [0.8, 0.4, 0.42]),
          ell([0.7, -0.15, 0], [0.52, 0.2, 0.33]),
          cone([-0.45, 0.03, 0], [-1.02, 0.07, 0], 0.33, 0.1),
          cone([-0.38, 0.33, 0], [-0.58, 0.45, 0], 0.07, 0.012),
          ...pairZ((s) => [ell([0.42, -0.3, 0.42 * s], [0.3, 0.035, 0.13], S(s, [-0.5, 0.45, 0]))]),
        ],
        // Throat grooves.
        carve: [-0.18, -0.09, 0, 0.09, 0.18].map((z) => ell([0.62, -0.33 + Math.abs(z) * 0.4, z], [0.42, 0.018, 0.016], [Math.sign(z) * 0.35 * Math.min(1, Math.abs(z) * 6), 0, 0])),
      }),
    },
    {
      name: 'tail',
      pivot: [-0.95, 0.06, 0],
      res: 88,
      part: () => ({
        blend: 0.06,
        prims: [
          cone([-0.95, 0.06, 0], [-1.3, 0.08, 0], 0.12, 0.06),
          ...pairZ((s) => [ell([-1.42, 0.08, 0.25 * s], [0.17, 0.03, 0.29], S(s, [0, 0.55, 0]))]),
        ],
      }),
    },
  ],
  eyes: [
    {joint: 'body', at: [0.92, -0.02, 0.31], r: 0.026},
    {joint: 'body', at: [0.92, -0.02, -0.31], r: 0.026},
  ],
};

// ─── The birds: one rig, two characters ─────────────────────────────────────────────────

type BirdShape = {
  body: Vec;
  head: Vec;
  headAt: Vec;
  beak: [number, number, number, number][];
  tail: {len: number; width: number; fingers: number};
  inner: {len: number; chord: number};
  outer: {len: number; chord: number; fingers: number; fingerLen: number};
};

const bird = (id: string, metal: Metal, b: BirdShape): FigureDef => {
  const wingZ0 = b.body[2] * 0.7;
  const elbowZ = wingZ0 + b.inner.len;
  const wing = (s: 1 | -1): Joint[] => [
    {
      name: s > 0 ? 'wingL' : 'wingR',
      pivot: [0.06, 0.04, wingZ0 * s],
      res: 72,
      part: () => ({
        blend: 0.05,
        prims: [
          ell([0.03, 0.04, (wingZ0 + b.inner.len * 0.5) * s], [b.inner.chord, 0.03, b.inner.len * 0.58]),
          ell([0.08, 0.05, (wingZ0 + b.inner.len * 0.35) * s], [b.inner.chord * 0.6, 0.045, b.inner.len * 0.4]),
        ],
      }),
    },
    {
      name: s > 0 ? 'tipL' : 'tipR',
      parent: s > 0 ? 'wingL' : 'wingR',
      pivot: [0.02, 0.04, elbowZ * s],
      res: 80,
      part: () => ({
        blend: 0.04,
        prims: [
          ell([0.0, 0.04, (elbowZ + b.outer.len * 0.45) * s], [b.outer.chord, 0.024, b.outer.len * 0.55]),
          // The primaries: fanned "fingers" at the wing tip.
          ...Array.from({length: b.outer.fingers}, (_, i) => {
            const k = b.outer.fingers === 1 ? 0.5 : i / (b.outer.fingers - 1);
            // From the leading finger (pointing out and a little forward) to the trailing one (swept back).
            const a = 0.25 - 0.95 * k;
            const L = b.outer.fingerLen;
            const x0 = b.outer.chord * (0.45 - 0.9 * k);
            const z0 = elbowZ + b.outer.len * 0.72;
            return ell([x0 + Math.sin(a) * L * 0.5, 0.04, (z0 + Math.cos(a) * L * 0.5) * s], [0.034, 0.012, L * 0.55], [0, a * s, 0]);
          }),
        ],
      }),
    },
  ];
  return {
    id,
    metal,
    joints: [
      {
        name: 'body',
        pivot: [0, 0, 0],
        res: 96,
        part: () => ({
          blend: 0.07,
          prims: [
            ell([0, 0, 0], b.body, [0, 0, 0.12]),
            ell([b.body[0] * 0.4, -0.02, 0], [b.body[0] * 0.55, b.body[1] * 1.05, b.body[2] * 1.0]),
            ell(b.headAt, b.head),
            ...chain(b.beak),
            // Tail: a fan of feathers.
            ...Array.from({length: b.tail.fingers}, (_, i) => {
              const k = b.tail.fingers === 1 ? 0 : i / (b.tail.fingers - 1) - 0.5;
              const ang = k * 0.7;
              const L = b.tail.len;
              return ell([-b.body[0] - L * 0.45, 0.01, Math.sin(ang) * L * 0.5], [L * 0.55, 0.018, b.tail.width], [0, ang, 0]);
            }),
          ],
        }),
      },
      ...wing(1),
      ...wing(-1),
    ],
    eyes: [
      {joint: 'body', at: [b.headAt[0] + b.head[0] * 0.45, b.headAt[1] + b.head[1] * 0.25, b.head[2] * 0.82], r: 0.017},
      {joint: 'body', at: [b.headAt[0] + b.head[0] * 0.45, b.headAt[1] + b.head[1] * 0.25, -b.head[2] * 0.82], r: 0.017},
    ],
  };
};

/** The hawk (silver): a sleek, long-winged hunter with a hooked beak and fingered wing tips. */
export const HAWK: FigureDef = bird('hawk', 'silver', {
  body: [0.3, 0.115, 0.125],
  head: [0.1, 0.088, 0.083],
  headAt: [0.31, 0.065, 0],
  beak: [
    [0.39, 0.075, 0, 0.042],
    [0.46, 0.06, 0, 0.026],
    [0.495, 0.02, 0, 0.012],
    [0.49, -0.01, 0, 0.004],
  ],
  tail: {len: 0.26, width: 0.055, fingers: 5},
  inner: {len: 0.32, chord: 0.15},
  outer: {len: 0.36, chord: 0.12, fingers: 5, fingerLen: 0.17},
});

/** The dove (gold): a plump, rounded body, a small round head and soft rounded wings. */
export const DOVE: FigureDef = bird('dove', 'gold', {
  body: [0.25, 0.14, 0.14],
  head: [0.09, 0.085, 0.08],
  headAt: [0.27, 0.1, 0],
  beak: [
    [0.34, 0.095, 0, 0.026],
    [0.39, 0.085, 0, 0.012],
    [0.41, 0.08, 0, 0.004],
  ],
  tail: {len: 0.22, width: 0.07, fingers: 3},
  inner: {len: 0.26, chord: 0.15},
  outer: {len: 0.3, chord: 0.13, fingers: 3, fingerLen: 0.12},
});
