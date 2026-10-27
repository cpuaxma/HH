import React from 'react';
import {Easing} from 'remotion';
import {letters, unionBox} from '../art';
import {BandSvg} from '../components/Band';
import {Ink} from '../components/Ink';
import {firstCrossing, landOn, punchEnvelope, ring, tween} from '../lib/anim';
import {useTimelineFrame} from '../lib/frame';
import {T} from '../timeline';

const HEAVY = {stiffness: 210, damping: 22.8, mass: 1.1}; // ~3% overshoot: heavy, no float
const LETTER_STAGGER = 0.3;

/** A heavy word that rises from below the frame and slams into place on `impact`. */
const RisingWord: React.FC<{word: string; impact: number}> = ({word, impact}) => {
	const f = useTimelineFrame();
	const glyphs = letters(word);
	const [, , , baseline] = unionBox(glyphs);
	if (f < impact - firstCrossing(HEAVY)) return null;
	return (
		<g>
			{glyphs.map((g, i) => {
				const hit = impact + i * LETTER_STAGGER;
				const p = landOn(f, hit, HEAVY);
				if (p <= 0) return null;
				const cx = (g.bbox[0] + g.bbox[2]) / 2;
				const squash = punchEnvelope(f - hit, 3.5);
				const s = 1 + 0.25 * (1 - p);
				const sx = s * (1 + 0.07 * squash);
				const sy = s * (1 - 0.14 * squash);
				const dy = 420 * (1 - p);
				return (
					<g
						key={i}
						transform={`translate(${cx} ${baseline + dy}) scale(${sx} ${sy}) translate(${-cx} ${-baseline})`}
					>
						<Ink layer={g} />
					</g>
				);
			})}
		</g>
	);
};

/** Beat 5 — "COOKIE" then "DEALER" slam up from below, one beat apart. */
export const Beat5Slam: React.FC = () => (
	<BandSvg band="title">
		<RisingWord word="COOKIE" impact={T.cookieImpact} />
		<RisingWord word="DEALER" impact={T.dealerImpact} />
	</BandSvg>
);

/** Beat 5 — the dealer flinches up off the ground on each slam (anticipation dip before). */
export const slamReaction = (f: number) => {
	const dip =
		tween(f, [T.browRaise + 6, T.cookieImpact - 2], [0, 1], Easing.inOut(Easing.sin)) *
		(1 - tween(f, [T.cookieImpact - 2, T.cookieImpact + 3], [0, 1], Easing.out(Easing.cubic)));
	const hop = punchEnvelope(f - T.cookieImpact, 4) + 0.8 * punchEnvelope(f - T.dealerImpact, 4);
	return {dy: -16 * hop, squash: 0.02 * dip - 0.012 * hop};
};

/** Beat 5 — right toe lifts and taps down on beat 14. */
export const shoeTap = (f: number) => {
	const lift = tween(f, [T.shoeTap - 16, T.shoeTap - 6], [0, 1], Easing.out(Easing.cubic));
	const drop = tween(f, [T.shoeTap - 6, T.shoeTap], [0, 1], Easing.in(Easing.cubic));
	return -13 * lift * (1 - drop) + 2.5 * ring(f - T.shoeTap, 0.6, 4);
};
