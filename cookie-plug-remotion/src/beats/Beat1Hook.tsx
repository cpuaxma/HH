import React from 'react';
import {letters, unionBox} from '../art';
import {BandSvg} from '../components/Band';
import {Ink} from '../components/Ink';
import {firstCrossing, landOn, punchEnvelope, SLAM, tween} from '../lib/anim';
import {useTimelineFrame} from '../lib/frame';
import {BANDS, S} from '../theme';
import {T} from '../timeline';

const STAMP = {stiffness: 300, damping: 16, mass: 0.8};
// ~10% overshoot; soft enough that it is already moving on frame 0 (the hook frame).
const BIG_SLAM = {stiffness: 140, damping: 14.3, mass: 1};

/**
 * Word that lands on `impact`: flies in from `fromScale` (scale is interpolated in log space so
 * the spring's overshoot reads as a squash, never a collapse) and `fromOffset`, then a quick
 * vertical squash on contact.
 */
const SlamWord: React.FC<{
	word: string;
	impact: number;
	fromScale: number;
	fromRotate: number;
	fromOffset?: [number, number];
	config: typeof SLAM;
	fadeFrames?: number;
}> = ({word, impact, fromScale, fromRotate, fromOffset = [0, 0], config, fadeFrames = 0}) => {
	const f = useTimelineFrame();
	const glyphs = letters(word);
	const start = impact - firstCrossing(config);
	if (f < start && start > 0) return null;
	const p = landOn(f, impact, config);
	const [x0, y0, x1, y1] = unionBox(glyphs);
	const cx = (x0 + x1) / 2;
	const cy = (y0 + y1) / 2;
	const s = fromScale ** (1 - p);
	const squash = punchEnvelope(f - impact, 3.5);
	const sx = s * (1 + 0.05 * squash);
	const sy = s * (1 - 0.09 * squash);
	const rot = fromRotate * (1 - p);
	const [ox, oy] = fromOffset.map((v) => v * (1 - p));
	const opacity = fadeFrames ? tween(f, [start, start + fadeFrames], [0, 1]) : 1;
	return (
		<g
			opacity={opacity}
			transform={`translate(${cx + ox} ${cy + oy}) rotate(${rot}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`}
		>
			{glyphs.map((g, i) => (
				<Ink key={i} layer={g} />
			))}
		</g>
	);
};

// Poster units from the headline's resting place to the middle of the frame.
const TO_SCREEN_CENTER = (960 - BANDS.headline.top) / S - (52 - BANDS.headline.y0);

/** Beat 1 — "SUPPORT" slams in from huge, "YOUR" and "LOCAL" stamp in on the next half-beats. */
export const Beat1Hook: React.FC = () => (
	<BandSvg band="headline">
		<SlamWord
			word="SUPPORT"
			impact={T.supportImpact}
			fromScale={2.2}
			fromRotate={-6}
			fromOffset={[0, TO_SCREEN_CENTER]}
			config={BIG_SLAM}
		/>
		<SlamWord word="YOUR" impact={T.yourImpact} fromScale={1.9} fromRotate={-8} config={STAMP} fadeFrames={3} />
		<SlamWord word="LOCAL" impact={T.localImpact} fromScale={1.9} fromRotate={7} config={STAMP} fadeFrames={3} />
	</BandSvg>
);
