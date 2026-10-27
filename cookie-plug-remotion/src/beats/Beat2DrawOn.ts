import {Easing} from 'remotion';
import {landOn, punchEnvelope, ring, tween} from '../lib/anim';
import {T} from '../timeline';

/** Beat 2 — line reveal progress for one part of the dealer (head first, shoes last). */
export const drawProgress = (f: number, part: keyof typeof T.draw) =>
	tween(f, T.draw[part], [0, 1], Easing.inOut(Easing.sin));

// Near-critically damped so it never sinks into his face; the bounce is an explicit little hop.
const HAT_DROP = {stiffness: 150, damping: 19.6, mass: 1};

/** Beat 2 — the hat falls from above the frame (behind the headline) and lands on the beat. */
export const hatDrop = (f: number) => {
	const p = landOn(f, T.hatLand, HAT_DROP);
	const impact = punchEnvelope(f - T.hatLand, 3.5);
	return {
		dy: -330 * (1 - p) - 7 * Math.max(0, ring(f - T.hatLand, 0.3, 6)),
		rotate: -16 * (1 - p),
		sx: 1 + 0.07 * impact,
		sy: 1 - 0.13 * impact,
		visible: p > 0,
	};
};
