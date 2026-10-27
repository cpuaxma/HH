import React, {useId} from 'react';
import {Easing} from 'remotion';
import {TracedLayer} from '../art';
import {NAVY} from '../theme';

export const useSvgId = () => 'i' + useId().replace(/[^a-zA-Z0-9]/g, '');

/**
 * A traced layer in navy. While `progress` is between 0 and 1 the line art draws itself on:
 * a fat white stroke runs along every potrace outline (strokeDashoffset) and is used as a mask,
 * so the real hand-drawn line appears along its own path. `solid` layers (shades, shoes) then
 * flood-fill their interior.
 */
export const Ink: React.FC<{layer: TracedLayer; progress?: number; solid?: boolean; reveal?: number}> = ({
	layer,
	progress = 1,
	solid = false,
	reveal = 7,
}) => {
	const id = useSvgId();
	if (progress <= 0) return null;
	// Hairline stroke closes anti-alias seams between neighbouring layers.
	if (progress >= 1) return <path d={layer.d} fill={NAVY} stroke={NAVY} strokeWidth={0.35} />;

	const p = Easing.out(Easing.quad)(progress);
	const fill = solid ? Easing.inOut(Easing.quad)(Math.max(0, (progress - 0.45) / 0.55)) : 0;
	return (
		<g>
			<mask id={id} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1200} height={1300}>
				{layer.subpaths.map((d, i) => (
					<path
						key={i}
						d={d}
						fill="none"
						stroke="#fff"
						strokeWidth={reveal}
						strokeLinecap="round"
						strokeLinejoin="round"
						pathLength={1}
						strokeDasharray="1 1"
						strokeDashoffset={1 - p}
					/>
				))}
			</mask>
			<path d={layer.d} fill={NAVY} mask={`url(#${id})`} />
			{fill > 0 ? <path d={layer.d} fill={NAVY} opacity={fill} /> : null}
		</g>
	);
};

/** Hand-rebuilt line (parts the poster never shows), drawn on with a plain dash reveal. */
export const Line: React.FC<{d: string; progress?: number; width?: number}> = ({d, progress = 1, width = 3.3}) => {
	if (progress <= 0) return null;
	const p = Easing.out(Easing.quad)(Math.min(1, progress));
	return (
		<path
			d={d}
			fill="none"
			stroke={NAVY}
			strokeWidth={width}
			strokeLinecap="round"
			strokeLinejoin="round"
			pathLength={1}
			strokeDasharray="1 1"
			strokeDashoffset={1 - p}
		/>
	);
};
