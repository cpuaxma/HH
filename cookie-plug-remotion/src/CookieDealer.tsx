import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import './fonts';
import {Beat1Hook} from './beats/Beat1Hook';
import {Beat5Slam} from './beats/Beat5Slam';
import {Tagline} from './beats/Beat6EndCard';
import {Camera} from './Camera';
import {Character} from './Character';
import {BOIL_FILTER, FxDefs} from './fx/FxDefs';
import {Grain} from './fx/Grain';
import {Paper} from './fx/Paper';
import {Beat, RenderFrameContext} from './lib/frame';
import {Backdrop, CHROMA_GREEN, PAPER} from './theme';
import {isFast, T} from './timeline';

export type CookieDealerProps = {backdrop: Backdrop; motionBlurSamples: number};

/** One camera pass, motion-blurred on fast frames. `filter` runs once on the blurred result. */
const Pass: React.FC<{samples: number; filter?: string; children: React.ReactNode}> = ({samples, filter, children}) => (
	<AbsoluteFill style={{filter}}>
		{samples > 1 ? (
			<CameraMotionBlur samples={samples} shutterAngle={180}>
				<Camera>{children}</Camera>
			</CameraMotionBlur>
		) : (
			<Camera>{children}</Camera>
		)}
	</AbsoluteFill>
);

/**
 * Timeline (every frame is named in timeline.ts):
 *   1 Hook        0–60    SUPPORT slam, YOUR / LOCAL stamps
 *   2 Dealer      48→     draw-on + hat drop; the same rig plays beat 3 (shades),
 *                         beat 4 (coat + cookies) and the beat 6 nod / hat tip — see beats/*
 *   5 Slam        352→    COOKIE / DEALER rise and slam
 *   6 End card    436→    THE COOKIE PLUG types in, hold
 *
 * The dealer and the type are two passes through the same camera: the dealer pass gets the line
 * boil, the type stays crisp, and the type pass sits on top (the hat falls behind the headline).
 */
export const CookieDealer: React.FC<CookieDealerProps> = ({backdrop, motionBlurSamples}) => {
	const frame = useCurrentFrame();
	const samples = isFast(frame) ? motionBlurSamples : 1;
	const background = backdrop === 'paper' ? PAPER : backdrop === 'green' ? CHROMA_GREEN : 'transparent';
	return (
		<RenderFrameContext.Provider value={frame}>
			<AbsoluteFill style={{backgroundColor: background}}>
				<FxDefs />
				{backdrop === 'paper' ? <Paper /> : null}
				<Pass samples={samples} filter={`url(#${BOIL_FILTER})`}>
					<Beat name="2 Dealer: draw-on, shades, coat, nod" from={T.draw.head[0]}>
						<Character />
					</Beat>
				</Pass>
				<Pass samples={samples}>
					<Beat name="1 Hook: SUPPORT YOUR LOCAL" from={0}>
						<Beat1Hook />
					</Beat>
					<Beat name="5 Slam: COOKIE DEALER" from={T.cookieImpact - 20}>
						<Beat5Slam />
					</Beat>
					<Beat name="6 End card: THE COOKIE PLUG" from={T.typeStart - 8}>
						<Tagline />
					</Beat>
				</Pass>
				{backdrop === 'paper' ? <Grain /> : null}
			</AbsoluteFill>
		</RenderFrameContext.Provider>
	);
};
