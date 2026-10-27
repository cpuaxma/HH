import React from 'react';
import {Easing} from 'remotion';
import {COOKIE_CENTERS, FILLS, LAYERS, PIVOTS} from './art';
import {drawProgress, hatDrop} from './beats/Beat2DrawOn';
import {glassesDrop, glint, headTilt, pupilX} from './beats/Beat3Shades';
import {browLift, coatAngle, cookiePop, flapAngle, yankSquash} from './beats/Beat4Coat';
import {shoeTap, slamReaction} from './beats/Beat5Slam';
import {hatTip, nod} from './beats/Beat6EndCard';
import {bandBox, bandPx, BandSvg} from './components/Band';
import {Ink, Line, useSvgId} from './components/Ink';
import {lerp, tween} from './lib/anim';
import {useTimelineFrame} from './lib/frame';
import {NAVY, PAPER} from './theme';
import {T} from './timeline';

const rot = (deg: number, [x, y]: [number, number]) => `rotate(${deg} ${x} ${y})`;

// ---------------------------------------------------------------- rebuilt parts
// The poster never shows these, so they're drawn here in the same line weight.
const FACE_EDGE = 'M333 184 C331 193 326 200 321 208 C318 214 317.5 224 318.5 236'; // hidden under left lens
const eye = (x: number, y: number) =>
	`M${x - 6.5} ${y} C${x - 4} ${y - 4.8} ${x + 4} ${y - 4.8} ${x + 6.5} ${y - 0.4} C${x + 4} ${y + 3.8} ${x - 4} ${y + 3.6} ${x - 6.5} ${y} Z`;
const EYES: [number, number][] = [
	[358, 198],
	[411, 197.5],
];
// Closed coat front = the cookie panel's silhouette mirrored across the hinge, plus buttons/pocket.
const COAT_BUTTONS: [number, number][] = [
	[466, 392],
	[468, 452],
];
const COAT_POCKET = 'M393 492 C405 490.5 422 491 438 493';
const STAR = 'M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9 Z';

/** Shared 3D wrapper for the two faces of the left coat half (rotates around the hinge). */
const CoatFace: React.FC<{angle: number; children: React.ReactNode}> = ({angle, children}) => {
	const [hx, hy] = bandPx('character', PIVOTS.hinge);
	return (
		<div
			style={{
				position: 'absolute',
				...bandBox('character'),
				transformOrigin: `${hx}px ${hy}px`,
				transform: `perspective(1700px) rotateY(${angle}deg)`,
			}}
		>
			<BandSvg band="character" style={{left: 0, top: 0}}>
				{children}
			</BandSvg>
		</div>
	);
};

const Cookies: React.FC<{f: number}> = ({f}) => (
	<>
		{COOKIE_CENTERS.map(([cx, cy], i) => {
			const {scale, rotate} = cookiePop(f, i);
			if (scale <= 0.001) return null;
			return (
				<g key={i} transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale}) translate(${-cx} ${-cy})`}>
					<Ink layer={LAYERS[`cookie_${i}`]} />
				</g>
			);
		})}
	</>
);

const Glasses: React.FC<{f: number}> = ({f}) => {
	const clipId = useSvgId();
	const g = glint(f);
	const x = lerp(300, 452, g.sweep);
	const shine = Math.sin(Math.PI * g.sweep);
	return (
		<g>
			<Ink layer={LAYERS.glasses} progress={drawProgress(f, 'glasses')} solid reveal={9} />
			{shine > 0.001 ? (
				<>
					<clipPath id={clipId}>
						<path d={LAYERS.glasses.d} />
					</clipPath>
					<g clipPath={`url(#${clipId})`} opacity={0.92 * shine}>
						<rect x={x - 5} y={150} width={10} height={140} fill={PAPER} transform={`rotate(24 ${x} 215)`} />
						<rect x={x + 10} y={150} width={3.5} height={140} fill={PAPER} transform={`rotate(24 ${x} 215)`} />
					</g>
				</>
			) : null}
			{g.sparkle > 0.001 ? (
				<path d={STAR} fill={PAPER} transform={`translate(427 199) scale(${0.62 * g.sparkle}) rotate(${g.sparkle * 45})`} />
			) : null}
		</g>
	);
};

