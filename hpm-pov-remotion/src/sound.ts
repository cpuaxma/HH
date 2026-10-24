// The sound design as data: which effect plays when, and how loud. Effects are synthesised
// by scripts/make-sfx.py (original and generic: no real phone or OS sounds).
// Pings rise in pitch and thin out as the cadence speeds up, so the build reads like a beat.
import {MAIN_RUN, OPEN_RUN} from './notifications';
import {CUE, SCENES} from './timeline';
import {FPS} from './theme';

export type Sfx = 'ping-a' | 'ping-b' | 'ping-c' | 'whoosh' | 'rewind' | 'thump' | 'rumble' | 'clear' | 'flood';

// Length of each file in seconds (see make-sfx.py).
const LENGTH: Record<Sfx, number> = {
  'ping-a': 0.45,
  'ping-b': 0.45,
  'ping-c': 0.45,
  whoosh: 0.55,
  rewind: 0.8,
  thump: 0.35,
  rumble: 1.92,
  clear: 0.6,
  flood: 1.2,
};

export type SoundCue = {
  at: number;
  sfx: Sfx;
  volume: number;
  duration: number; // frames
  loop?: boolean;
  fadeIn?: number; // frames
  fadeOut?: number; // frames, at the end of `duration`
};

const cue = (at: number, sfx: Sfx, volume: number, until?: number): SoundCue => {
  const natural = Math.ceil(LENGTH[sfx] * FPS);
  const duration = until === undefined ? natural : Math.max(1, Math.min(natural, until - at));
  // Anything cut short (by the freeze) fades over its last frames instead of clicking.
  return {at, sfx, volume, duration, fadeOut: duration < natural ? Math.min(4, duration) : 0};
};

const every = <T,>(list: T[], n: number) => list.filter((_, i) => i % n === 0);

const openPings = every(OPEN_RUN.list.filter((x) => x.frame >= 0 && x.frame < CUE.rewind), 2).map((x) => cue(x.frame, 'ping-c', 0.5));

const main = MAIN_RUN.list;
const week1 = main.filter((x) => x.frame < SCENES.week4.from).map((x) => cue(x.frame, 'ping-a', 0.85));
const week4 = main.filter((x) => x.frame >= SCENES.week4.from && x.frame < SCENES.month3.from).map((x) => cue(x.frame, 'ping-b', 0.75));
const month3 = every(main.filter((x) => x.frame >= SCENES.month3.from && x.frame < CUE.heat), 2).map((x) => cue(x.frame, 'ping-c', 0.5));
const overheat = every(main.filter((x) => x.frame >= CUE.heat), 2).map((x) => cue(x.frame, 'ping-c', 0.35, CUE.freeze));

export const SOUND_CUES: SoundCue[] = [
  ...openPings,
  cue(CUE.rewind, 'rewind', 1),
  cue(CUE.momIn, 'ping-a', 0.95), // one lonely ping
  cue(CUE.pepperDrop + 14, 'thump', 1), // the pepper lands
  cue(CUE.pepperDock, 'whoosh', 0.5),
  ...CUE.jumps.filter((j) => !j.reverse).map((j) => cue(j.at, 'whoosh', 0.7)),
  ...week1,
  ...week4,
  ...month3,
  ...overheat,
  // The heat builds under the overheat and cuts dead on the freeze: real silence.
  {at: CUE.shakeRamp[0], sfx: 'rumble', volume: 0.75, duration: CUE.freeze - CUE.shakeRamp[0], loop: true, fadeIn: 120, fadeOut: 2},
  cue(CUE.alert, 'thump', 0.8),
  cue(CUE.clearAll, 'clear', 1),
  cue(CUE.flood, 'flood', 1),
  cue(CUE.logo, 'thump', 0.6),
  cue(CUE.ctaCard, 'ping-a', 0.9), // the last notification: "your free call is one message away"
];
