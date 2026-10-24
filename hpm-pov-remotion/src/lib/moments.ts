import {Moment, MOMENTS} from '../notifications';
import {CUE} from '../timeline';

export type ActiveJump = {from: Moment; to: Moment; start: number; reverse: boolean};

// The time jump that is running (or last ran) at a frame; null before the first one.
export const jumpAt = (frame: number): ActiveJump | null => {
  let active: ActiveJump | null = null;
  for (const j of CUE.jumps) {
    if (frame >= j.at) active = {from: MOMENTS[j.from], to: MOMENTS[j.to], start: j.at, reverse: Boolean(j.reverse)};
  }
  return active;
};

// What the lock screen shows before any jump.
export const START_MOMENT = MOMENTS[CUE.startMoment];

export const timeText = (m: Moment) => `${m.hour}:${String(m.minute).padStart(2, '0')}`;
export const dateText = (m: Moment) => `${m.weekday}, ${m.date}`;
