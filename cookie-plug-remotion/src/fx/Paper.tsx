import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PAPER} from '../theme';

/** Static off-white stock with soft mottling and fine tooth. */
export const Paper: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: PAPER}}>
		<svg width="100%" height="100%" style={{position: 'absolute'}}>
			<filter id="paper-mottle" x="0" y="0" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.004 0.006" numOctaves={3} seed={7} />
				<feColorMatrix type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.31  0 0 0 0 0.24  0 0 0 0.9 -0.38" />
			</filter>
			<filter id="paper-tooth" x="0" y="0" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={3} />
				<feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.27  0 0 0 0 0.22  0 0 0 -1.4 0.86" />
			</filter>
			<rect width="100%" height="100%" filter="url(#paper-mottle)" opacity={0.1} />
			<rect width="100%" height="100%" filter="url(#paper-tooth)" opacity={0.08} />
		</svg>
	</AbsoluteFill>
);
