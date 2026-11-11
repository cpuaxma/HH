import {T} from '../timeline';

/** Radius of the expanding wipe ring at wall time t (0 before the impact). */
export const ringRadius = (t: number) => {
  const x = t - T.impact;
  if (x <= 0) return 0;
  return 36 * (1 - Math.exp(-x * 2.3)) + 2.0 * x;
};
