import type {Key} from './characters/rig';
import type {Look, RayExpression, RayPose} from './characters/Ray';
import type {PhoneMode, SamExpression, SamPose} from './characters/Sam';
import {EVENTS} from './data/price';

// Scene ranges (absolute frames). Overlaps are intentional.
export const SCENES = {
  hook: [0, 300],
  entry: [290, 900],
  drop: [890, 1620],
  panic: [1610, 2280],
  turn: [2270, 3000],
  result: [2990, 3450],
  cta: [3440, 3600],
} as const;

export type SceneKey = keyof typeof SCENES;
export const range = ([from, to]: readonly [number, number]) => ({from, durationInFrames: to - from});

// Key beats
export const BEAT = {
  turnToScreens: 60,
  slamImpact: 430,
  insert: [640, 820] as const,
  jab: 1064,
  cuts: [1620, 1780, 1940, 2100] as const,
  flare: 3170,
  logo: 3190,
  disclaimer: 3000,
  slHit: EVENTS.trade1.slHit,
  tpHit: EVENTS.trade2.tpHit,
};

// Speech bubble windows (pop → exit). Characters talk for the same frames.
export const BUBBLES = {
  ray2: [320, 535],
  sam2: [470, 632],
  ray3: [960, 1235],
  sam3: [1250, 1480],
  ray4: [1700, 1960],
  ray5: [2440, 2640],
} as const;

const k = <T>(at: number, v: T): Key<T> => ({at, v});

export const RAY = {
  expression: [
    k<RayExpression>(0, 'neutral'), k(60, 'excited'), k(520, 'panic'), k(930, 'confused'), k(1100, 'panic'),
    k(1620, 'despair'), k(1780, 'panic'), k(1940, 'panic'), k(2100, 'despair'), k(2282, 'shocked'), k(2990, 'despair'),
  ] as Key<RayExpression>[],
  pose: [
    k<RayPose>(0, 'idle'), k(411, 'slam'), k(520, 'idle'), k(1058, 'double-down'), k(1180, 'idle'),
    k(1620, 'hair-pull'), k(1780, 'phone-juggle'), k(1940, 'hair-pull'), k(2100, 'phone-juggle'), k(2272, 'frozen'),
  ] as Key<RayPose>[],
  look: [k<Look>(0, 'down'), k(BEAT.turnToScreens, 'screen'), k(1620, 'down'), k(2272, 'screen')] as Key<Look>[],
  intensity: [
    k(0, 0), k(300, 1), k(432, 3), k(520, 2), k(930, 3), k(1060, 4), k(1620, 2), k(1780, 3), k(1940, 4), k(2100, 6),
    k(2272, 0),
  ],
  clutter: [k(0, 0), k(1780, 1), k(1940, 2), k(2100, 3)],
  talking: [BUBBLES.ray2, BUBBLES.ray3, BUBBLES.ray4, BUBBLES.ray5] as unknown as Array<[number, number]>,
};

export const SAM = {
  expression: [
    k<SamExpression>(0, 'neutral'), k(60, 'focused'), k(470, 'neutral'), k(700, 'focused'), k(900, 'calm'),
    k(BEAT.tpHit, 'smile'),
  ] as Key<SamExpression>[],
  pose: [
    k<SamPose>(0, 'idle'), k(300, 'read-phone'), k(380, 'copy-trade'), k(530, 'idle'), k(1000, 'write-notes'),
    k(1200, 'idle'), k(1625, 'wait'), k(2286, 'read-phone'), k(2310, 'copy-trade'), k(2420, 'idle'),
  ] as Key<SamPose>[],
  look: [
    k<Look>(0, 'down'), k(BEAT.turnToScreens, 'screen'), k(300, 'down'), k(412, 'screen'), k(1000, 'down'),
    k(1200, 'screen'), k(2286, 'down'), k(2350, 'screen'),
  ] as Key<Look>[],
  talking: [BUBBLES.sam2, BUBBLES.sam3] as unknown as Array<[number, number]>,
  phoneMode: [k<PhoneMode>(0, 'feed'), k(330, 'post'), k(1600, 'waiting'), k(2286, 'post'), k(2500, 'feed')] as Key<PhoneMode>[],
};
