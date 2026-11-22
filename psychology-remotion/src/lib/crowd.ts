import {CUES} from '../config';
import {shapeWeights} from './director';
import {EASE, ease, monotoneCubic} from './motion';
import {STAGE_S, TRACK_LENGTH, V3, shapeAtU} from './track';

export const U_PEAK = STAGE_S.peak / TRACK_LENGTH;
export const U_BOTTOM = STAGE_S.despondency / TRACK_LENGTH;
const [r0, r1, r2, r3] = CUES.crowd.run;
const path = monotoneCubic([
  {x: r0, y: 0.02},
  {x: r1, y: U_PEAK},
  {x: r2, y: U_BOTTOM},
  {x: r3, y: 0.985},
]);

/** Both replay orbs ride the flat chart together: the crowd just above the line, the wise one just below. */
export const CROWD_OFFSET = 2.4;
export const crowdU = (f: number) => path(f);
export const crowdPos = (f: number, who: 'crowd' | 'wise'): V3 => {
  const p = shapeAtU(crowdU(f), shapeWeights(f), f);
  return [p[0], p[1] + (who === 'crowd' ? CROWD_OFFSET : -CROWD_OFFSET), p[2] + 0.5];
};
export const crowdOpacity = (f: number) => ease(f, [CUES.crowd.orbsIn, CUES.crowd.orbsIn + 8]) * (1 - ease(f, [988, 1004], [0, 1], EASE.in));
/** Where the pins stand (on the line at the peak and the bottom). */
export const PIN_AT = {peak: U_PEAK, bottom: U_BOTTOM};
