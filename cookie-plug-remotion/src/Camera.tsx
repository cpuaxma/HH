import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {punchEnvelope, ring, tween} from './lib/anim';
import {useTimelineFrame} from './lib/frame';
import {T} from './timeline';

// [frame, punch-zoom amount, shake px]
const HITS: [number, number, number][] = [
	[T.supportImpact, 0.075, 22],
	[T.yourImpact, 0.022, 7],
	[T.localImpact, 0.032, 10],
	[T.hatLand, 0.012, 5],
	[T.coatYank, 0.03, 11],
	[T.present, 0.01, 0],
	[T.cookieImpact, 0.07, 24],
	[T.dealerImpact, 0.07, 24],
	[T.shoeTap, 0.008, 3],
	[T.hatTip, 0.008, 0],
];

/** Camera layer: slow push-in for the whole piece, punch-zoom + damped shake on every hit. */
export const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useTimelineFrame();
	const push = tween(f, [0, T.pushEnd], [1, 1.045], Easing.inOut(Easing.sin));
	// Slow leans so the quieter beats never sit still: in on his face for the shades bit,
	// then over to the cookies, each released just before the next big hit.
	const ease = Easing.inOut(Easing.cubic);
	const onFace = tween(f, T.focusFace[0], [0, 1], ease) * (1 - tween(f, T.focusFace[1], [0, 1], ease));
	const onCookies = tween(f, T.focusCookies[0], [0, 1], ease) * (1 - tween(f, T.focusCookies[1], [0, 1], ease));
	const lean = 1 + 0.07 * onFace + 0.05 * onCookies;
	let punch = 0;
	let x = 55 * onCookies;
	let y = 75 * onFace + 10 * onCookies;
	let r = 0;
	for (const [at, amount, shake] of HITS) {
		const t = f - at;
		punch += amount * punchEnvelope(t, 5);
		x += shake * ring(t, 1.05, 6);
		y += shake * 0.7 * ring(t, 1.4, 6);
		r += shake * 0.018 * ring(t, 0.85, 7);
	}
	return (
		<AbsoluteFill
			style={{
				transformOrigin: '540px 1000px',
				transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${push * lean * (1 + punch)})`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
