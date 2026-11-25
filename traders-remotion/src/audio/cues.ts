// The sound design as data. Every cue is derived from the same plan as the visuals
// (trap windows, death frames, hit frames), so reordering the traps moves the sounds too.
import {BEATS, SCENES} from '../config';
import {PLAN} from '../arena/plan';
import {CHAIN_FIRST} from '../arena/mechanisms/chain';

export type Cue = {at: number; file: string; volume: number; note: string};

export const getCues = (): Cue[] => {
  const cues: Cue[] = [];
  const add = (at: number, file: string, volume: number, note: string) => cues.push({at: Math.max(0, Math.round(at)), file, volume, note});

  add(2, 'ripple', 0.9, 'Hook: the arena lights up in a gold ripple');
  add(SCENES.setup[0] - 2, 'whoosh', 0.5, 'Transition hook → setup');
  add(BEATS.counterSlam, 'hit', 1, 'Counter «١٠٠» slams in');

  PLAN.traps.forEach((t) => {
    const d = t.prepared.data as Record<string, number[] | number>;
    add(t.start - 4, 'whoosh', 0.45, `Transition into trap ${t.k + 1} (${t.def.mechanism})`);
    switch (t.def.mechanism) {
      case 'crack':
        (d.crack as number[]).forEach((c, j) => j % 3 === 0 && add(t.start + c, 'crack', 0.75 - j * 0.02, `Tiles crack (victim ${j + 1})`));
        break;
      case 'lever':
        add(t.start + 6, 'lever', 0.85, 'The plank starts to rock on its fulcrum');
        add(t.start + (d.snap as number), 'crack', 0.9, 'The plank snaps');
        break;
      case 'chain':
        add(t.start + CHAIN_FIRST - 2, 'chain', 0.9, 'Red chain reaction leaps pillar to pillar');
        break;
      case 'fomo':
        add(t.start + 18, 'rush', 0.85, 'The herd rushes toward the peak');
        break;
      case 'rumor':
        add(t.start + 8, 'whisper', 0.9, 'Whisper ripple spreads «سمعتُ أن...»');
        break;
      default:
        break;
    }
    add(t.hit, 'hit', 1, `Counter drops to the trap ${t.k + 1} total`);
  });

  add(SCENES.reveal[0] + 4, 'whoosh', 0.55, 'Camera pulls high for the reveal');
  add(BEATS.riseStart, 'rise', 0.9, 'Survivors rise into the light');
  add(BEATS.arrowFly - 2, 'whoosh', 0.5, 'Survivors fly together');
  add(BEATS.arrowLock - 3, 'flare', 1, 'The arrow locks: gold flare');
  for (let at = BEATS.logoIn + 14, n = 0; at < 1190; at += BEATS.shineEvery, n++) add(at, 'shine', n === 0 ? 0.9 : 0.4, n === 0 ? 'Logo lands with a shine' : 'Logo shine (repeat)');
  return cues.sort((a, b) => a.at - b.at);
};
