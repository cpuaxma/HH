import React from 'react';
import {useRenderFrame} from '../lib/frame';

export const BOIL_FILTER = 'line-boil';

// Line boil: the noise field that wobbles the line art changes every 3 frames ("on threes"),
// like a hand redrawing each drawing. Kept to ~2px so motion still reads perfectly smooth.
export const BOIL_EVERY = 3;
export const BOIL_PX = 2.4;

/** Global SVG filter definitions. Lives outside the motion-blur sampler so ids stay unique. */
export const FxDefs: React.FC = () => {
	const frame = useRenderFrame();
	const seed = (Math.floor(frame / BOIL_EVERY) % 97) + 1;
	return (
		<svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
			<defs>
				<filter id={BOIL_FILTER} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
					<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={seed} result="noise" />
					<feDisplacementMap in="SourceGraphic" in2="noise" scale={BOIL_PX * 2} xChannelSelector="R" yChannelSelector="G" />
				</filter>
			</defs>
		</svg>
	);
};
