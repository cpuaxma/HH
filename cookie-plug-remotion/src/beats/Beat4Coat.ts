import {landOn, punchEnvelope, ring, springAt, POP, tween} from '../lib/anim';
import {Easing} from 'remotion';
import {T} from '../timeline';

const YANK = {stiffness: 190, damping: 12, mass: 0.8};

/**
 * Beat 4 — coat angle in degrees around the hinge. 180 = closed over the torso (we see the
 * rebuilt coat front), 0 = open showing the cookie lining. The spring overshoots past open.
 */
export const coatAngle = (f: number) => {
	const open = 180 * (1 - landOn(f, T.coatYank, YANK));
	const present = -9 * ring(f - T.present, 0.32, 9); // little "check these out" flap on beat 10
	return open + present;
};

/** Right coat flap: whips out from the shoulder on the yank, small reactions on later hits. */
export const flapAngle = (f: number) =>
	-7 * ring(f - T.coatYank, 0.3, 9) -
	2.2 * ring(f - T.cookieImpact, 0.4, 7) -
	2.2 * ring(f - T.dealerImpact, 0.4, 7);

/** Cookie i pops 0 → 1.15 → 1 with a tiny twist, 3 frames apart; all pulse on the "present" beat. */
export const cookiePop = (f: number, i: number) => {
	const s = springAt(f, T.cookiesStart + i * T.cookieStagger, POP);
	const pulse = 0.09 * punchEnvelope(f - (T.present + i), 4);
	const dir = i % 2 ? 1 : -1;
	return {scale: s * (1 + pulse), rotate: dir * 16 * (1 - s)};
};

/** Brow raise on beat 11 (also lifts while the shades are down). */
export const browLift = (f: number, glassesDown: number) =>
	-0.18 * glassesDown - 3 * tween(f, [T.browRaise - 10, T.browRaise], [0, 1], Easing.out(Easing.cubic)) +
	3 * tween(f, [T.browRaise + 14, T.browRaise + 26], [0, 1], Easing.inOut(Easing.cubic));

/** Whole-body squash when he yanks the coat. */
export const yankSquash = (f: number) => punchEnvelope(f - T.coatYank, 4);