/** The dealer rig. Every moving part is a separate traced layer; motion comes from beats/*. */
export const Character: React.FC = () => {
	const f = useTimelineFrame();

	// Whole-body life: breathing once he's drawn, squash on the yank, flinch on the title slams.
	const alive = tween(f, [T.draw.shoes[1], T.hatLand + 10], [0, 1]);
	const breath = alive * 0.006 * Math.sin(((f - T.hatLand) / 120) * Math.PI * 2);
	const react = slamReaction(f);
	const squash = 0.03 * yankSquash(f) + react.squash;
	const [fx, fy] = bandPx('character', PIVOTS.feet);
	const box = bandBox('character');

	const angle = coatAngle(f);
	const showFront = angle < 90;
	const gDrop = glassesDrop(f);
	const hat = hatDrop(f);
	const tip = hatTip(f);
	const headRot = headTilt(f) + nod(f);
	const px = pupilX(f);
	const coatDraw = drawProgress(f, 'coatBack');

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				transformOrigin: `${box.left + fx}px ${box.top + fy}px`,
				transform: `translateY(${react.dy}px) rotate(${px * 0.5}deg) scale(${1 - squash * 0.5}, ${1 + breath - squash})`,
			}}
		>
			{/* Left coat half, lining side (cookies) — sits behind the sleeve. */}
			{showFront ? (
				<CoatFace angle={angle}>
					<path d={FILLS.panel_fill} fill={PAPER} />
					<Ink layer={LAYERS.panel} />
					<Cookies f={f} />
				</CoatFace>
			) : null}

			<BandSvg band="character">
				<Ink layer={LAYERS.body} progress={drawProgress(f, 'body')} />
				<g transform={rot(flapAngle(f), PIVOTS.shoulder)}>
					<Ink layer={LAYERS.flap} progress={drawProgress(f, 'flap')} />
				</g>
			</BandSvg>

			{/* Left coat half, outside face: the closed coat (rebuilt), swings open on the yank. */}
			{!showFront && coatDraw > 0 ? (
				<CoatFace angle={angle - 180}>
					<g transform={`translate(${PIVOTS.hinge[0] * 2} 0) scale(-1 1)`}>
						<path d={FILLS.panel_fill} fill={PAPER} opacity={tween(coatDraw, [0.3, 1], [0, 1])} />
						<path
							d={FILLS.panel_fill}
							fill="none"
							stroke={NAVY}
							strokeWidth={3.3}
							strokeLinejoin="round"
							pathLength={1}
							strokeDasharray="1 1"
							strokeDashoffset={1 - Easing.out(Easing.quad)(coatDraw)}
						/>
					</g>
					<Line d={COAT_POCKET} progress={tween(coatDraw, [0.5, 1], [0, 1])} width={3} />
					{COAT_BUTTONS.map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r={3.6 * tween(coatDraw, [0.6 + i * 0.15, 0.85 + i * 0.15], [0, 1], Easing.out(Easing.back(3)))} fill={NAVY} />
					))}
				</CoatFace>
			) : null}

			<BandSvg band="character">
				<Ink layer={LAYERS.shoe_left} progress={drawProgress(f, 'shoes')} solid reveal={9} />
				<g transform={rot(shoeTap(f), PIVOTS.rightHeel)}>
					<Ink layer={LAYERS.shoe_right} progress={drawProgress(f, 'shoes')} solid reveal={9} />
				</g>

				<g transform={rot(headRot, PIVOTS.neck)}>
					<Ink layer={LAYERS.head} progress={drawProgress(f, 'head')} />
					<Line d={FACE_EDGE} progress={drawProgress(f, 'head')} width={3.2} />
					{gDrop > 0.2
						? EYES.map(([x, y], i) => (
								<g key={i}>
									<path d={eye(x, y)} fill="none" stroke={NAVY} strokeWidth={1.7} strokeLinejoin="round" />
									<circle cx={x + px} cy={y + 0.3} r={2.5} fill={NAVY} />
								</g>
							))
						: null}
					<g transform={`translate(0 ${browLift(f, gDrop)})`}>
						<Ink layer={LAYERS.brows} progress={drawProgress(f, 'brows')} />
					</g>
					<g transform={`translate(0 ${gDrop})`}>
						<Glasses f={f} />
					</g>

					{hat.visible ? (
						<g
							transform={[
								`translate(0 ${hat.dy + tip.dy})`,
								rot(hat.rotate, PIVOTS.hatCenter),
								rot(tip.rotate, PIVOTS.hatTipPivot),
								`translate(393 186) scale(${hat.sx} ${hat.sy}) translate(-393 -186)`,
							].join(' ')}
						>
							<path d={FILLS.hat_fill} fill={PAPER} />
							<Ink layer={LAYERS.hat} />
						</g>
					) : null}
				</g>
			</BandSvg>
		</div>
	);
};
