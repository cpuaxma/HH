// The approved shot list as frame numbers (60fps, 1 beat = 30f). Scenes overlap by 10–12 frames.
import type {LaneKey} from './brand';

export const SCENES = {
  hook: [0, 190],
  context: [178, 492], // S1a rate gauge + S1b odds
  core: [480, 700], // S2a cost of money + S2b three reactions
  nasdaq: [680, 1120], // S3 chapter 01
  spx: [1100, 1480], // S4 chapter 02
  gold: [1460, 1900], // S5 chapter 03
  twist: [1880, 2172], // S6
  recap: [2150, 2352], // S7
  tease: [2340, 2472], // S8
  outro: [2450, 2640], // S9
} as const;

export const HIT = {
  nodeSlam: 30,
  hookPulse: 60,
  laneSnap: [75, 90, 105],
  nodeToTop: 170,
  gaugeIn: 180,
  needleStart: 210,
  needleLand: 240,
  cardFlip: 330,
  oddsFillStart: 360,
  oddsLand: 420,
  coinIn: 480,
  tagSteps: [510, 540, 570],
  corePulse: 600,
  coreImpact: {nasdaq: 630, spx: 645, gold: 660} as Record<LaneKey, number>,
  dive1: 690,
  ch1Pulse: 708, // leaves the node as the dive settles; reaches the docked Nasdaq rail on the 720 beat
  ch1Impact: 720,
  numeral1: 720,
  coinsIn: 840,
  discount: 960,
  dive2: 1100,
  numeral2: 1110,
  tilesIn: 1170,
  ch2Pulse: 1260,
  tilesRed: 1290,
  tilesGreen: 1320,
  netArrow: 1350,
  goldMorph: 1460,
  numeral3: 1470,
  scaleIn: 1500,
  ch3Pulse: 1590,
  bondDrop: 1620,
  dxyRise: 1650,
  chartIn: 1740,
  chartDraw: [1760, 1860],
  chartLand: 1860,
  glitch: 1880,
  expectCard: 1950,
  flip: {nasdaq: 2010, spx: 2040, gold: 2070} as Record<LaneKey, number>,
  flipBack: 2160,
  recapRows: [2190, 2205, 2220],
  flapStart: 2340,
  flapLand: 2400,
  teasePulse: 2400,
  outroIn: 2460,
  logoLock: 2520,
  outroLine2: 2550,
  outroSmall: 2580,
} as const;

/** Chapter windows (used by the bloom tint and the docked lane header). */
export const CHAPTER: {from: number; to: number; lane: LaneKey}[] = [
  {from: SCENES.nasdaq[0], to: SCENES.nasdaq[1], lane: 'nasdaq'},
  {from: SCENES.spx[0], to: SCENES.spx[1], lane: 'spx'},
  {from: SCENES.gold[0], to: SCENES.gold[1], lane: 'gold'},
];
