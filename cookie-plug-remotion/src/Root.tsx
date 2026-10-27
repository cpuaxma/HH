import React from 'react';
import {Composition} from 'remotion';
import {CookieDealer, CookieDealerProps} from './CookieDealer';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

const common = {component: CookieDealer, durationInFrames: DURATION, fps: FPS, width: WIDTH, height: HEIGHT};
const SAMPLES = 8;

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="CookieDealer" {...common} defaultProps={{backdrop: 'paper', motionBlurSamples: SAMPLES}} />
		<Composition id="CookieDealerAlpha" {...common} defaultProps={{backdrop: 'transparent', motionBlurSamples: SAMPLES}} />
		<Composition id="CookieDealerGreen" {...common} defaultProps={{backdrop: 'green', motionBlurSamples: SAMPLES}} />
	</>
);
