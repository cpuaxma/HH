import React from 'react';
import {Easing} from 'remotion';
import {SERIF} from '../fonts';
import {exit, lerp, POP, springAt, tween} from '../lib/anim';
import {useTimelineFrame} from '../lib/frame';
import {NAVY, TAGLINE, TAGLINE_SIZE, TAGLINE_TOP, WIDTH} from '../theme';
import {T} from '../timeline';

const TRACKING = 0.06; // em
let ctx: CanvasRenderingContext2D | null = null;
const measure = (text: string) => {
	ctx = ctx ?? document.createElement('canvas').getContext('2d');
	ctx!.font = `800 ${TAGLINE_SIZE}px "${SERIF}"`;
	return ctx!.measureText(text).width;
};

const TYPE = {...POP, damping: 14};

/** Beat 6 — "THE COOKIE PLUG" types in, letter by letter, with a gliding cursor. */
export const Tagline: React.FC = () => {
	const f = useTimelineFrame();
	const chars = TAGLINE.split('');
	const track = TRACKING * TAGLINE_SIZE;
	const widths = chars.map((c) => measure(c) + track);
	const total = widths.reduce((a, b) => a + b, 0) - track;
	const edges = [0];
	widths.forEach((w) => edges.push(edges[edges.length - 1] + w));
	const left = (WIDTH - total) / 2;

	// Cursor glides continuously along the typed edge.
	const u = Math.max(0, (f - T.typeStart) / T.typeStagger);
	const k = Math.min(chars.length - 1, Math.floor(u));
	const caret = u >= chars.length ? edges[chars.length] - track : lerp(edges[k], edges[k + 1], Easing.inOut(Easing.quad)(u - k));
	const cursorIn = tween(f, [T.typeStart - 8, T.typeStart], [0, 1], Easing.out(Easing.cubic));
	const cursorBreath = f > T.typeStart + chars.length * T.typeStagger ? 0.75 + 0.25 * Math.cos((f - T.typeStart - chars.length * T.typeStagger) / 6) : 1;
	const cursor = cursorIn * cursorBreath * exit(f, ...T.cursorOut);

	return (
		<div style={{position: 'absolute', left, top: TAGLINE_TOP, width: total, height: TAGLINE_SIZE * 1.2}}>
			{chars.map((c, i) => {
				const p = springAt(f, T.typeStart + i * T.typeStagger, TYPE);
				if (p <= 0) return null;
				return (
					<span
						key={i}
						style={{
							position: 'absolute',
							left: edges[i],
							top: 0,
							fontFamily: SERIF,
							fontWeight: 800,
							fontSize: TAGLINE_SIZE,
							lineHeight: 1.2,
							color: NAVY,
							opacity: Math.min(1, p * 2.5),
							transform: `translateY(${(1 - p) * 26}px) scale(${0.6 + 0.4 * p})`,
							transformOrigin: '50% 80%',
							whiteSpace: 'pre',
						}}
					>
						{c}
					</span>
				);
			})}
			{cursor > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: caret + 6,
						top: TAGLINE_SIZE * 0.17,
						width: 6,
						height: TAGLINE_SIZE * 0.9,
						backgroundColor: NAVY,
						opacity: cursor,
						transform: `scaleY(${cursor})`,
					}}
				/>
			) : null}
		</div>
	);
};

/** Beat 6 — little nod (degrees, about the neck) that leads into the hat tip. */
export const nod = (f: number) =>
	-4.5 * tween(f, [T.hatTip - 14, T.hatTip], [0, 1], Easing.out(Easing.cubic)) +
	4.5 * tween(f, [T.hatTip + 6, T.hatTip + 28], [0, 1], Easing.inOut(Easing.cubic));

/** Beat 6 — hat lifts and tips forward on beat 16, then eases home for the end card. */
export const hatTip = (f: number) => {
	const up = springAt(f, T.hatTip - 12, {stiffness: 240, damping: 15, mass: 0.8});
	const down = tween(f, [T.hatTip + 10, T.hatTip + 32], [0, 1], Easing.inOut(Easing.cubic));
	const t = up * (1 - down);
	return {dy: -11 * t, rotate: -10 * t};
};
