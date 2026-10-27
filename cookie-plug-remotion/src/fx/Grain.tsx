import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useRenderFrame} from '../lib/frame';

/** Very light film grain over the whole frame, new pattern every frame. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const frame = useRenderFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity}}>
			<svg width="100%" height="100%">
				<filter id="grain" x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={(frame % 211) + 1} />
					<feColorMatrix type="saturate" values="0" />
					<feComponentTransfer>
						<feFuncR type="linear" slope="1.6" intercept="-0.25" />
						<feFuncG type="linear" slope="1.6" intercept="-0.25" />
						<feFuncB type="linear" slope="1.6" intercept="-0.25" />
					</feComponentTransfer>
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};
