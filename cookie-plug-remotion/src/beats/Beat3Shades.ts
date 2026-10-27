import {Easing} from 'remotion';
import {exit, landOn, tween} from '../lib/anim';
import {T} from '../timeline';

const GLASSES = {stiffness: 220, damping: 14, mass: 0.9};
const DART = {stiffness: 520, damping: 26, mass: 0.6};

/** Beat 3 — shades slide down the nose (with a little overshoot), then push back up. */
export const glassesDrop = (f: number) =>
	13 * (landOn(f, T.glassesDown, GLASSES) - landOn(f, T.glassesUp, GLASSES)) +
	// Beat 4 callback: a second, shorter peek over the shades straight at camera.
	9 * (landOn(f, T.peek[0], GLASSES) - landOn(f, T.peek[1], GLASSES));

const DART_TARGETS = [-3.4, 3.4, -3.4, 0];
/** Beat 3 — pupils dart left, right, left, centre — one move per half-beat. */
export const pupilX = (f: number) => {
	let x = 0;
	let prev = 0;
	DART_TARGETS.forEach((target, i) => {
		x += (target - prev) * landOn(f, T.eyeDarts[i], DART);
		prev = target;
	});
	return x;
};

/** Head follows the eyes a touch. */
export const headTilt = (f: number) => pupilX(f) * 0.35;

/** Beat 3 — glint sweep across the lenses (0..1), plus the sparkle that ends it. */
export const glint = (f: number) => ({
	sweep: tween(f, T.glint, [0, 1], Easing.inOut(Easing.cubic)),
	sparkle:
		tween(f, [T.glint[1] - 8, T.glint[1]], [0, 1], Easing.out(Easing.back(2))) *
		exit(f, T.glint[1] + 2, T.glint[1] + 12),
});
