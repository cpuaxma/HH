// Time-based look parameters shared by the renderer: desaturation, neon, impact frame,
// and how many motion-blur samples each frame gets.
import {T} from '../data';
import {easeInOut, ramp} from './ease';

/** Everything but the hero drains of colour as the scroll stops, and stays that way. */
export const desatAt = (t: number) => ramp(t, T.brake + 1, T.brake + 13, easeInOut);

/** The hero's neon flickers on right after the stop (deterministic on/off steps). */
const NEON_STEPS: [number, number][] = [
  [5, 0.75],
  [8, 0.1],
  [11, 0.9],
  [13, 0.25],
  [17, 1],
];
export const neonAt = (t: number) => {
  const u = t - T.brake;
  let v = 0;
  for (const [at, level] of NEON_STEPS) if (u >= at) v = level;
  return v;
};

/** The impact frame: one frame at the stop gets an exposure kick. */
export const flashAt = (frame: number) => (frame === T.brake + 1 ? 1 : frame === T.brake + 2 ? 0.35 : 0);
