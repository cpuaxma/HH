import {Moment, MOMENTS} from '../notifications';
import {CUE} from '../timeline';

// Which time jump is running (or last ran) at a frame.
export const jumpAt = (frame: number): {from: Moment; to: Moment; start: number} | null => {
  let j = -1;
  CUE.jumps.forEach((start, i) => {
    if (frame >= start) j = i;
  });
  if (j < 0) return null;
  return {from: MOMENTS[j], to: MOMENTS[j + 1], start: CUE.jumps[j]};
};

export const timeText = (m: Moment) => `${m.hour}:${String(m.minute).padStart(2, '0')}`;
export const dateText = (m: Moment) => `${m.weekday}, ${m.date}`;
