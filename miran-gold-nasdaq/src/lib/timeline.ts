import {interpolate} from 'remotion';
import {BEATS, SCENES, TEXT} from '../config';
import {clamp, EASE} from './motion';

/**
 * Value of the scene-2 counter (0 → 100) at a scene-local frame.
 * Shared by the title counter and the dot grid so each dot lands with its number.
 */
export const counterValue = (localFrame: number) =>
  interpolate(localFrame, [BEATS.whatIs.counterFrom, BEATS.whatIs.counterTo], [0, TEXT.whatIs.counterTo], {
    ...clamp,
    easing: EASE.inOut,
  });

/** Frame relative to a scene's start. */
export const local = (frame: number, scene: keyof typeof SCENES) => frame - SCENES[scene].from;
