import {interpolate, spring} from 'remotion';
import {EASE} from '../brand';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [start, start+dur] with the entry ease. */
export const enter = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {...CLAMP, easing: EASE.enter});

/** 0→1 over [start, start+dur] with the move ease. */
export const move = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {...CLAMP, easing: EASE.move});

/** Linear clamp. */
export const lin = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], CLAMP);

export const spr = (f: number, start: number, fps: number, config: {damping: number; stiffness?: number; mass?: number}) =>
  spring({frame: f - start, fps, config});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** A soft continuous wobble for idle motion (never static). */
export const idle = (f: number, period: number, amp: number, phase = 0) => Math.sin(((f + phase) / period) * Math.PI * 2) * amp;

/** Western number with thousands separators. */
export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
